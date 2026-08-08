import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/Patient';
import { Department } from '../models/Department';
import { Hospital } from '../models/Hospital';
import { Invitation } from '../models/AuthToken';
import { sendPatientInvitationEmail } from '../utils/email';
import { generateInvitationToken } from '../utils/jwt';
import { env } from '../config/env';
import { sendSuccess, sendCreated, NotFoundError, ForbiddenError, ConflictError } from '../utils/response';

function buildPatientFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (req.user?.role !== 'SUPER_ADMIN') {
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;
  }

  if (req.user?.role === 'HOSPITAL_ADMIN' || req.user?.role === 'DEPT_ADMIN' || req.user?.role === 'DOCTOR' || req.user?.role === 'NURSE' || req.user?.role === 'RECEPTIONIST' || req.user?.role === 'STAFF') {
    if (req.user?.hospitalId) filter.hospitalId = req.user.hospitalId;
  }

  if (req.user?.role === 'DEPT_ADMIN') {
    // Skip departmentId filtering when explicitly querying a doctor's patients list
    if (!req.query.doctorId && !req.query.assignedDoctorId) {
      filter.departmentId = req.user.departmentId;
    }
  }

  // Doctor scope is now safely contained within their hospital via the hospitalId check above.
  if (req.user?.role === 'DOCTOR') {
    // If the system later requires doctors to ONLY see assigned patients,
    // we would add `filter.assignedDoctorId = req.user._id;` here.
    // Based on the original $or logic, doctors were intended to see all hospital patients.
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

export async function registerNewPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { registrationType, visitType, doctorId, referralSource, referralDoctor, notes, ...patientData } = req.body;

    // 1. Duplicate Detection
    const duplicateQuery = {
      $or: [
        { phone: patientData.phone },
        { 'identityInfo.nationalId': patientData.identityInfo?.nationalId },
      ].filter(Boolean) as any[],
    };
    
    // Only query if we have valid non-empty fields to check
    if (duplicateQuery.$or.length > 0) {
      const existing = await Patient.findOne(duplicateQuery);
      if (existing) {
        throw new ConflictError('A patient with this mobile number or national ID already exists.');
      }
    }

    const patient = await Patient.create({
      ...patientData,
      tenantId: patientData.tenantId || req.user?.tenantId,
      hospitalId: patientData.hospitalId || req.user?.hospitalId,
      departmentId: patientData.departmentId || (req.user?.role === 'DEPT_ADMIN' ? req.user.departmentId : undefined),
      assignedDoctorId: patientData.assignedDoctorId || (req.user?.role === 'DOCTOR' ? req.user._id : undefined),
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

    // 2. Create Encounter Record
    const { Encounter } = await import('../models/Encounter');
    const encounter = await Encounter.create({
      tenantId: patient.tenantId,
      hospitalId: patient.hospitalId,
      departmentId: patient.departmentId,
      patientId: patient._id,
      encounterType: registrationType || 'OPD',
      category: visitType || 'New Visit',
      doctorId: doctorId || patient.assignedDoctorId,
      referralSource,
      referralDoctor,
      notes,
      registeredBy: req.user?._id,
      status: 'Checked-In',
    });

    sendCreated(res, { patient, encounter }, 'Patient registered successfully');
  } catch (err) {
    next(err);
  }
}

export async function registerReturningPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, registrationType, visitType, doctorId, referralSource, referralDoctor, notes, ...updateData } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) throw new NotFoundError('Patient not found');

    // Update patient if new demographics were provided
    if (Object.keys(updateData).length > 0) {
      Object.assign(patient, updateData);
      await patient.save();
    }

    // Create Encounter Record
    const { Encounter } = await import('../models/Encounter');
    const encounter = await Encounter.create({
      tenantId: patient.tenantId,
      hospitalId: patient.hospitalId,
      departmentId: patient.departmentId,
      patientId: patient._id,
      encounterType: registrationType || 'OPD',
      category: visitType || 'Follow-up Visit',
      doctorId: doctorId || patient.assignedDoctorId,
      referralSource,
      referralDoctor,
      notes,
      registeredBy: req.user?._id,
      status: 'Checked-In',
    });

    sendCreated(res, { patient, encounter }, 'Returning patient registered successfully');
  } catch (err) {
    next(err);
  }
}

