import { Request, Response, NextFunction } from 'express';
import { Patient } from '../models/Patient';
import { Department } from '../models/Department';
import { Hospital } from '../models/Hospital';
import { sendSuccess, sendCreated, NotFoundError, ForbiddenError } from '../utils/response';

function buildPatientFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (req.user?.role !== 'SUPER_ADMIN') {
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;
  }

  if (req.user?.role === 'HOSPITAL_ADMIN') {
    filter.hospitalId = req.user.hospitalId;
  }

  if (req.user?.role === 'DEPT_ADMIN') {
    // Skip departmentId filtering when explicitly querying a doctor's patients list
    if (!req.query.doctorId && !req.query.assignedDoctorId) {
      filter.departmentId = req.user.departmentId;
    }
  }

  if (req.user?.role === 'DOCTOR') {
    filter.assignedDoctorId = req.user._id;
  }

  return filter;
}

export async function listPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, hospitalId, departmentId, doctorId, assignedDoctorId, search, page = '1', limit = '20' } = req.query;
    const filter = buildPatientFilter(req);

    if (status) filter.status = status;
    if (hospitalId && req.user?.role === 'SUPER_ADMIN') filter.hospitalId = hospitalId;
    if (departmentId) filter.departmentId = departmentId;

    const targetDoctorId = doctorId || assignedDoctorId;
    if (targetDoctorId) filter.assignedDoctorId = targetDoctorId;
    if (search) filter.name = { $regex: search, $options: 'i' };

    console.log('[DEBUG] listPatients query filter:', JSON.stringify(filter));

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .select('-vitals -medications -diagnoses -soapNotes -timeline -scans') // exclude sub-docs for list view
        .populate('assignedDoctorId', 'name email specialty')
        .populate('departmentId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Patient.countDocuments(filter),
    ]);

    sendSuccess(res, patients, 'Patients retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPatientProfileMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      throw new ForbiddenError('Unauthorized context');
    }

    const patient = await Patient.findOne({ email: req.user.email.toLowerCase() })
      .populate('assignedDoctorId', 'name email specialty');

    if (!patient) {
      throw new NotFoundError('Patient EMR profile not found for this user account');
    }

    sendSuccess(res, patient);
  } catch (err) {
    next(err);
  }
}

export async function getPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctorId', 'name email specialty');
    if (!patient) throw new NotFoundError('Patient not found');

    // Scope check
    if (req.user?.role === 'DOCTOR' &&
      patient.assignedDoctorId?.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Access denied to this patient');
    }

    sendSuccess(res, patient);
  } catch (err) {
    next(err);
  }
}

export async function createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.create({
      ...req.body,
      tenantId: req.body.tenantId || req.user?.tenantId,
      hospitalId: req.body.hospitalId || req.user?.hospitalId,
      departmentId: req.body.departmentId || (req.user?.role === 'DEPT_ADMIN' ? req.user.departmentId : undefined),
    });

    // Update department patient count
    if (patient.departmentId) {
      await Department.findByIdAndUpdate(patient.departmentId, { $inc: { patientCount: 1 } });
    }
    if (patient.hospitalId) {
      await Hospital.findByIdAndUpdate(patient.hospitalId, { $inc: { patientCount: 1 } });
    }

    // Add admission event to timeline
    if (patient.status === 'Admitted') {
      patient.timeline.push({
        title: 'Patient Admitted',
        description: `Admitted to ${req.body.ward || 'ward'}`,
        date: new Date(),
        type: 'admission',
        createdBy: req.user?.name,
      });
      await patient.save();
    }

    sendCreated(res, patient, 'Patient created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) throw new NotFoundError('Patient not found');

    // HIERARCHICAL SYNC: If Patient details changed, sync name/phone to User account!
    if (patient.email) {
      const { User } = await import('../models/User');
      await User.findOneAndUpdate(
        { email: patient.email.toLowerCase() },
        {
          name: patient.name,
          phone: patient.phone,
        }
      );
    }

    sendSuccess(res, patient, 'Patient updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deletePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: 'Discharged' },
      { new: true }
    );
    if (!patient) throw new NotFoundError('Patient not found');
    sendSuccess(res, null, 'Patient discharged');
  } catch (err) {
    next(err);
  }
}

// ── EMR Sub-document actions ──────────────────────────────────

export async function addVitals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          vitals: { ...req.body, timestamp: new Date(), recordedBy: req.user?.name },
          timeline: {
            title: 'Vitals Recorded',
            date: new Date(),
            type: 'vital',
            createdBy: req.user?.name,
          },
        },
      },
      { new: true }
    );
    if (!patient) throw new NotFoundError('Patient not found');
    sendSuccess(res, patient.vitals[patient.vitals.length - 1], 'Vitals recorded');
  } catch (err) {
    next(err);
  }
}

export async function addSoapNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          soapNotes: { ...req.body, date: new Date(), author: req.user?.name, authorId: req.user?._id },
          timeline: {
            title: 'SOAP Note Added',
            date: new Date(),
            type: 'note',
            createdBy: req.user?.name,
          },
        },
      },
      { new: true }
    );
    if (!patient) throw new NotFoundError('Patient not found');
    sendSuccess(res, patient.soapNotes[patient.soapNotes.length - 1], 'SOAP note added');
  } catch (err) {
    next(err);
  }
}

export async function addDiagnosis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          diagnoses: { ...req.body, date: new Date(), diagnosedBy: req.user?.name },
          timeline: {
            title: `Diagnosis: ${req.body.description}`,
            date: new Date(),
            type: 'diagnosis',
            createdBy: req.user?.name,
          },
        },
      },
      { new: true }
    );
    if (!patient) throw new NotFoundError('Patient not found');
    sendSuccess(res, patient.diagnoses[patient.diagnoses.length - 1], 'Diagnosis added');
  } catch (err) {
    next(err);
  }
}

export async function addMedication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          medications: { ...req.body, prescribedBy: req.user?.name, startDate: new Date() },
          timeline: {
            title: `Medication: ${req.body.name}`,
            date: new Date(),
            type: 'prescription',
            createdBy: req.user?.name,
          },
        },
      },
      { new: true }
    );
    if (!patient) throw new NotFoundError('Patient not found');
    sendSuccess(res, patient.medications[patient.medications.length - 1], 'Medication added');
  } catch (err) {
    next(err);
  }
}

export async function addLabOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          scans: { ...req.body, date: new Date(), orderedBy: req.user?.name },
          timeline: {
            title: `Lab Order: ${req.body.name}`,
            date: new Date(),
            type: 'lab',
            createdBy: req.user?.name,
          },
        },
      },
      { new: true }
    );
    if (!patient) throw new NotFoundError('Patient not found');
    sendSuccess(res, patient.scans[patient.scans.length - 1], 'Lab order added');
  } catch (err) {
    next(err);
  }
}
