import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AppointmentGroup } from '../models/AppointmentGroup';
import { Appointment } from '../models/Appointment';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { AppointmentHistory } from '../models/AppointmentHistory';
import { AppointmentReminder } from '../models/AppointmentReminder';
import { evaluateWaitingList } from './waitingList.controller';

export async function createGroupAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Use a transaction for atomic multi-resource scheduling
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { patientId, groupType, name, appointments: payloadAppts } = req.body;
    const tenantId = req.user?.tenantId;
    const hospitalId = req.user?.hospitalId || req.body.hospitalId;

    if (!Array.isArray(payloadAppts) || payloadAppts.length === 0) {
      throw new Error('An appointment group must contain at least one appointment');
    }

    const { Patient } = await import('../models/Patient');
    const patient = await Patient.findById(patientId).session(session);
    if (!patient) throw new NotFoundError('Patient not found');

    const group = await AppointmentGroup.create([{
      tenantId,
      hospitalId,
      patientId,
      groupType,
      name,
      status: 'Scheduled',
      appointments: []
    }], { session });

    const groupId = group[0]._id;
    const createdAppointmentIds: mongoose.Types.ObjectId[] = [];
    const appointmentDateMap: Record<string, Date> = {};

    // First pass: validate sequence and dependencies
    // Sort payload if Sequential to ensure dependencies are handled logically
    if (groupType === 'Sequential') {
      // In PRD: "Dependencies should prevent invalid scheduling sequences."
      // We assume payload is ordered. We will strictly validate that Appt(N) does not occur before Appt(N-1)
      let previousDate: Date | null = null;
      for (const [index, apptData] of payloadAppts.entries()) {
        const currentApptDate = new Date(`${apptData.date}T${apptData.time}`);
        
        if (previousDate && currentApptDate < previousDate) {
          throw new Error(`Invalid scheduling sequence: Appointment at index ${index} occurs before its prerequisite.`);
        }
        previousDate = currentApptDate;
      }
    }

    // Second pass: Create appointments
    let previousApptId: mongoose.Types.ObjectId | undefined = undefined;

    for (let i = 0; i < payloadAppts.length; i++) {
      const apptData = payloadAppts[i];
      const apptDate = new Date(apptData.date);
      
      // Token generation (simulated safely within transaction)
      const dayStart = new Date(apptDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(apptDate);
      dayEnd.setHours(23, 59, 59, 999);

      const countToday = await Appointment.countDocuments({
        doctorId: apptData.doctorId,
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $ne: 'Cancelled' }
      }).session(session);

      const tokenNumber = countToday + 1;

      const appt: any = await Appointment.create([{
        tenantId,
        hospitalId,
        departmentId: apptData.departmentId,
        patientId,
        patientName: patient.name,
        patientPhone: patient.phone,
        doctorId: apptData.doctorId,
        doctorName: apptData.doctorName || 'Unknown Doctor',
        date: apptDate,
        time: apptData.time,
        type: apptData.type || 'Consultation',
        status: 'Scheduled',
        tokenNumber,
        queuePosition: tokenNumber,
        appointmentGroupId: groupId,
        dependsOnAppointmentId: groupType === 'Sequential' ? previousApptId : undefined,
        referralId: apptData.referralId
      }], { session });

      createdAppointmentIds.push(appt[0]._id);
      previousApptId = appt[0]._id;

      // Initial history
      await AppointmentHistory.create([{
        tenantId,
        hospitalId,
        appointmentId: appt[0]._id,
        action: 'Created',
        newState: appt[0].toObject(),
        reason: `Created as part of group: ${name}`,
        changedBy: req.user?._id,
        ipAddress: req.ip
      }], { session });

      // Generate Reminders for each appointment
      await AppointmentReminder.create([{
        tenantId,
        hospitalId,
        appointmentId: appt[0]._id,
        patientId,
        type: 'Booking Confirmation',
        scheduledTime: new Date(),
        status: 'Scheduled',
        channel: patient.preferredCommunicationMethod || 'Email'
      }], { session });
    }

    // Link appointments to group
    group[0].appointments = createdAppointmentIds;
    await group[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate for response
    const populatedGroup = await AppointmentGroup.findById(groupId).populate('appointments');

    sendCreated(res, populatedGroup, 'Group appointment created successfully');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}

