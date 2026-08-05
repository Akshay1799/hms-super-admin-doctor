import { Request, Response, NextFunction } from 'express';
import { ConsultationNote } from '../models/ConsultationNote';
import { Encounter } from '../models/Encounter';
import { sendSuccess, NotFoundError, ForbiddenError, ValidationError } from '../utils/response';

export async function createConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { encounterId, patientId } = req.body;
    
    // Validate encounter
    const encounter = await Encounter.findOne({ 
      _id: encounterId, 
      tenantId: req.user!.tenantId 
    });

    if (!encounter) {
      throw new NotFoundError('Encounter not found');
    }
    
    // BR-048: Exactly one encounter. BR-049: Exactly one primary doctor.
    const note = await ConsultationNote.create({
      ...req.body,
      tenantId: req.user!.tenantId,
      hospitalId: encounter.hospitalId, // inherit from encounter
      encounterId,
      patientId,
      doctorId: req.user!.id,
      status: 'Draft'
    });

    sendSuccess(res, note, 'Consultation note draft created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await ConsultationNote.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId
    });

    if (!note) throw new NotFoundError('Consultation note not found');

    // BR-049 / Strict audit compliance: Only author can update
    if (note.doctorId.toString() !== req.user!.id) {
      throw new ForbiddenError('Only the authoring doctor can update this note.');
    }

    // BR-050: Only draft consultations may be edited
    if (note.status !== 'Draft' && note.status !== 'Under Review') {
      throw new ForbiddenError(`Cannot edit note in ${note.status} status.`);
    }

    Object.assign(note, req.body);
    await note.save();

    sendSuccess(res, note, 'Consultation note updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function finalizeConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await ConsultationNote.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId
    });

    if (!note) throw new NotFoundError('Consultation note not found');

    if (note.doctorId.toString() !== req.user!.id) {
      throw new ForbiddenError('Only the authoring doctor can finalize this note.');
    }

    if (note.status !== 'Draft' && note.status !== 'Under Review') {
      throw new ForbiddenError('Only Draft notes can be finalized.');
    }

    // BR-052: Every finalized consultation must contain at least one assessment and one treatment plan.
    if (!note.assessment || note.assessment.trim() === '') {
      throw new ValidationError('Assessment is required to finalize the consultation.');
    }

    const hasTreatmentPlan = note.treatmentPlan && Object.values(note.treatmentPlan).some(val => val !== null && val !== undefined && val !== '');
    if (!hasTreatmentPlan) {
      throw new ValidationError('A treatment plan is required to finalize the consultation.');
    }

    note.status = 'Finalized';
    note.finalizedAt = new Date();
    await note.save();

    // The encounter status could theoretically be updated here, but we will keep it simple.

    sendSuccess(res, note, 'Consultation note finalized successfully');
  } catch (err) {
    next(err);
  }
}

export async function signConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await ConsultationNote.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId
    });

    if (!note) throw new NotFoundError('Consultation note not found');

    if (note.doctorId.toString() !== req.user!.id) {
      throw new ForbiddenError('Only the authoring doctor can sign this note.');
    }

    if (note.status !== 'Finalized') {
      throw new ForbiddenError('Only Finalized notes can be signed.');
    }

    note.status = 'Signed';
    note.signedAt = new Date();
    await note.save();

    sendSuccess(res, note, 'Consultation note signed successfully');
  } catch (err) {
    next(err);
  }
}

export async function getConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await ConsultationNote.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId
    }).populate('doctorId', 'name specialty');

    if (!note) throw new NotFoundError('Consultation note not found');

    sendSuccess(res, note, 'Consultation note retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function getPatientConsultations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notes = await ConsultationNote.find({
      patientId: req.params.patientId,
      tenantId: req.user!.tenantId,
      status: { $in: ['Finalized', 'Signed', 'Archived'] } // typically only show finalized history to others
    })
    .sort({ createdAt: -1 })
    .populate('doctorId', 'name specialty');

    sendSuccess(res, notes, 'Patient consultations retrieved successfully');
  } catch (err) {
    next(err);
  }
}
