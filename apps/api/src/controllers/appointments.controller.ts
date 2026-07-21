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
    const appt = await Appointment.create({
      ...req.body,
      tenantId: req.body.tenantId || req.user?.tenantId,
    });
    sendCreated(res, appt, 'Appointment scheduled');
  } catch (err) {
    next(err);
  }
}

export async function updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appt) throw new NotFoundError('Appointment not found');
    sendSuccess(res, appt, 'Appointment updated');
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
