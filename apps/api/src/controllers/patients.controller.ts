import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/Patient';
import { Department } from '../models/Department';
import { Hospital } from '../models/Hospital';
import { Invitation } from '../models/AuthToken';
import { sendPatientInvitationEmail } from '../utils/email';
import { generateInvitationToken } from '../utils/jwt';
import { env } from '../config/env';
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
    const docId = req.user._id;
    const hospId = req.user.hospitalId;
    const tenId = req.user.tenantId;
    
    filter.$or = [
      { assignedDoctorId: docId },
      { hospitalId: hospId },
      { tenantId: tenId }
    ].filter(cond => Object.values(cond)[0] !== undefined);
  }

  return filter;
}

export async function listPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, hospitalId, departmentId, doctorId, assignedDoctorId, gender, search, page = '1', limit = '20' } = req.query;
    const filter = buildPatientFilter(req);

    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (hospitalId && req.user?.role === 'SUPER_ADMIN') filter.hospitalId = hospitalId;
    if (departmentId) filter.departmentId = departmentId;

    const targetDoctorId = doctorId || assignedDoctorId;
    if (targetDoctorId) filter.assignedDoctorId = targetDoctorId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { uhid: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Find emails of patient users who are still Pending activation
    const { User } = await import('../models/User');
    const pendingPatientUsers = await User.find({ role: 'PATIENT', status: 'Pending' }).select('email');
    const pendingEmails = pendingPatientUsers.map(u => u.email.toLowerCase()).filter(Boolean);
    if (pendingEmails.length > 0) {
      filter.email = { $nin: pendingEmails };
    }

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
      .populate('assignedDoctorId', 'name email specialty')
      .populate('departmentId', 'name');
    if (!patient) throw new NotFoundError('Patient not found');

    // Scope check
    if (req.user?.role === 'DOCTOR') {
      const rawDoc: any = patient.assignedDoctorId;
      const assignedDocId = typeof rawDoc === 'object' && rawDoc !== null
        ? rawDoc._id?.toString()
        : rawDoc?.toString();

      const isSameHospital = (patient.hospitalId as any)?.toString() === (req.user.hospitalId as any)?.toString();
      const isSameTenant = (patient.tenantId as any)?.toString() === (req.user.tenantId as any)?.toString();
      const isAssignedDoctor = assignedDocId === (req.user._id as any)?.toString();

      if (!isAssignedDoctor && !isSameHospital && !isSameTenant) {
        throw new ForbiddenError('Access denied to this patient');
      }
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
      assignedDoctorId: req.body.assignedDoctorId || (req.user?.role === 'DOCTOR' ? req.user._id : undefined),
    });

    // Update department patient count
    if (patient.departmentId) {
      await Department.findByIdAndUpdate(patient.departmentId, { $inc: { patientCount: 1 } });
      if (patient.status === 'Admitted' || patient.status === 'ICU') {
        await Department.findByIdAndUpdate(patient.departmentId, { $inc: { occupiedBeds: 1 } });
      }
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

    // Create User record and send patient invitation email
    if (patient.email) {
      const { User } = await import('../models/User');
      let dbUser = await User.findOne({ email: patient.email.toLowerCase() });
      if (!dbUser) {
        dbUser = await User.create({
          name: patient.name,
          email: patient.email.toLowerCase(),
          password: 'password123',
          role: 'PATIENT',
          status: 'Pending',
          tenantId: patient.tenantId,
          hospitalId: patient.hospitalId,
          departmentId: patient.departmentId,
          phone: patient.phone,
        });
      }

      const { token, hash } = generateInvitationToken(dbUser._id.toString(), dbUser.email, dbUser.name);

      await Invitation.create({
        tokenHash: hash,
        userId: dbUser._id,
        email: dbUser.email,
        role: 'PATIENT',
        hospitalId: dbUser.hospitalId,
        departmentId: dbUser.departmentId,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      });

      setImmediate(() => {
        sendPatientInvitationEmail({
          to: dbUser.email,
          name: dbUser.name,
          invitationToken: token,
          portalUrl: env.frontends.patientPortal || 'http://localhost:3003',
        }).catch((mailErr: any) => {
          console.warn(`📧 Failed to send patient invitation email to ${dbUser.email}:`, mailErr?.message || mailErr);
        });
      });
    }

    sendCreated(res, patient, 'Patient created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const originalPatient = await Patient.findById(req.params.id);
    if (!originalPatient) throw new NotFoundError('Patient not found');

    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) throw new NotFoundError('Patient not found');

    // HIERARCHICAL SYNC: Department patientCount
    if (originalPatient.departmentId?.toString() !== patient.departmentId?.toString()) {
      if (originalPatient.departmentId) {
        await Department.findByIdAndUpdate(originalPatient.departmentId, { $inc: { patientCount: -1 } });
      }
      if (patient.departmentId) {
        await Department.findByIdAndUpdate(patient.departmentId, { $inc: { patientCount: 1 } });
      }
    }

    // HIERARCHICAL SYNC: Hospital patientCount
    if (originalPatient.hospitalId?.toString() !== patient.hospitalId?.toString()) {
      if (originalPatient.hospitalId) {
        await Hospital.findByIdAndUpdate(originalPatient.hospitalId, { $inc: { patientCount: -1 } });
      }
      if (patient.hospitalId) {
        await Hospital.findByIdAndUpdate(patient.hospitalId, { $inc: { patientCount: 1 } });
      }
    }

    // HIERARCHICAL SYNC: Occupied beds
    const oldOccupied = originalPatient.status === 'Admitted' || originalPatient.status === 'ICU';
    const newOccupied = patient.status === 'Admitted' || patient.status === 'ICU';

    if (oldOccupied !== newOccupied || (oldOccupied && newOccupied && originalPatient.departmentId?.toString() !== patient.departmentId?.toString())) {
      // Remove from old if it was occupied
      if (oldOccupied && originalPatient.departmentId) {
        await Department.findByIdAndUpdate(originalPatient.departmentId, { $inc: { occupiedBeds: -1 } });
      }
      // Add to new if it is now occupied
      if (newOccupied && patient.departmentId) {
        await Department.findByIdAndUpdate(patient.departmentId, { $inc: { occupiedBeds: 1 } });
      }
    }

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
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) throw new NotFoundError('Patient not found');

    if (patient.departmentId) {
      const incs: any = { patientCount: -1 };
      if (patient.status === 'Admitted' || patient.status === 'ICU') {
        incs.occupiedBeds = -1;
      }
      await Department.findByIdAndUpdate(patient.departmentId, { $inc: incs });
    }
    if (patient.hospitalId) {
      await Hospital.findByIdAndUpdate(patient.hospitalId, { $inc: { patientCount: -1 } });
    }

    sendSuccess(res, null, 'Patient deleted completely from database');
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
