import { Request, Response, NextFunction } from 'express';
import { RadiologyAppointment } from '../models/RadiologyAppointment';
import { RadiologyOrder } from '../models/RadiologyOrder';
import { Machine } from '../models/Machine';
import { User } from '../models/User';
import { sendSuccess, sendCreated, NotFoundError, ValidationError, ConflictError } from '../utils/response';
import mongoose from 'mongoose';

/**
 * Ensures some dummy machines exist for testing
 */
async function ensureDummyMachines(tenantId: mongoose.Types.ObjectId, hospitalId: mongoose.Types.ObjectId, departmentId: mongoose.Types.ObjectId) {
  const count = await Machine.countDocuments({ tenantId, hospitalId });
  if (count === 0) {
    await Machine.create({
      machineName: 'General X-Ray Room 1',
      modality: 'X-Ray',
      departmentId,
      tenantId,
      hospitalId,
      status: 'Active',
      createdBy: new mongoose.Types.ObjectId() // Dummy user
    });
  }
}

/**
 * Get machine availability
 */
export async function getMachineAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { modality, startTime, endTime } = req.query;

    const defaultDept = new mongoose.Types.ObjectId(); 
    await ensureDummyMachines(tenantId!, hospitalId!, defaultDept);

    let query: any = { tenantId, hospitalId, status: 'Active' };
    if (modality) query.modality = modality;

    const machines = await Machine.find(query);

    // If time is provided, find machines that are NOT booked in that window
    if (startTime && endTime) {
      const sTime = new Date(startTime as string);
      const eTime = new Date(endTime as string);

      const conflictingAppointments = await RadiologyAppointment.find({
        tenantId,
        hospitalId,
        status: { $in: ['Reserved', 'Confirmed'] },
        $or: [
          { startTime: { $lt: eTime }, endTime: { $gt: sTime } }
        ]
      });

      const bookedMachineIds = conflictingAppointments.map(app => app.machineId.toString());
      const availableMachines = machines.filter(m => !bookedMachineIds.includes(m._id.toString()));

      sendSuccess(res, availableMachines, 'Available machines retrieved');
      return;
    }

    sendSuccess(res, machines, 'Machines retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get staff availability
 */
export async function getStaffAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { role } = req.query; // 'RADIOLOGY_TECHNICIAN' | 'RADIOLOGIST'

    let query: any = { tenantId, hospitalId, status: 'Active' };
    if (role) {
      query.role = role;
    } else {
      query.role = { $in: ['RADIOLOGY_TECHNICIAN', 'RADIOLOGIST'] };
    }

    const staff = await User.find(query).select('name firstName lastName email role specialization');

    sendSuccess(res, staff, 'Staff availability retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create Schedule
 */
export async function createSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId, orderItemId, machineId, technicianId, radiologistId, startTime, endTime, preparationChecklist } = req.body;
    const { tenantId, hospitalId, id: userId } = req.user!;

    // Validate Order
    const order = await RadiologyOrder.findOne({ _id: orderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Radiology order not found');

    const orderItem = order.items.find(i => i._id?.toString() === orderItemId);
    if (!orderItem) throw new NotFoundError('Radiology order item not found');

    if (orderItem.status !== 'Requested') {
      throw new ValidationError(`Order item is in ${orderItem.status} status and cannot be scheduled.`);
    }

    // Validate Machine Double Booking
    const sTime = new Date(startTime);
    const eTime = new Date(endTime);
    const conflicting = await RadiologyAppointment.findOne({
      machineId,
      status: { $in: ['Reserved', 'Confirmed'] },
      $or: [
        { startTime: { $lt: eTime }, endTime: { $gt: sTime } }
      ]
    });

    if (conflicting) {
      throw new ConflictError('Machine is already booked for the selected time slot.');
    }

    const timestamp = Date.now().toString().slice(-6);
    const appointmentNumber = `APT-RAD-${new Date().getFullYear()}-${timestamp}`;

    const duration = (eTime.getTime() - sTime.getTime()) / 60000;

    const appointment = new RadiologyAppointment({
      appointmentNumber,
      orderId,
      orderItemId,
      patientId: order.patientId,
      tenantId,
      hospitalId,
      machineId,
      technicianId,
      radiologistId,
      startTime: sTime,
      endTime: eTime,
      examinationDuration: duration,
      status: 'Reserved',
      preparationChecklist,
      createdBy: userId
    });

    await appointment.save();

    // Update order status
    orderItem.status = 'Scheduled';
    
    const allScheduled = order.items.every(i => i.status !== 'Requested');
    if (allScheduled && order.orderStatus === 'Requested') {
      order.orderStatus = 'Scheduled';
    } else if (order.orderStatus === 'Requested') {
      order.orderStatus = 'Scheduling Pending';
    }

    await order.save();

    sendCreated(res, appointment, 'Radiology appointment created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Schedules
 */
export async function getSchedules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { patientId, machineId, status, date } = req.query;

    const query: any = { tenantId, hospitalId };
    
    if (patientId) query.patientId = patientId;
    if (machineId) query.machineId = machineId;
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await RadiologyAppointment.find(query)
      .populate('patientId', 'firstName lastName uhid')
      .populate('machineId', 'machineName modality')
      .populate('technicianId', 'firstName lastName')
      .populate('radiologistId', 'firstName lastName')
      .sort({ startTime: 1 });

    sendSuccess(res, schedules, 'Radiology schedules retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Update Schedule
 */
export async function updateSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { machineId, technicianId, radiologistId, startTime, endTime, status } = req.body;

    const appointment = await RadiologyAppointment.findOne({ _id: req.params.scheduleId, tenantId, hospitalId });
    if (!appointment) throw new NotFoundError('Radiology appointment not found');

    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      throw new ValidationError(`Cannot update appointment in ${appointment.status} state`);
    }

    // Check double booking if time or machine changes
    if (startTime || endTime || machineId) {
      const sTime = startTime ? new Date(startTime) : appointment.startTime;
      const eTime = endTime ? new Date(endTime) : appointment.endTime;
      const mId = machineId || appointment.machineId;

      const conflicting = await RadiologyAppointment.findOne({
        _id: { $ne: appointment._id },
        machineId: mId,
        status: { $in: ['Reserved', 'Confirmed'] },
        $or: [
          { startTime: { $lt: eTime }, endTime: { $gt: sTime } }
        ]
      });

      if (conflicting) {
        throw new ConflictError('Machine is already booked for the selected time slot.');
      }

      if (startTime) appointment.startTime = sTime;
      if (endTime) appointment.endTime = eTime;
      if (machineId) appointment.machineId = mId;
      appointment.examinationDuration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000;
    }

    if (technicianId !== undefined) appointment.technicianId = technicianId;
    if (radiologistId !== undefined) appointment.radiologistId = radiologistId;
    if (status) appointment.status = status;

    await appointment.save();

    sendSuccess(res, appointment, 'Radiology appointment updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel Schedule
 */
export async function cancelSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;

    const appointment = await RadiologyAppointment.findOne({ _id: req.params.scheduleId, tenantId, hospitalId });
    if (!appointment) throw new NotFoundError('Radiology appointment not found');

    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      throw new ValidationError(`Cannot cancel appointment in ${appointment.status} state`);
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    // Revert Order Item Status
    const order = await RadiologyOrder.findById(appointment.orderId);
    if (order) {
      const orderItem = order.items.find(i => i._id?.toString() === appointment.orderItemId.toString());
      if (orderItem && orderItem.status === 'Scheduled') {
        orderItem.status = 'Requested';
        
        const anyScheduled = order.items.some(i => i.status === 'Scheduled');
        if (!anyScheduled && order.orderStatus === 'Scheduling Pending') {
          order.orderStatus = 'Requested';
        }
        await order.save();
      }
    }

    sendSuccess(res, appointment, 'Radiology appointment cancelled successfully');
  } catch (err) {
    next(err);
  }
}
