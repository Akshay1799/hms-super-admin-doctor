import { Request, Response, NextFunction } from 'express';
import { Admission } from '../models/Admission';
import { BedAllocation } from '../models/BedAllocation';
import { Bed } from '../models/Bed';
import { Ward } from '../models/Ward';
import { Room } from '../models/Room';
import { sendSuccess, AppError, ConflictError } from '../utils/response';

/**
 * Create a new Admission
 */
export async function createAdmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = (req as any).user!;
    const { patientId, admittingDoctorId } = req.body;

    // Check if patient already has an active admission (quick check)
    const existingAdmission = await Admission.findOne({
      tenantId,
      hospitalId,
      patientId,
      status: { $in: ['Approved', 'Admitted', 'Discharge Planned'] }
    });

    if (existingAdmission) {
      throw new ConflictError('Patient already has an active admission in this hospital');
    }

    try {
      const admission = await Admission.create({
        patientId,
        admittingDoctorId,
        tenantId,
        hospitalId,
        createdBy: userId,
        status: 'Approved' // Starts as Approved before Bed is allocated
      });

      sendSuccess(res, admission, 'Admission created successfully', 201);
    } catch (createErr: any) {
      // 11000 is MongoDB's duplicate key error
      if (createErr.code === 11000 && createErr.message && createErr.message.includes('unique_active_admission')) {
        throw new ConflictError('Patient already has an active admission in this hospital');
      }
      throw createErr;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Allocate a Bed to an Admission
 */
export async function allocateBed(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { tenantId, hospitalId, id: userId } = (req as any).user!;
    const { admissionId, bedId } = req.body;

    const admission = await Admission.findOne({ _id: admissionId, tenantId, hospitalId }).session(session);
    if (!admission) throw new AppError('Admission not found', 404);

    if (admission.status === 'Discharged') {
      throw new ConflictError('Cannot allocate a bed for a discharged admission');
    }

    const bed = await Bed.findOne({ _id: bedId, tenantId, hospitalId }).session(session);
    if (!bed) throw new AppError('Bed not found', 404);

    if (bed.status !== 'Available' && bed.status !== 'Reserved') {
      throw new ConflictError(`Bed is currently ${bed.status}`);
    }

    // Double-check if the reserved bed was actually reserved for THIS patient/admission,
    // For simplicity, we just allow allocation if it's Reserved or Available.
    // In a real system, you'd check if the Reservation was made for this exact Admission.

    // If there is an existing active allocation for this admission, this is a transfer.
    const existingAllocation = await BedAllocation.findOne({
      admissionId,
      tenantId,
      hospitalId,
      status: { $in: ['Occupied', 'Reserved'] }
    }).session(session);

    if (existingAllocation) {
      existingAllocation.status = 'Released';
      existingAllocation.releaseTime = new Date();
      await existingAllocation.save({ session });

      const oldBed = await Bed.findOne({ _id: existingAllocation.bedId, tenantId, hospitalId }).session(session);
      if (oldBed) {
        oldBed.status = 'Cleaning';
        await oldBed.save({ session });
      }
    }

    // Atomically create BedAllocation and update statuses
    const bedAllocation = await BedAllocation.create([{
      admissionId,
      bedId,
      patientId: admission.patientId,
      status: 'Occupied',
      allocationTime: new Date(),
      tenantId,
      hospitalId,
      createdBy: userId
    }], { session });

    bed.status = 'Occupied';
    await bed.save({ session });

    admission.status = 'Admitted';
    await admission.save({ session });

    await session.commitTransaction();
    sendSuccess(res, bedAllocation[0], 'Bed allocated successfully', 201);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

/**
 * Reserve a Bed for an Admission
 */
export async function reserveBed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = (req as any).user!;
    const { admissionId, bedId } = req.body;

    const admission = await Admission.findOne({ _id: admissionId, tenantId, hospitalId });
    if (!admission) throw new AppError('Admission not found', 404);

    const bed = await Bed.findOne({ _id: bedId, tenantId, hospitalId });
    if (!bed) throw new AppError('Bed not found', 404);

    if (bed.status !== 'Available') {
      throw new AppError(`Bed is currently ${bed.status} and cannot be reserved`, 400);
    }

    const bedAllocation = await BedAllocation.create({
      admissionId,
      bedId,
      patientId: admission.patientId,
      status: 'Reserved',
      tenantId,
      hospitalId,
      createdBy: userId
    });

    bed.status = 'Reserved';
    await bed.save();

    sendSuccess(res, bedAllocation, 'Bed reserved successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Release a Bed (Discharge, Transfer, or Cancel Reservation)
 */
export async function releaseBed(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { tenantId, hospitalId } = (req as any).user!;
    const { allocationId } = req.params;

    const allocation = await BedAllocation.findOne({ _id: allocationId, tenantId, hospitalId }).session(session);
    if (!allocation) throw new AppError('Bed Allocation not found', 404);
    if (allocation.status === 'Released') throw new ConflictError('Bed already released');

    const bed = await Bed.findOne({ _id: allocation.bedId, tenantId, hospitalId }).session(session);
    if (!bed) throw new AppError('Bed not found', 404);

    allocation.status = 'Released';
    allocation.releaseTime = new Date();
    await allocation.save({ session });

    // After releasing, the bed goes to Cleaning
    bed.status = 'Cleaning';
    await bed.save({ session });

    await session.commitTransaction();
    sendSuccess(res, allocation, 'Bed released successfully and sent for cleaning');
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

/**
 * Get Available Beds
 */
export async function getAvailableBeds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = (req as any).user!;
    const { wardId, roomType } = req.query;

    const query: any = { tenantId, hospitalId, status: 'Available' };

    if (wardId) query.wardId = wardId;

    if (roomType) {
      const rooms = await Room.find({ tenantId, hospitalId, roomType }).select('_id');
      const roomIds = rooms.map(r => r._id);
      query.roomId = { $in: roomIds };
    }

    const availableBeds = await Bed.find(query).populate('roomId wardId');

    sendSuccess(res, availableBeds, 'Available beds retrieved');
  } catch (err) {
    next(err);
  }
}

import mongoose from 'mongoose';

/**
 * Get Occupancy Status
 */
export async function getOccupancyStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = (req as any).user!;

    const statusCounts = await Bed.aggregate([
      { $match: { 
        tenantId: new mongoose.Types.ObjectId(tenantId as string), 
        hospitalId: new mongoose.Types.ObjectId(hospitalId as string) 
      } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedCounts = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const defaultStatuses = ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'];
    defaultStatuses.forEach(s => {
      if (!formattedCounts[s]) formattedCounts[s] = 0;
    });

    sendSuccess(res, formattedCounts, 'Occupancy status retrieved');
  } catch (err) {
    next(err);
  }
}
