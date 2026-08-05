import { Request, Response, NextFunction } from 'express';
import { Prescription } from '../models/Prescription';
import { Encounter } from '../models/Encounter';
import { sendSuccess, sendCreated, NotFoundError, ValidationError, ForbiddenError } from '../utils/response';

/**
 * Mock Clinical Decision Support (CDS) engine for validation.
 * TODO: Replace with real Allergy/Interaction verification logic when data is available.
 */
async function validatePrescriptionSafety(medicines: any[], patientId: string) {
  // In a real system, we would query the Drug Interaction API and Patient Allergy records here.
  // For now, we mock the validation success.
  const hasAllergies = false; // Mock
  const hasInteractions = false; // Mock
  
  if (hasAllergies) {
    throw new ValidationError('Patient has a known allergy to one of the prescribed medications.');
  }
  
  if (hasInteractions) {
    throw new ValidationError('Severe drug-drug interaction detected.');
  }

  return { allergiesVerified: true, interactionsVerified: true };
}

export async function createPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { encounterId, patientId, medicines } = req.body;
    
    // Ensure encounter exists
    const encounter = await Encounter.findById(encounterId);
    if (!encounter) throw new NotFoundError('Encounter not found');

    // Run mock safety validations
    const safetyChecks = await validatePrescriptionSafety(medicines, patientId);

    const prescription = await Prescription.create({
      ...req.body,
      tenantId: req.user!.tenantId,
      doctorId: req.user!.id, // Set the authoring doctor
      status: 'Draft',
      allergiesVerified: safetyChecks.allergiesVerified,
      interactionsVerified: safetyChecks.interactionsVerified,
    });

    sendCreated(res, prescription, 'Draft prescription created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updatePrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId,
    });

    if (!prescription) throw new NotFoundError('Prescription not found');
    
    // Only the authoring doctor can update it
    if (prescription.doctorId.toString() !== req.user!.id) {
      throw new ForbiddenError('Only the authoring doctor can modify this prescription.');
    }

    if (prescription.status !== 'Draft' && prescription.status !== 'Under Review') {
      throw new ValidationError('Only draft prescriptions can be modified.');
    }

    // If medicines are updated, re-run safety validation
    if (req.body.medicines) {
      const safetyChecks = await validatePrescriptionSafety(req.body.medicines, prescription.patientId.toString());
      req.body.allergiesVerified = safetyChecks.allergiesVerified;
      req.body.interactionsVerified = safetyChecks.interactionsVerified;
    }

    Object.assign(prescription, req.body);
    await prescription.save();

    sendSuccess(res, prescription, 'Prescription updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function signPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId,
    });

    if (!prescription) throw new NotFoundError('Prescription not found');

    // Strict audit compliance: Only the authoring doctor can sign the prescription
    if (prescription.doctorId.toString() !== req.user!.id) {
      throw new ForbiddenError('Audit Compliance: Only the authoring doctor can digitally sign this prescription.');
    }

    if (prescription.status !== 'Draft' && prescription.status !== 'Under Review') {
      throw new ValidationError(`Cannot sign prescription in ${prescription.status} status.`);
    }

    // Transition to Issued (makes it immutable for editing and sends to pharmacy)
    prescription.status = 'Issued';
    await prescription.save();

    // TODO: Publish Domain Event 'PrescriptionIssued' for Pharmacy Module

    sendSuccess(res, prescription, 'Prescription digitally signed and issued successfully');
  } catch (err) {
    next(err);
  }
}

export async function cancelPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      throw new ValidationError('Cancellation reason is required.');
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId,
    });

    if (!prescription) throw new NotFoundError('Prescription not found');

    // Strict audit compliance: Only the authoring doctor can cancel the prescription
    if (prescription.doctorId.toString() !== req.user!.id) {
      throw new ForbiddenError('Audit Compliance: Only the authoring doctor can cancel this prescription.');
    }

    const nonCancellableStatuses = ['Partially Dispensed', 'Fully Dispensed', 'Completed', 'Cancelled', 'Archived'];
    if (nonCancellableStatuses.includes(prescription.status)) {
      throw new ValidationError(`Cannot cancel prescription because it is already ${prescription.status}.`);
    }

    prescription.status = 'Cancelled';
    prescription.cancellationReason = reason;
    await prescription.save();

    // TODO: Publish Domain Event 'PrescriptionCancelled' to notify Pharmacy

    sendSuccess(res, prescription, 'Prescription cancelled successfully');
  } catch (err) {
    next(err);
  }
}

export async function getPatientPrescriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.find({
      patientId,
      tenantId: req.user!.tenantId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, prescriptions, 'Patient prescriptions retrieved successfully');
  } catch (err) {
    next(err);
  }
}
