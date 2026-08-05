import { Request, Response, NextFunction } from 'express';
import { QueueToken } from '../models/QueueToken';
import { Appointment } from '../models/Appointment';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import mongoose from 'mongoose';

// Base priority map for token generation
const priorityMap: Record<string, number> = {
  'Emergency': 1,
  'VIP': 2,
  'High Risk': 3,
  'Disabled': 4,
  'Senior Citizen': 5,
  'Child': 6,
  'Staff': 7,
  'Corporate': 8,
  'Follow-up': 9,
  'Normal': 10
};

export async function generateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId, departmentId, patientId, date, category } = req.body;
    const tenantId = req.body.tenantId || req.user?.tenantId;

    const tokenDate = new Date(date || new Date());
    tokenDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(tokenDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Duplicate check for active tokens for the same patient and doctor
    const existingToken = await QueueToken.findOne({
      tenantId,
      patientId,
      doctorId,
      date: { $gte: tokenDate, $lt: nextDay },
      status: { $in: ['Waiting', 'Called', 'In Consultation'] }
    });

    if (existingToken) {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ACTIVE_TOKEN',
          message: 'Patient already has an active queue token for this doctor.'
        }
      });
      return;
    }

    // Determine Queue Position based on category priority
    const newPriority = priorityMap[category as string] || 10;
    
    // Find all waiting tokens for the doctor today to insert properly
    const waitingTokens = await QueueToken.find({
      tenantId,
      doctorId,
      date: { $gte: tokenDate, $lt: nextDay },
      status: 'Waiting'
    }).sort({ queuePosition: 1 });

    let insertAtPosition = waitingTokens.length > 0 ? waitingTokens[waitingTokens.length - 1].queuePosition + 1 : 1;
    
    // If it's a priority token (e.g. Emergency), shift others
    if (newPriority < 10) {
      let shiftIndex = -1;
      for (let i = 0; i < waitingTokens.length; i++) {
        const p = priorityMap[waitingTokens[i].category] || 10;
        if (newPriority < p) {
          shiftIndex = i;
          break;
        }
      }

      if (shiftIndex !== -1) {
        insertAtPosition = waitingTokens[shiftIndex].queuePosition;
        // Shift all subsequent tokens down
        const toShift = waitingTokens.slice(shiftIndex);
        for (const token of toShift) {
          token.queuePosition += 1;
          await token.save();
        }
      }
    }

    const estimatedWaitTimeMinutes = (insertAtPosition - 1) * 15;

    const token = await QueueToken.create({
      ...req.body,
      tenantId,
      hospitalId: req.body.hospitalId || req.user?.hospitalId,
      date: tokenDate,
      queuePosition: insertAtPosition,
      estimatedWaitTimeMinutes: estimatedWaitTimeMinutes > 0 ? estimatedWaitTimeMinutes : 0
    });

    sendCreated(res, token, `Token generated successfully: ${token.tokenNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function getToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = await QueueToken.findById(req.params.id);
    if (!token) throw new NotFoundError('Queue token not found');
    sendSuccess(res, token);
  } catch (err) {
    next(err);
  }
}

export async function callToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = await QueueToken.findById(req.params.id);
    if (!token) throw new NotFoundError('Queue token not found');

    if (token.status === 'Completed' || token.status === 'Cancelled' || token.status === 'Archived') {
      res.status(400).json({ success: false, message: 'Cannot call a closed token' });
      return;
    }

    token.status = 'Called';
    await token.save();

    sendSuccess(res, token, `Patient called for Token ${token.tokenNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function skipToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = await QueueToken.findById(req.params.id);
    if (!token) throw new NotFoundError('Queue token not found');

    token.status = 'Skipped';
    await token.save();

    sendSuccess(res, token, `Token ${token.tokenNumber} skipped`);
  } catch (err) {
    next(err);
  }
}

export async function transferToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId, departmentId } = req.body;
    const token = await QueueToken.findById(req.params.id);
    if (!token) throw new NotFoundError('Queue token not found');

    token.status = 'Transferred';
    token.transferredTo = doctorId;
    await token.save();

    // Create a new token for the new doctor/department
    const tokenDate = new Date(token.date);
    tokenDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(tokenDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const countToday = await QueueToken.countDocuments({
      doctorId,
      date: { $gte: tokenDate, $lt: nextDay }
    });

    const newToken = await QueueToken.create({
      tenantId: token.tenantId,
      hospitalId: token.hospitalId,
      departmentId: departmentId || token.departmentId,
      doctorId,
      patientId: token.patientId,
      category: token.category,
      date: token.date,
      queuePosition: countToday + 1
    });

    sendSuccess(res, newToken, `Token transferred successfully. New Token: ${newToken.tokenNumber}`);
  } catch (err) {
    next(err);
  }
}

export async function getDoctorQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId } = req.params;
    const tenantId = req.user?.tenantId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get Active Queue Tokens (Walk-ins)
    const tokens = await QueueToken.find({
      doctorId,
      tenantId,
      date: { $gte: today, $lt: nextDay },
      status: { $in: ['Waiting', 'Called'] }
    }).populate('patientId', 'firstName lastName uhid').lean();

    // Get Checked-In Appointments (Booked)
    const appointments = await Appointment.find({
      doctorId,
      tenantId,
      date: { $gte: today, $lt: nextDay },
      status: { $in: ['Checked-In', 'Waiting'] }
    }).populate('patientId', 'firstName lastName uhid').lean();

    // Transform and Merge
    const unifiedQueue = [
      ...tokens.map(t => ({
        id: t._id,
        type: 'Walk-in',
        number: t.tokenNumber,
        patient: t.patientId,
        priority: priorityMap[t.category as string] || 10,
        queuePosition: t.queuePosition,
        status: t.status,
        timestamp: t.updatedAt
      })),
      ...appointments.map(a => ({
        id: a._id,
        type: 'Appointment',
        number: a.appointmentNumber,
        patient: a.patientId,
        priority: priorityMap[a.priorityLevel as string] || 10, // Assuming priorityLevel maps roughly
        queuePosition: a.queuePosition || 999, // Fallback if no explicit queue position
        status: a.status,
        timestamp: a.checkInTime || a.updatedAt
      }))
    ];

    // Sort: High Priority First (1 is highest), then by Queue Position
    unifiedQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.queuePosition - b.queuePosition;
    });

    sendSuccess(res, unifiedQueue, 'Doctor unified queue retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentId } = req.params;
    const tenantId = req.user?.tenantId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);

    const tokens = await QueueToken.find({
      departmentId,
      tenantId,
      date: { $gte: today, $lt: nextDay },
      status: { $in: ['Waiting', 'Called', 'In Consultation'] }
    }).populate('patientId doctorId', 'firstName lastName uhid name');

    sendSuccess(res, tokens, 'Department queue retrieved');
  } catch (err) {
    next(err);
  }
}
