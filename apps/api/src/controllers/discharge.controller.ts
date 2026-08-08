import { Request, Response, NextFunction } from 'express';
import { DischargeSummary } from '../models/DischargeSummary';
import { Patient } from '../models/Patient';
import { Bed } from '../models/Bed';
import { sendSuccess, AppError } from '../utils/response';

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
  try {
    const { id } = req.params;
    const hospitalId = req.user?.hospitalId;

    const summary = await DischargeSummary.findOne({ _id: id, hospitalId });
    if (!summary) throw new AppError('Discharge summary not found', 404);
    if (summary.status !== 'Billing Cleared') throw new AppError('Must clear billing before publish', 400);

    summary.status = 'Published';
    summary.publishedAt = new Date();
    await summary.save();

    // Update Patient Status
    const patient = await Patient.findOne({ _id: summary.patientId, hospitalId });
    if (patient) {
      patient.status = 'Discharged';
      await patient.save();
    }

    sendSuccess(res, summary, 'Patient discharged successfully');
  } catch (error) {
    next(error);
  }
}
