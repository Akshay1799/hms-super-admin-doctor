import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DischargeSummary } from '../models/DischargeSummary';
import { Patient } from '../models/Patient';
import { Bed } from '../models/Bed';
import { BedAllocation } from '../models/BedAllocation';
import { Admission } from '../models/Admission';
import { sendSuccess, AppError, ConflictError } from '../utils/response';

// GET /api/ipd/discharge-summaries
export async function getDischargeSummaries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;
    const { patientId } = req.query;

    const query: any = { hospitalId };
    if (patientId) query.patientId = patientId;

    const summaries = await DischargeSummary.find(query)
      .populate('patientId', 'name mrn age gender')
      .populate('treatingDoctorId', 'name specialty')
      .sort({ createdAt: -1 });

    sendSuccess(res, summaries, 'Discharge summaries fetched successfully');
  } catch (error) {
    next(error);
  }
}

// POST /api/ipd/discharge-summaries
export async function createDischargeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;
    const tenantId = req.user?.tenantId;
    const treatingDoctorId = req.user?.id;
    const { patientId, admissionId, clinicalDetails, medicationDetails, followUpPlan } = req.body;

    if (!hospitalId || !tenantId || !treatingDoctorId) {
      throw new AppError('Context missing', 403);
    }

    // Check if one already exists for this admission
    const existing = await DischargeSummary.findOne({ admissionId, hospitalId });
    if (existing) {
      throw new AppError('Discharge summary already exists for this admission', 400);
    }

    const summary = await DischargeSummary.create({
      patientId,
      admissionId,
      treatingDoctorId,
      clinicalDetails,
      medicationDetails,
      followUpPlan,
      status: 'Draft',
      tenantId,
      hospitalId,
    });

    sendSuccess(res, summary, 'Discharge summary created successfully', 201);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/ipd/discharge-summaries/:id
export async function updateDischargeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const hospitalId = req.user?.hospitalId;
    const updateData = req.body;

    const summary = await DischargeSummary.findOne({ _id: id, hospitalId });
    if (!summary) throw new AppError('Discharge summary not found', 404);
    if (summary.status === 'Published') throw new AppError('Cannot edit published summary', 400);

    Object.assign(summary, updateData);
    await summary.save();

    sendSuccess(res, summary, 'Discharge summary updated successfully');
  } catch (error) {
    next(error);
  }
}

// POST /api/ipd/discharge-summaries/:id/approve
export async function approveDischargeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const hospitalId = req.user?.hospitalId;

    const summary = await DischargeSummary.findOne({ _id: id, hospitalId });
    if (!summary) throw new AppError('Discharge summary not found', 404);

    summary.status = 'Billing Pending';
    await summary.save();

    sendSuccess(res, summary, 'Clinical discharge approved. Waiting for billing clearance.');
  } catch (error) {
    next(error);
  }
}

// POST /api/ipd/discharge-summaries/:id/clear-billing
export async function clearBilling(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const hospitalId = req.user?.hospitalId;

    const summary = await DischargeSummary.findOne({ _id: id, hospitalId });
    if (!summary) throw new AppError('Discharge summary not found', 404);

    summary.billingClearance = {
      isCleared: true,
      clearedAt: new Date(),
      clearedBy: req.user?.id as any,
      notes: req.body.notes || 'Manually cleared',
    };
    summary.status = 'Billing Cleared';
    await summary.save();

    sendSuccess(res, summary, 'Billing cleared successfully');
  } catch (error) {
    next(error);
  }
}

// POST /api/ipd/discharge-summaries/:id/publish
export async function publishDischargeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    const hospitalId = req.user?.hospitalId;

    const summary = await DischargeSummary.findOne({ _id: id, hospitalId }).session(session);
    if (!summary) throw new AppError('Discharge summary not found', 404);
    if (summary.status !== 'Billing Cleared') throw new ConflictError('Must clear billing before publish');

    summary.status = 'Published';
    summary.publishedAt = new Date();
    await summary.save({ session });

    // Update Patient Status
    const patient = await Patient.findOne({ _id: summary.patientId, hospitalId }).session(session);
    if (patient) {
      patient.status = 'Discharged';
      await patient.save({ session });
    }

    // Automatically release any active bed allocation for this admission
    const activeAllocation = await BedAllocation.findOne({
      admissionId: summary.admissionId,
      hospitalId,
      status: { $in: ['Occupied', 'Reserved'] }
    }).session(session);

    if (activeAllocation) {
      activeAllocation.status = 'Released';
      activeAllocation.releaseTime = new Date();
      await activeAllocation.save({ session });

      const bed = await Bed.findOne({ _id: activeAllocation.bedId, hospitalId }).session(session);
      if (bed) {
        bed.status = 'Cleaning';
        await bed.save({ session });
      }
    }
    
    // Update Admission Status
    const admission = await Admission.findOne({ _id: summary.admissionId, hospitalId }).session(session);
    if (admission) {
       admission.status = 'Discharged';
       await admission.save({ session });
    }

    await session.commitTransaction();
    sendSuccess(res, summary, 'Patient discharged successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}