export async function searchPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q, phone, uhid, nationalId } = req.body;
    
    const query: any = {};
    if (req.user?.tenantId) query.tenantId = req.user.tenantId;

    if (uhid) {
      query.uhid = uhid;
    } else if (nationalId) {
      query['identityInfo.nationalId'] = nationalId;
    } else if (phone) {
      query.phone = phone;
    } else if (q) {
      query.$text = { $search: q };
    }

    const patients = await Patient.find(query).limit(10).lean();
    sendSuccess(res, patients, 'Patients retrieved successfully');
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

// ----------------------------------------------------------------------
// FEATURE 4: DEMOGRAPHIC MANAGEMENT APIs
// ----------------------------------------------------------------------

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new NotFoundError('Patient not found');

    const allowedFields = [
      'name', 'middleName', 'lastName', 'preferredName', 'gender', 'dateOfBirth',
      'bloodGroup', 'maritalStatus', 'occupation', 'nationality', 'religion',
      'preferredLanguage', 'phone', 'secondaryMobile', 'email', 'emergencyContact', 'communicationPreferences'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (patient as any)[field] = req.body[field];
      }
    });

    patient.timeline.push({
      title: 'Profile Updated',
      description: 'Demographic information was updated',
      date: new Date(),
      type: 'registration',
      createdBy: req.user?.name,
    });

    await patient.save();
    sendSuccess(res, patient, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new NotFoundError('Patient not found');

    patient.address = req.body.address;
    
    patient.timeline.push({
      title: 'Address Updated',
      description: 'Patient address details were updated',
      date: new Date(),
      type: 'registration',
      createdBy: req.user?.name,
    });

    await patient.save();
    sendSuccess(res, patient, 'Address updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function addIdentityDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new NotFoundError('Patient not found');

    const { type, idNumber, expiryDate, issuingAuthority } = req.body;
    
    // Check for duplicate
    const exists = patient.identityInfo.find(doc => doc.type === type && doc.idNumber === idNumber);
    if (exists) throw new ConflictError('Identity document already exists');

    patient.identityInfo.push({ type, idNumber, expiryDate, issuingAuthority });
    
    patient.timeline.push({
      title: 'Identity Document Added',
      description: `${type} added to profile`,
      date: new Date(),
      type: 'registration',
      createdBy: req.user?.name,
    });

    await patient.save();
    sendSuccess(res, patient, 'Identity document added successfully');
  } catch (err) {
    next(err);
  }
}

export async function uploadPhotograph(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new NotFoundError('Patient not found');

    // In a real scenario, handle file upload to S3/Cloud Storage and get URL
    const { photoUrl } = req.body; 
    if (!photoUrl) throw new Error('Photo URL is required');

    patient.photoUrl = photoUrl;
    
    patient.timeline.push({
      title: 'Photograph Updated',
      description: 'Patient profile photograph was uploaded/changed',
      date: new Date(),
      type: 'registration',
      createdBy: req.user?.name,
    });

    await patient.save();
    sendSuccess(res, patient, 'Photograph uploaded successfully');
  } catch (err) {
    next(err);
  }
}

export async function removePhotograph(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new NotFoundError('Patient not found');

    patient.photoUrl = undefined;
    
    patient.timeline.push({
      title: 'Photograph Removed',
      description: 'Patient profile photograph was removed',
      date: new Date(),
      type: 'registration',
      createdBy: req.user?.name,
    });

    await patient.save();
    sendSuccess(res, patient, 'Photograph removed successfully');
  } catch (err) {
    next(err);
  }
}