export async function getGroupAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await AppointmentGroup.findOne({ _id: req.params.id, tenantId: req.user?.tenantId })
      .populate('patientId', 'name uhid phone')
      .populate('appointments');
    
    if (!group) throw new NotFoundError('Appointment group not found');

    sendSuccess(res, group);
  } catch (err) {
    next(err);
  }
}

export async function rescheduleGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Bulk reschedule for groups - normally very complex as it needs to offset all dates.
  // For standard CRUD implementation, we assume the payload contains the new mappings.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason, appointmentUpdates } = req.body;
    // appointmentUpdates is an array of { id: string, date: string, time: string }

    const group = await AppointmentGroup.findOne({ _id: req.params.id, tenantId: req.user?.tenantId }).session(session);
    if (!group) throw new NotFoundError('Appointment group not found');

    for (const update of appointmentUpdates) {
      const oldAppt = await Appointment.findById(update.id).session(session);
      if (!oldAppt || oldAppt.appointmentGroupId?.toString() !== group._id.toString()) continue;

      const previousState = oldAppt.toObject();
      oldAppt.status = 'Rescheduled';
      await oldAppt.save({ session });

      // Token logic omitted for brevity in bulk iteration, mocked as 1 for new slots
      const apptDate = new Date(update.date);

      const newAppt = await Appointment.create([{
        ...previousState,
        _id: new mongoose.Types.ObjectId(), // New ID
        date: apptDate,
        time: update.time,
        status: 'Scheduled',
        rescheduledFrom: oldAppt._id
      }], { session });

      // History
      await AppointmentHistory.create([{
        tenantId: oldAppt.tenantId,
        hospitalId: oldAppt.hospitalId,
        appointmentId: oldAppt._id,
        action: 'Rescheduled',
        previousState,
        newState: newAppt[0].toObject(),
        reason: reason || 'Group Reschedule',
        changedBy: req.user?._id,
        ipAddress: req.ip
      }], { session });

      // Link new appt to group and remove old one
      group.appointments = group.appointments.map(id => 
        id.toString() === oldAppt._id.toString() ? newAppt[0]._id : id
      );
    }

    await group.save({ session });
    await session.commitTransaction();
    session.endSession();

    sendSuccess(res, group, 'Group rescheduled successfully');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}

export async function cancelGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await AppointmentGroup.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!group) throw new NotFoundError('Appointment group not found');

    const appointments = await Appointment.find({ _id: { $in: group.appointments } });

    group.status = 'Cancelled';
    await group.save();

    for (const appt of appointments) {
      if (appt.status === 'Cancelled' || appt.status === 'Completed') continue;

      const previousState = appt.toObject();
      appt.status = 'Cancelled';
      appt.cancelReason = req.body.reason || 'Group Cancellation';
      await appt.save();

      await AppointmentHistory.create({
        tenantId: appt.tenantId,
        hospitalId: appt.hospitalId,
        appointmentId: appt._id,
        action: 'Cancelled',
        previousState,
        newState: appt.toObject(),
        reason: appt.cancelReason,
        changedBy: req.user?._id,
        ipAddress: req.ip
      });

      await AppointmentReminder.updateMany(
        { appointmentId: appt._id, status: { $in: ['Scheduled', 'Queued', 'Processing'] } },
        { status: 'Cancelled' }
      );

      // Trigger Waiting List
      evaluateWaitingList(
        appt.doctorId.toString(),
        appt.departmentId?.toString() || '',
        appt.date,
        appt.time
      ).catch(err => console.error('Failed to trigger waiting list evaluation on group cancel:', err));
    }

    sendSuccess(res, group, 'Group appointment cancelled successfully');
  } catch (err) {
    next(err);
  }
}
