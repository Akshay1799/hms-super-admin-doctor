import { Request, Response, NextFunction } from 'express';
import { AppointmentReminder } from '../models/AppointmentReminder';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';

export async function createReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { appointmentId } = req.params;
    const { type, scheduledTime, channel, patientId } = req.body;
    const tenantId = req.user?.tenantId;

    // Prevent duplicate reminder of the same type for the same appointment
    const existing = await AppointmentReminder.findOne({
      tenantId,
      appointmentId,
      type,
      status: { $in: ['Scheduled', 'Queued', 'Processing'] }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_REMINDER',
          message: `A ${type} reminder is already scheduled for this appointment.`
        }
      });
      return;
    }

    const reminder = await AppointmentReminder.create({
      tenantId,
      hospitalId: req.user?.hospitalId || req.body.hospitalId,
      appointmentId,
      patientId,
      type,
      scheduledTime: new Date(scheduledTime),
      channel: channel || 'Email',
      status: 'Scheduled'
    });

    sendCreated(res, reminder, 'Reminder scheduled successfully');
  } catch (err) {
    next(err);
  }
}

export async function getReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { appointmentId } = req.params;
    const tenantId = req.user?.tenantId;

    const reminders = await AppointmentReminder.find({ tenantId, appointmentId }).sort({ scheduledTime: 1 });
    sendSuccess(res, reminders, 'Reminders retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function cancelReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reminderId } = req.params;
    const tenantId = req.user?.tenantId;

    const reminder = await AppointmentReminder.findOneAndUpdate(
      { _id: reminderId, tenantId, status: { $in: ['Scheduled', 'Queued'] } },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!reminder) throw new NotFoundError('Pending reminder not found');

    sendSuccess(res, reminder, 'Reminder cancelled successfully');
  } catch (err) {
    next(err);
  }
}

export async function retryReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reminderId } = req.params;
    const tenantId = req.user?.tenantId;

    const reminder = await AppointmentReminder.findOneAndUpdate(
      { _id: reminderId, tenantId, status: 'Failed' },
      { status: 'Scheduled', scheduledTime: new Date() }, // Retry immediately
      { new: true }
    );

    if (!reminder) throw new NotFoundError('Failed reminder not found for retry');

    sendSuccess(res, reminder, 'Reminder queued for retry');
  } catch (err) {
    next(err);
  }
}

// System API for Notification worker to pull pending reminders
export async function getPendingReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Usually, this should be secured by a system token or internal network only
    const now = new Date();
    
    // Find all Scheduled reminders where scheduledTime is in the past or now
    const reminders = await AppointmentReminder.find({
      status: 'Scheduled',
      scheduledTime: { $lte: now }
    }).limit(100); // Batch size

    sendSuccess(res, reminders, 'Pending reminders retrieved');
  } catch (err) {
    next(err);
  }
}
