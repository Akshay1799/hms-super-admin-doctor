import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { WaitingListEntry } from '../models/WaitingListEntry';
import { Appointment } from '../models/Appointment';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { SlotHold } from '../models/SlotHold';

export async function joinWaitingList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, preferredDoctorId, preferredDepartmentId, preferredDate, preferredTime, priorityLevel } = req.body;
    const tenantId = req.user?.tenantId;

    // BR-038: One patient may have only one active waiting list entry for the same request
    const existing = await WaitingListEntry.findOne({
      tenantId,
      patientId,
      preferredDoctorId,
      preferredDepartmentId,
      preferredDate,
      status: { $in: ['Waiting', 'Offer Sent'] }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_WAITING_LIST',
          message: 'Patient is already on the waiting list for this requirement.'
        }
      });
      return;
    }

    const entry = await WaitingListEntry.create({
      tenantId,
      hospitalId: req.user?.hospitalId || req.body.hospitalId,
      patientId,
      preferredDoctorId,
      preferredDepartmentId,
      preferredDate,
      preferredTime,
      priorityLevel: priorityLevel || 10,
      status: 'Waiting',
      history: [{ action: 'Joined waiting list', timestamp: new Date() }]
    });

    sendCreated(res, entry, 'Successfully joined the waiting list');
  } catch (err) {
    next(err);
  }
}

export async function getWaitingListEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await WaitingListEntry.findOne({ _id: req.params.id, tenantId: req.user?.tenantId })
      .populate('patientId', 'name uhid email phone')
      .populate('preferredDoctorId', 'name')
      .populate('preferredDepartmentId', 'name');
    
    if (!entry) throw new NotFoundError('Waiting list entry not found');

    sendSuccess(res, entry);
  } catch (err) {
    next(err);
  }
}

export async function searchWaitingList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentId, doctorId, status } = req.query;
    const filter: Record<string, unknown> = { tenantId: req.user?.tenantId };

    if (departmentId) filter.preferredDepartmentId = departmentId;
    if (doctorId) filter.preferredDoctorId = doctorId;
    if (status) filter.status = status;
    else filter.status = 'Waiting';

    if (req.user?.role === 'HOSPITAL_ADMIN') filter.hospitalId = req.user.hospitalId;

    const entries = await WaitingListEntry.find(filter)
      .populate('patientId', 'name uhid phone')
      .populate('preferredDoctorId', 'name')
      .sort({ priorityLevel: 1, createdAt: 1 }); // Sort by priority, then FIFO

    sendSuccess(res, entries, 'Waiting list retrieved');
  } catch (err) {
    next(err);
  }
}

export async function acceptOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await WaitingListEntry.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!entry) throw new NotFoundError('Waiting list entry not found');

    if (entry.status !== 'Offer Sent') {
      res.status(400).json({ success: false, message: 'No active offer found for this entry' });
      return;
    }

    if (!entry.offerDetails || new Date(entry.offerDetails.offerExpiresAt) < new Date()) {
      entry.status = 'Expired';
      entry.history.push({ action: 'Offer Expired' });
      await entry.save();
      res.status(400).json({ success: false, message: 'The offer has expired' });
      return;
    }

    // BR-039: Accepted offers automatically generate appointments
    const apptDate = new Date(entry.offerDetails.offeredDate);
    
    // Check if slot is still magically open just in case
    const conflict = await Appointment.findOne({
      doctorId: entry.offerDetails.offeredDoctorId,
      date: apptDate,
      time: entry.offerDetails.offeredTime,
      status: { $nin: ['Cancelled', 'Archived'] }
    });

    if (conflict) {
      res.status(409).json({ success: false, message: 'Slot was taken before acceptance could be processed.' });
      return;
    }

    // Generate token for appt
    const countToday = await Appointment.countDocuments({
      doctorId: entry.offerDetails.offeredDoctorId,
      date: { 
        $gte: new Date(new Date(apptDate).setHours(0,0,0,0)), 
        $lte: new Date(new Date(apptDate).setHours(23,59,59,999)) 
      },
      status: { $ne: 'Cancelled' }
    });
    
    const tokenNumber = countToday + 1;

    const { Patient } = await import('../models/Patient');
    const patient = await Patient.findById(entry.patientId);
    
    const { User } = await import('../models/User');
    const doctor = await User.findById(entry.offerDetails.offeredDoctorId);

    const appt = await Appointment.create({
      tenantId: entry.tenantId,
      hospitalId: entry.hospitalId,
      departmentId: entry.offerDetails.offeredDepartmentId,
      patientId: entry.patientId,
      patientName: patient ? `${patient.name} ${patient.lastName || ''}`.trim() : 'Unknown',
      patientPhone: patient?.phone || '',
      doctorId: entry.offerDetails.offeredDoctorId,
      doctorName: doctor?.name || 'Unknown',
      date: apptDate,
      time: entry.offerDetails.offeredTime,
      status: 'Scheduled',
      type: 'Consultation',
      tokenNumber,
      queuePosition: tokenNumber
    });

    entry.status = 'Accepted';
    entry.history.push({ action: 'Offer Accepted, Appointment Created', details: `Appt ID: ${appt._id}`, timestamp: new Date() });
    await entry.save();

    sendSuccess(res, { entry, appointment: appt }, 'Offer accepted and appointment booked successfully');
  } catch (err) {
    next(err);
  }
}

