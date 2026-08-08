import { Request, Response, NextFunction } from 'express';
import { OperationTheatre } from '../models/OperationTheatre';
import { SurgeryRequest } from '../models/SurgeryRequest';
import { sendSuccess, AppError } from '../utils/response';

// GET /api/ot
export async function getOperationTheatres(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;
    const tenantId = req.user?.tenantId;

    if (!hospitalId || !tenantId) {
      throw new AppError('Hospital or tenant context missing', 403);
    }

    const ots = await OperationTheatre.find({ hospitalId, tenantId }).sort({ otNumber: 1 });
    sendSuccess(res, ots, 'Operation Theatres fetched successfully', 200);
  } catch (error) {
    next(error);
  }
}

// GET /api/ot/surgeries
export async function getSurgeryRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;
    const tenantId = req.user?.tenantId;

    if (!hospitalId || !tenantId) {
      throw new AppError('Hospital or tenant context missing', 403);
    }

    const surgeries = await SurgeryRequest.find({ hospitalId, tenantId })
      .populate('patientId', 'name mrn age gender')
      .populate('primarySurgeonId', 'name email specialty')
      .populate('otId', 'otNumber name')
      .populate('surgicalTeam.anesthesiologistId', 'name')
      .populate('surgicalTeam.assistantSurgeonId', 'name')
      .populate('surgicalTeam.scrubNurseId', 'name')
      .populate('surgicalTeam.circulatingNurseId', 'name')
      .sort({ createdAt: -1 });

    sendSuccess(res, surgeries, 'Surgery requests fetched successfully', 200);
  } catch (error) {
    next(error);
  }
}

// POST /api/ot/surgeries
export async function createSurgeryRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, admissionId, surgeryName, category, priority, estimatedDurationMins, notes } = req.body;
    const hospitalId = req.user?.hospitalId;
    const tenantId = req.user?.tenantId;
    const primarySurgeonId = req.user?.id; // The doctor creating the request

    if (!hospitalId || !tenantId || !primarySurgeonId) {
      throw new AppError('Context missing', 403);
    }

    const newRequest = await SurgeryRequest.create({
      patientId,
      admissionId,
      primarySurgeonId,
      surgeryName,
      category,
      priority,
      estimatedDurationMins,
      notes,
      tenantId,
      hospitalId,
      status: 'Requested',
    });

    sendSuccess(res, newRequest, 'Surgery request created successfully', 201);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/ot/surgeries/:id/schedule
export async function scheduleSurgery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { otId, scheduledTime, surgicalTeam } = req.body;
    const hospitalId = req.user?.hospitalId;

    const surgery = await SurgeryRequest.findOne({ _id: id, hospitalId });
    if (!surgery) throw new AppError('Surgery request not found', 404);

    surgery.otId = otId;
    surgery.scheduledTime = scheduledTime;
    if (surgicalTeam) {
      surgery.surgicalTeam = { ...surgery.surgicalTeam, ...surgicalTeam };
    }
    surgery.status = 'Scheduled';

    await surgery.save();

    // Mark OT as reserved if time is near, or just leave it for now. For simplicity, just update surgery.
    
    sendSuccess(res, surgery, 'Surgery scheduled successfully', 200);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/ot/surgeries/:id/status
export async function updateSurgeryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const hospitalId = req.user?.hospitalId;

    const surgery = await SurgeryRequest.findOne({ _id: id, hospitalId });
    if (!surgery) throw new AppError('Surgery request not found', 404);

    surgery.status = status;
    await surgery.save();

    // If status is In Progress, mark OT as In Surgery
    if (status === 'In Progress' && surgery.otId) {
      await OperationTheatre.findByIdAndUpdate(surgery.otId, { status: 'In Surgery' });
    }
    // If status is Completed, mark OT as Cleaning
    if (status === 'Completed' && surgery.otId) {
      await OperationTheatre.findByIdAndUpdate(surgery.otId, { status: 'Cleaning' });
    }

    sendSuccess(res, surgery, 'Surgery status updated successfully', 200);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/ot/surgeries/:id/checklist
export async function updatePreOpChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { preOpChecklist } = req.body;
    const hospitalId = req.user?.hospitalId;

    const surgery = await SurgeryRequest.findOne({ _id: id, hospitalId });
    if (!surgery) throw new AppError('Surgery request not found', 404);

    surgery.preOpChecklist = { ...surgery.preOpChecklist, ...preOpChecklist };
    await surgery.save();

    sendSuccess(res, surgery, 'Pre-Op Checklist updated successfully', 200);
  } catch (error) {
    next(error);
  }
}
