import { Request, Response, NextFunction } from 'express';
import { Encounter } from '../models/Encounter';
import { Patient } from '../models/Patient';
import { sendSuccess, sendCreated, NotFoundError, ForbiddenError } from '../utils/response';

export async function registerOpd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, departmentId, doctorId, category, referralSource, referralDoctor, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) throw new NotFoundError('Patient not found');

    const encounter = await Encounter.create({
      tenantId: patient.tenantId,
      hospitalId: patient.hospitalId,
      departmentId,
      patientId,
      encounterType: 'OPD',
      category: category || 'Walk-in',
      doctorId,
      referralSource,
      referralDoctor,
      notes,
      registeredBy: req.user?._id,
      status: 'Checked-In'
    });

    sendCreated(res, encounter, 'OPD Encounter created successfully');
  } catch (err) {
    next(err);
  }
}

export async function registerIpd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, departmentId, doctorId, category, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) throw new NotFoundError('Patient not found');

    const encounter = await Encounter.create({
      tenantId: patient.tenantId,
      hospitalId: patient.hospitalId,
      departmentId,
      patientId,
      encounterType: 'IPD',
      category: category || 'Scheduled Appointment',
      doctorId,
      notes,
      registeredBy: req.user?._id,
      status: 'Scheduled'
    });

    // Automatically update patient status
    patient.status = 'Admitted';
    patient.timeline.push({
      title: 'IPD Admission Created',
      description: `Visit Number: ${encounter.visitNumber}`,
      date: new Date(),
      type: 'admission',
      createdBy: req.user?.name,
    });
    await patient.save();

    sendCreated(res, encounter, 'IPD Encounter created successfully');
  } catch (err) {
    next(err);
  }
}

export async function registerEmergency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, doctorId, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) throw new NotFoundError('Patient not found');

    const encounter = await Encounter.create({
      tenantId: patient.tenantId,
      hospitalId: patient.hospitalId,
      patientId,
      encounterType: 'Emergency',
      category: 'Emergency Visit',
      doctorId,
      notes,
      registeredBy: req.user?._id,
      status: 'Checked-In'
    });

    sendCreated(res, encounter, 'Emergency Encounter created successfully');
  } catch (err) {
    next(err);
  }
}

export async function getEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const encounter = await Encounter.findById(req.params.id)
      .populate('patientId', 'name uhid phone')
      .populate('doctorId', 'name')
      .populate('departmentId', 'name');
      
    if (!encounter) throw new NotFoundError('Encounter not found');
    sendSuccess(res, encounter);
  } catch (err) {
    next(err);
  }
}

export async function updateEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const encounter = await Encounter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!encounter) throw new NotFoundError('Encounter not found');
    
    sendSuccess(res, encounter, 'Encounter updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function cancelEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const encounter = await Encounter.findById(req.params.id);
    if (!encounter) throw new NotFoundError('Encounter not found');

    if (encounter.status === 'Completed') {
      throw new ForbiddenError('Cannot cancel a completed encounter');
    }

    encounter.status = 'Cancelled';
    await encounter.save();

    sendSuccess(res, encounter, 'Encounter cancelled successfully');
  } catch (err) {
    next(err);
  }
}