export async function rejectOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await WaitingListEntry.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!entry) throw new NotFoundError('Waiting list entry not found');

    if (entry.status !== 'Offer Sent') {
      res.status(400).json({ success: false, message: 'No active offer found for this entry' });
      return;
    }

    entry.status = 'Rejected';
    entry.history.push({ action: 'Offer Rejected by patient', timestamp: new Date() });
    await entry.save();

    // Trigger evaluate for the next person
    evaluateWaitingList(
      entry.offerDetails!.offeredDoctorId.toString(),
      entry.offerDetails!.offeredDepartmentId.toString(),
      entry.offerDetails!.offeredDate,
      entry.offerDetails!.offeredTime
    ).catch(err => console.error('Failed to trigger background waiting list evaluation:', err));

    sendSuccess(res, entry, 'Offer rejected');
  } catch (err) {
    next(err);
  }
}

export async function removeEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await WaitingListEntry.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user?.tenantId },
      { 
        status: 'Cancelled',
        $push: { history: { action: 'Removed from waiting list', timestamp: new Date() } }
      },
      { new: true }
    );
    if (!entry) throw new NotFoundError('Waiting list entry not found');

    sendSuccess(res, entry, 'Entry removed from waiting list');
  } catch (err) {
    next(err);
  }
}

// Synchronous Matching Engine Trigger (Internal Helper)
export async function evaluateWaitingList(doctorId: string, departmentId: string, date: Date, time: string): Promise<void> {
  try {
    const apptDate = new Date(date);
    apptDate.setHours(0,0,0,0);
    const nextDay = new Date(apptDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // 1. Find the highest priority waiting list entry that matches the criteria
    const eligibleEntry = await WaitingListEntry.findOne({
      status: 'Waiting',
      $and: [
        {
          $or: [
            { preferredDoctorId: doctorId },
            { preferredDepartmentId: departmentId, preferredDoctorId: { $exists: false } }
          ]
        },
        {
          $or: [
            { preferredDate: { $gte: apptDate, $lt: nextDay } },
            { preferredDate: { $exists: false } }
          ]
        }
      ]
    }).sort({ priorityLevel: 1, createdAt: 1 });

    if (!eligibleEntry) return; // No one is waiting

    // 2. Generate Offer and Auto-Reserve Slot
    const offerExpiresAt = new Date();
    offerExpiresAt.setMinutes(offerExpiresAt.getMinutes() + 30); // 30 mins waitlist reservation

    // Create a physical lock on the slot
    await SlotHold.create({
      tenantId: eligibleEntry.tenantId,
      hospitalId: eligibleEntry.hospitalId,
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: eligibleEntry.patientId,
      date: date,
      time: time,
      type: 'WAITLIST',
      expireAt: offerExpiresAt
    });

    eligibleEntry.status = 'Reserved';
    eligibleEntry.reservationExpiresAt = offerExpiresAt;
    eligibleEntry.offerDetails = {
      offeredDoctorId: new mongoose.Types.ObjectId(doctorId),
      offeredDepartmentId: new mongoose.Types.ObjectId(departmentId),
      offeredDate: date,
      offeredTime: time,
      offerExpiresAt
    };
    eligibleEntry.history.push({ action: 'Slot Auto-Reserved', details: `Reserved slot at ${time} for 30 mins`, timestamp: new Date() });
    
    await eligibleEntry.save();

    console.log(`[Slot Matching Engine] Offer generated for patient ${eligibleEntry.patientId} for slot ${time}`);

  } catch (err) {
    console.error('[Slot Matching Engine] Error evaluating waiting list:', err);
  }
}
