import { Request, Response, NextFunction } from 'express';
import { Appointment } from '../models/Appointment';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { AppointmentReminder } from '../models/AppointmentReminder';
import { AppointmentHistory } from '../models/AppointmentHistory';
import { CancellationReason } from '../models/CancellationReason';
import { ReschedulePolicy } from '../models/ReschedulePolicy';
import { evaluateWaitingList } from './waitingList.controller';

function buildFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) filter.tenantId = req.user.tenantId;
  if (req.user?.role === 'HOSPITAL_ADMIN') filter.hospitalId = req.user.hospitalId;
  if (req.user?.role === 'DEPT_ADMIN') filter.departmentId = req.user.departmentId;
  if (req.user?.role === 'DOCTOR') filter.doctorId = req.user._id;
  return filter;
}

// Generate token number for a specific day
async function generateTokenNumber(doctorId: any, date: Date): Promise<number> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const countToday = await Appointment.countDocuments({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: 'Cancelled' },
  });
  return countToday + 1;
}

export async function listAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type, doctorId, patientId, hospitalId, date, from, to, q, page = '1', limit = '50' } = req.query;
    const filter = buildFilter(req);

    if (status) filter.status = status;
    if (hospitalId && req.user?.role === 'SUPER_ADMIN') filter.hospitalId = hospitalId;
    if (type) filter.type = type;
    if (doctorId && req.user?.role !== 'DOCTOR') filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (filter.date as Record<string, unknown>).$lte = new Date(to as string);
    }
    if (q) {
      const searchRegex = new RegExp(q as string, 'i');
      filter.$or = [
        { appointmentNumber: searchRegex },
        { bookingReference: searchRegex },
        { patientName: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(200, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter).sort({ date: 1, time: 1 }).skip(skip).limit(limitNum),
      Appointment.countDocuments(filter),
    ]);

    sendSuccess(res, appointments, 'Appointments retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new NotFoundError('Appointment not found');
    sendSuccess(res, appt);
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, doctorId, date, time } = req.body;
    const tenantId = req.body.tenantId || req.user?.tenantId;
    
    // Duplicate Booking Prevention
    const apptDate = new Date(date);
    const existingAppt = await Appointment.findOne({
      tenantId,
      patientId,
      doctorId,
      date: apptDate,
      time,
      status: { $nin: ['Cancelled', 'Archived'] }
    });

    if (existingAppt) {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_BOOKING',
          message: 'Patient already has an active appointment with this doctor at the selected time.'
        }
      });
      return;
    }

    const tokenNumber = await generateTokenNumber(doctorId, apptDate);

    const appt = await Appointment.create({
      ...req.body,
      tenantId,
      hospitalId: req.body.hospitalId || req.user?.hospitalId,
      tokenNumber,
      queuePosition: tokenNumber,
      status: req.body.status || 'Scheduled'
    });

    sendCreated(res, appt, `Appointment scheduled with Token #${tokenNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function reserveSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, doctorId, date, time } = req.body;
    const tenantId = req.body.tenantId || req.user?.tenantId;
    
    const apptDate = new Date(date);
    
    // Check for existing active or reserved appointments to prevent overlaps
    const conflict = await Appointment.findOne({
      tenantId,
      doctorId,
      date: apptDate,
      time,
      status: { $in: ['Reserved', 'Scheduled', 'Confirmed', 'Checked-In'] },
      $or: [
        { reservationExpiresAt: { $gt: new Date() } },
        { reservationExpiresAt: { $exists: false } }
      ]
    });

    if (conflict) {
      res.status(409).json({
        success: false,
        error: {
          code: 'SLOT_UNAVAILABLE',
          message: 'The selected slot is already booked or reserved.'
        }
      });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes reservation

    const appt = await Appointment.create({
      ...req.body,
      tenantId,
      hospitalId: req.body.hospitalId || req.user?.hospitalId,
      status: 'Reserved',
      reservationExpiresAt: expiresAt
    });

    sendCreated(res, appt, 'Slot reserved successfully for 10 minutes');
  } catch (err) {
    next(err);
  }
}

export async function releaseSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, status: 'Reserved' });
    if (!appt) throw new NotFoundError('Reserved appointment not found');
    
    // Hard delete or archive based on policy. We will soft delete by setting to Cancelled
    appt.status = 'Cancelled';
    appt.cancelReason = 'Reservation Released';
    await appt.save();

    sendSuccess(res, null, 'Slot released successfully');
  } catch (err) {
    next(err);
  }
}

export async function confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new NotFoundError('Appointment not found');

    if (appt.status !== 'Reserved') {
      res.status(400).json({ success: false, message: 'Only reserved appointments can be confirmed' });
      return;
    }

    if (appt.reservationExpiresAt && appt.reservationExpiresAt < new Date()) {
      appt.status = 'Cancelled';
      appt.cancelReason = 'Reservation Expired';
      await appt.save();
      res.status(400).json({ success: false, message: 'Reservation has expired. Please select a new slot.' });
      return;
    }

    // Generate token number upon confirmation
    const tokenNumber = await generateTokenNumber(appt.doctorId, appt.date);
    
    appt.status = 'Confirmed';
    appt.tokenNumber = tokenNumber;
    appt.queuePosition = tokenNumber;
    appt.reservationExpiresAt = undefined;
    await appt.save();

    // Cross-Module Sync: Schedule Reminders automatically
    await AppointmentReminder.create({
      tenantId: appt.tenantId,
      hospitalId: appt.hospitalId,
      appointmentId: appt._id,
      patientId: appt.patientId,
      type: 'Initial Confirmation',
      scheduledTime: new Date(), // Send immediately
      status: 'Scheduled',
      channel: 'Email'
    });

    // 24-Hour Reminder
    const reminder24h = new Date(appt.date);
    const [hours, minutes] = appt.time.split(':').map(Number);
    reminder24h.setHours(hours - 24, minutes, 0, 0);

    if (reminder24h > new Date()) {
      await AppointmentReminder.create({
        tenantId: appt.tenantId,
        hospitalId: appt.hospitalId,
        appointmentId: appt._id,
        patientId: appt.patientId,
        type: '24-Hour Reminder',
        scheduledTime: reminder24h,
        status: 'Scheduled',
        channel: 'Email'
      });
    }

    sendSuccess(res, appt, `Booking confirmed with Token #${tokenNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appt) throw new NotFoundError('Appointment not found');

    // HIERARCHICAL SYNC: If completed, add to patient timeline
    if (req.body.status === 'Completed') {
      const { Patient } = await import('../models/Patient');
      await Patient.findByIdAndUpdate(appt.patientId, {
        $push: {
          timeline: {
            title: 'Appointment Completed',
            description: `Consultation with Dr. ${appt.doctorName}`,
            date: new Date(),
            type: 'procedure',
            createdBy: req.user?.name || 'System',
          }
        }
      });
    }

    sendSuccess(res, appt, 'Appointment updated');
  } catch (err) {
    next(err);
  }
}

