import { Request, Response, NextFunction } from 'express';
import { Appointment } from '../models/Appointment';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';

function buildFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) filter.tenantId = req.user.tenantId;
  if (req.user?.role === 'HOSPITAL_ADMIN') filter.hospitalId = req.user.hospitalId;
  if (req.user?.role === 'DEPT_ADMIN') filter.departmentId = req.user.departmentId;
  if (req.user?.role === 'DOCTOR') filter.doctorId = req.user._id;
  return filter;
}

export async function listAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type, doctorId, patientId, hospitalId, date, from, to, page = '1', limit = '50' } = req.query;
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
    const { doctorId, date, time } = req.body;

    // Convert date string to start-of-day for token counting
    const apptDate = new Date(date);
    const dayStart = new Date(apptDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(apptDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Atomic token generation: Count existing appointments for this doctor on this day
    const countToday = await Appointment.countDocuments({
      doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'Cancelled' },
    });

    const tokenNumber = countToday + 1;

    const appt = await Appointment.create({
      ...req.body,
      tenantId: req.body.tenantId || req.user?.tenantId,
      hospitalId: req.body.hospitalId || req.user?.hospitalId,
      tokenNumber,
      queuePosition: tokenNumber,
    });

    sendCreated(res, appt, `Appointment scheduled with Token #${tokenNumber}`);
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
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled', cancelReason: req.body.reason },
      { new: true }
    );
    if (!appt) throw new NotFoundError('Appointment not found');
    sendSuccess(res, appt, 'Appointment cancelled');
  } catch (err) {
    next(err);
  }
}

export async function rescheduleAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, time } = req.body;
    
    const oldAppt = await Appointment.findById(req.params.id);
    if (!oldAppt) throw new NotFoundError('Appointment not found');

    if (oldAppt.status === 'Completed' || oldAppt.status === 'Archived') {
      throw new Error('Cannot reschedule completed or archived appointments');
    }

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