export async function checkInAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new NotFoundError('Appointment not found');

    if (appt.status === 'Checked-In') {
      sendSuccess(res, appt, 'Patient is already checked in');
      return;
    }

    appt.status = 'Checked-In';
    appt.checkInTime = new Date();
    await appt.save();

    // BR-039: Appointment check-in automatically prepares Encounter creation.
    const { Encounter } = await import('../models/Encounter');
    const encounter = await Encounter.create({
      tenantId: appt.tenantId,
      hospitalId: appt.hospitalId,
      departmentId: appt.departmentId,
      patientId: appt.patientId,
      encounterType: 'OPD',
      category: 'Scheduled Appointment',
      doctorId: appt.doctorId,
      notes: appt.notes,
      registeredBy: req.user?._id,
      status: 'Waiting'
    });

    sendSuccess(res, { appointment: appt, encounter }, `Patient checked in successfully. Encounter created: ${encounter.visitNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new NotFoundError('Appointment not found');

    const previousState = appt.toObject();

    appt.status = 'Cancelled';
    appt.cancelReason = req.body.reason || 'Not specified';
    await appt.save();

    // Generate Audit History
    await AppointmentHistory.create({
      tenantId: appt.tenantId,
      hospitalId: appt.hospitalId,
      appointmentId: appt._id,
      action: 'Cancelled',
      previousState,
      newState: appt.toObject(),
      reason: req.body.reason,
      changedBy: req.user?._id,
      ipAddress: req.ip
    });

    // Cross-Module Sync: Cancel pending reminders
    await AppointmentReminder.updateMany(
      { appointmentId: appt._id, status: { $in: ['Scheduled', 'Queued', 'Processing'] } },
      { status: 'Cancelled' }
    );

    // Cross-Module Sync: Evaluate Waiting List for the newly freed slot
    evaluateWaitingList(
      appt.doctorId.toString(),
      appt.departmentId?.toString() || '',
      appt.date,
      appt.time
    ).catch(err => console.error('Failed to trigger waiting list evaluation on cancel:', err));

    sendSuccess(res, appt, 'Appointment cancelled');
  } catch (err) {
    next(err);
  }
}

export async function rescheduleAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, time, reason } = req.body;
    const tenantId = req.user?.tenantId;
    
    const oldAppt = await Appointment.findById(req.params.id);
    if (!oldAppt) throw new NotFoundError('Appointment not found');

    if (oldAppt.status === 'Completed' || oldAppt.status === 'Archived') {
      throw new Error('Cannot reschedule completed or archived appointments');
    }

    // Policy Check
    const policy = await ReschedulePolicy.findOne({ tenantId, hospitalId: oldAppt.hospitalId });
    if (policy) {
      const now = new Date();
      const oldApptDate = new Date(oldAppt.date);
      const [hours, minutes] = oldAppt.time.split(':').map(Number);
      oldApptDate.setHours(hours, minutes, 0, 0);

      const diffHours = (oldApptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < policy.minimumNoticePeriodHours) {
        if (!policy.allowSameDayReschedule || req.user?.role === 'PATIENT') {
          res.status(403).json({ success: false, message: `Rescheduling requires at least ${policy.minimumNoticePeriodHours} hours notice.` });
          return;
        }
      }

      // Check max reschedules
      const historyCount = await AppointmentHistory.countDocuments({
        appointmentId: oldAppt._id,
        action: 'Rescheduled'
      });

      if (historyCount >= policy.maxReschedules && req.user?.role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, message: `Maximum reschedules (${policy.maxReschedules}) exceeded.` });
        return;
      }
    }

    const previousState = oldAppt.toObject();
    oldAppt.status = 'Rescheduled';
    await oldAppt.save();

    // Generate new token
    const apptDate = new Date(date);
    const dayStart = new Date(apptDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(apptDate);
    dayEnd.setHours(23, 59, 59, 999);

    const countToday = await Appointment.countDocuments({
      doctorId: oldAppt.doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'Cancelled' },
    });

    const tokenNumber = countToday + 1;

    const newAppt = await Appointment.create({
      tenantId: oldAppt.tenantId,
      hospitalId: oldAppt.hospitalId,
      departmentId: oldAppt.departmentId,
      patientId: oldAppt.patientId,
      patientName: oldAppt.patientName,
      patientPhone: oldAppt.patientPhone,
      doctorId: oldAppt.doctorId,
      doctorName: oldAppt.doctorName,
      date: apptDate,
      time,
      type: oldAppt.type,
      status: 'Scheduled',
      tokenNumber,
      queuePosition: tokenNumber,
      rescheduledFrom: oldAppt._id
    });

    // Cross-Module Sync: Cancel old reminders
    await AppointmentReminder.updateMany(
      { appointmentId: oldAppt._id, status: { $in: ['Scheduled', 'Queued', 'Processing'] } },
      { status: 'Cancelled' }
    );

    // Schedule Reschedule Notification for the new appointment
    await AppointmentReminder.create({
      tenantId: newAppt.tenantId,
      hospitalId: newAppt.hospitalId,
      appointmentId: newAppt._id,
      patientId: newAppt.patientId,
      type: 'Rescheduled Appointment Notification',
      scheduledTime: new Date(), // Send immediately
      status: 'Scheduled',
      channel: 'Email'
    });

    // History tracking
    await AppointmentHistory.create({
      tenantId: newAppt.tenantId,
      hospitalId: newAppt.hospitalId,
      appointmentId: newAppt._id,
      action: 'Rescheduled',
      previousState,
      newState: newAppt.toObject(),
      reason: reason || 'Rescheduled by user',
      changedBy: req.user?._id,
      ipAddress: req.ip
    });

    // Link history to old appt as well for traceability
    await AppointmentHistory.create({
      tenantId: oldAppt.tenantId,
      hospitalId: oldAppt.hospitalId,
      appointmentId: oldAppt._id,
      action: 'Rescheduled',
      previousState,
      newState: oldAppt.toObject(),
      reason: reason || 'Rescheduled to a new slot',
      changedBy: req.user?._id,
      ipAddress: req.ip
    });

    sendCreated(res, newAppt, `Appointment rescheduled with Token #${tokenNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function getDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const filter: Record<string, unknown> = { doctorId };
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const schedule = await Appointment.find(filter).sort({ date: 1, time: 1 });
    sendSuccess(res, schedule, 'Doctor schedule retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getPatientAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    
    const appointments = await Appointment.find({ patientId }).sort({ date: -1, time: -1 });
    sendSuccess(res, appointments, 'Patient appointments retrieved');
  } catch (err) {
    next(err);
  }
}

export async function bulkCancelAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { appointmentIds, reason } = req.body;
    const tenantId = req.user?.tenantId;

    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      res.status(400).json({ success: false, message: 'appointmentIds array is required' });
      return;
    }

    const appointments = await Appointment.find({
      _id: { $in: appointmentIds },
      tenantId,
      status: { $nin: ['Completed', 'Archived', 'Cancelled'] }
    });

    const cancelledIds = [];

    for (const appt of appointments) {
      const previousState = appt.toObject();
      appt.status = 'Cancelled';
      appt.cancelReason = reason || 'Bulk Cancellation';
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

      // Cross-Module Sync: Evaluate Waiting List
      evaluateWaitingList(
        appt.doctorId.toString(),
        appt.departmentId?.toString() || '',
        appt.date,
        appt.time
      ).catch(err => console.error('Failed to trigger waiting list evaluation on bulk cancel:', err));

      cancelledIds.push(appt._id);
    }

    sendSuccess(res, { cancelledIds }, `Successfully cancelled ${cancelledIds.length} appointments`);
  } catch (err) {
    next(err);
  }
}

export async function getAppointmentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await AppointmentHistory.find({ appointmentId: req.params.id })
      .populate('changedBy', 'name email role')
      .sort({ timestamp: -1 });
    
    sendSuccess(res, history, 'Appointment history retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getCancellationReasons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;
    if (req.user?.hospitalId) filter.hospitalId = req.user.hospitalId;

    const reasons = await CancellationReason.find(filter);
    sendSuccess(res, reasons, 'Cancellation reasons retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getReschedulePolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;
    if (req.user?.hospitalId) filter.hospitalId = req.user.hospitalId;

    const policies = await ReschedulePolicy.find(filter);
    sendSuccess(res, policies, 'Reschedule policies retrieved');
  } catch (err) {
    next(err);
  }
}
