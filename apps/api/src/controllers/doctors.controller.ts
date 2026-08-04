import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { DoctorProfile } from '../models/DoctorProfile';
import { Roster } from '../models/Roster';
import { Prescription } from '../models/Prescription';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendCreated, NotFoundError, ForbiddenError } from '../utils/response';

// ── 1. Doctor Profiles & Availability ─────────────────────────────

export async function listDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentId, specialty, search, availableDay, page = '1', limit = '50' } = req.query;
    const filter: Record<string, unknown> = { role: 'DOCTOR' };

    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) {
      filter.tenantId = req.user.tenantId;
    }
    if (req.user?.hospitalId) {
      filter.hospitalId = req.user.hospitalId;
    }
    if (departmentId) filter.departmentId = departmentId;
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (availableDay) filter.availableDays = availableDay;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      User.find(filter)
        .populate('departmentId', 'name')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, doctors, 'Doctor profiles retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getDoctorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctor = await User.findById(req.params.id).populate('departmentId', 'name');
    if (!doctor || doctor.role !== 'DOCTOR') {
      throw new NotFoundError('Doctor profile not found');
    }
    sendSuccess(res, doctor);
  } catch (err) {
    next(err);
  }
}

export async function updateDoctorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctorId = req.params.id;

    // Scope check: Doctors can only update their own profile unless Admin
    if (req.user?.role === 'DOCTOR' && req.user._id.toString() !== doctorId) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const {
      specialty,
      qualifications,
      experience,
      consultationFee,
      consultationRoom,
      availableDays,
      shiftStartTime,
      shiftEndTime,
      phone,
      bio,
    } = req.body;

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      {
        $set: {
          specialty,
          qualifications,
          experience,
          consultationFee,
          consultationRoom,
          availableDays,
          shiftStartTime,
          shiftEndTime,
          phone,
          bio,
        },
      },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name');

    if (!doctor) throw new NotFoundError('Doctor profile not found');

    // Audit log
    await AuditLog.create({
      tenantId: doctor.tenantId,
      userId: req.user?._id,
      action: 'UPDATE_DOCTOR_PROFILE',
      resource: 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { doctorId, updatedBy: req.user?.name },
    });

    sendSuccess(res, doctor, 'Doctor profile updated successfully');
  } catch (err) {
    next(err);
  }
}

// ── 1b. Enterprise Doctor Profile (Feature 1) ──────────────────────

export const createDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenantId;
    const hospitalId = req.user?.hospitalId;
    
    if (!tenantId || !hospitalId) {
      return res.status(403).json({ message: 'User must belong to a tenant and hospital.' });
    }
    
    // Check if profile with email or medical registration number already exists
    const existingProfile = await DoctorProfile.findOne({
      $or: [
        { email: req.body.email },
        { mobileNumber: req.body.mobileNumber }
      ],
      tenantId,
      hospitalId
    });

    if (existingProfile) {
      return res.status(400).json({ message: 'Doctor profile with this email or mobile number already exists.' });
    }

    const profile = new DoctorProfile({
      ...req.body,
      tenantId,
      hospitalId,
      status: req.body.status || 'Draft'
    });

    await profile.save();
    
    await AuditLog.create({
      tenantId,
      userId: req.user?._id,
      action: 'CREATE_DOCTOR_PROFILE',
      resource: 'DoctorProfile',
      ipAddress: req.ip,
      metadata: { profileId: profile._id },
    });

    res.status(201).json({ message: 'Doctor profile created successfully.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating doctor profile', error: error.message });
  }
};

export const getEnterpriseDoctorProfile = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findById(req.params.id)
      .populate('userId', 'name email status role')
      .populate('departments', 'name code');

    if (!profile || (profile.tenantId.toString() !== req.user?.tenantId?.toString())) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching doctor profile', error: error.message });
  }
};

export const updateEnterpriseDoctorProfile = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    // Prevent modification of nested arrays directly through this endpoint
    const { qualifications, specializations, experience, registrations, clinicalPrivileges, status, ...updateData } = req.body;
    
    Object.assign(profile, updateData);
    await profile.save();

    await AuditLog.create({
      tenantId: profile.tenantId,
      userId: req.user?._id,
      action: 'UPDATE_DOCTOR_PROFILE',
      resource: 'DoctorProfile',
      ipAddress: req.ip,
      metadata: { profileId: profile._id },
    });

    res.status(200).json({ message: 'Doctor profile updated.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating doctor profile', error: error.message });
  }
};

export const addQualification = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    profile.qualifications.push(req.body);
    await profile.save();
    res.status(200).json({ message: 'Qualification added.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding qualification', error: error.message });
  }
};

export const addSpecialization = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    profile.specializations.push(req.body);
    await profile.save();
    res.status(200).json({ message: 'Specialization added.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding specialization', error: error.message });
  }
};

export const addExperience = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    profile.experience.push(req.body);
    await profile.save();
    res.status(200).json({ message: 'Experience added.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding experience', error: error.message });
  }
};

export const addRegistration = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    const exists = profile.registrations.some(r => r.medicalRegistrationNumber === req.body.medicalRegistrationNumber);
    if (exists) return res.status(400).json({ message: 'Medical registration number already exists.' });

    profile.registrations.push(req.body);
    await profile.save();
    res.status(200).json({ message: 'Registration added.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding registration', error: error.message });
  }
};

export const updateProfileStatus = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    const validStatuses = ['Draft', 'Pending Verification', 'Pending Approval', 'Active', 'On Leave', 'Suspended', 'Retired', 'Archived'];
    if (!validStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status provided.' });

    profile.status = req.body.status;
    await profile.save();
    res.status(200).json({ message: `Doctor status updated to ${req.body.status}`, profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

export const assignClinicalPrivileges = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found.' });

    if (!Array.isArray(req.body.clinicalPrivileges)) return res.status(400).json({ message: 'Clinical privileges must be an array.' });

    profile.clinicalPrivileges = req.body.clinicalPrivileges;
    await profile.save();
    res.status(200).json({ message: 'Clinical privileges updated.', profile });
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning privileges', error: error.message });
  }
};

// ── 2. Digital Prescription & Consultation Notes ─────────────────

export async function createPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      patientId,
      appointmentId,
      visitType = 'OPD',
      vitals,
      symptoms,
      diagnoses,
      medicines,
      labTestsRequested,
      radiologyRequested,
      consultationNotes,
      treatmentPlan,
      followUpDate,
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) throw new NotFoundError('Patient record not found');

    const doctorId = req.user?.role === 'DOCTOR' ? req.user._id : req.body.doctorId;
    const doctorName = req.user?.name || req.body.doctorName || 'Attending Physician';

    const prescription = await Prescription.create({
      tenantId: patient.tenantId,
      hospitalId: patient.hospitalId,
      departmentId: patient.departmentId,
      patientId: patient._id,
      patientName: patient.name,
      uhid: patient.uhid || 'UHID-UNASSIGNED',
      doctorId,
      doctorName,
      appointmentId,
      visitType,
      vitals,
      symptoms,
      diagnoses,
      medicines,
      labTestsRequested,
      radiologyRequested,
      consultationNotes,
      treatmentPlan,
      followUpDate,
    });

    // CROSS-MODULE SYNC: Synchronize EMR Sub-documents into Patient record
    if (vitals) {
      patient.vitals.push({ ...vitals, timestamp: new Date(), recordedBy: doctorName });
    }
    if (medicines && medicines.length > 0) {
      medicines.forEach((m: any) => {
        patient.medications.push({
          name: m.name,
          dose: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          timing: m.instructions,
          status: 'Active',
          prescribedBy: doctorName,
          startDate: new Date(),
        });
      });
    }
    if (diagnoses && diagnoses.length > 0) {
      diagnoses.forEach((d: any) => {
        patient.diagnoses.push({
          code: d.code,
          description: d.description,
          date: new Date(),
          status: 'Active',
          diagnosedBy: doctorName,
        });
      });
    }

    patient.timeline.push({
      title: `E-Prescription Issued (${visitType})`,
      description: `Prescribed ${medicines?.length || 0} medicines by Dr. ${doctorName}`,
      date: new Date(),
      type: 'prescription',
      createdBy: doctorName,
    });

    await patient.save();

    // If linked to an appointment, mark status as Completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });
    }

    // Audit log
    await AuditLog.create({
      tenantId: patient.tenantId,
      userId: req.user?._id,
      action: 'CREATE_PRESCRIPTION',
      resource: 'Prescription',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { prescriptionId: prescription._id, patientId: patient._id },
    });

    sendCreated(res, prescription, 'Digital Prescription generated successfully');
  } catch (err) {
    next(err);
  }
}

export async function listPrescriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, doctorId, page = '1', limit = '20' } = req.query;
    const filter: Record<string, unknown> = {};

    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) {
      filter.tenantId = req.user.tenantId;
    }
    if (req.user?.role === 'DOCTOR') {
      filter.doctorId = req.user._id;
    } else if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (patientId) filter.patientId = patientId;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Prescription.countDocuments(filter),
    ]);

    sendSuccess(res, prescriptions, 'Prescriptions retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) throw new NotFoundError('Prescription not found');
    sendSuccess(res, prescription);
  } catch (err) {
    next(err);
  }
}

// ── 3. OPD/IPD Visit Assignment & Patient History Tracking ───────

export async function assignDoctorVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, doctorId, ward, bedNumber, visitNotes } = req.body;

    const [patient, doctor] = await Promise.all([
      Patient.findById(patientId),
      User.findById(doctorId),
    ]);

    if (!patient) throw new NotFoundError('Patient record not found');
    if (!doctor || doctor.role !== 'DOCTOR') throw new NotFoundError('Doctor not found');

    patient.assignedDoctorId = doctor._id;
    if (ward) patient.ward = ward;
    if (bedNumber) patient.bedNumber = bedNumber;

    patient.timeline.push({
      title: `Visit Assigned to Dr. ${doctor.name}`,
      description: visitNotes || `Assigned to ${ward || 'OPD / Ward'}`,
      date: new Date(),
      type: 'admission',
      createdBy: req.user?.name,
    });

    await patient.save();

    sendSuccess(res, patient, `Patient visit successfully assigned to Dr. ${doctor.name}`);
  } catch (err) {
    next(err);
  }
}

export async function getDoctorPatientHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctorId = req.user?.role === 'DOCTOR' ? req.user._id : req.params.doctorId;

    const [patients, appointments, prescriptions] = await Promise.all([
      Patient.find({ assignedDoctorId: doctorId }).sort({ updatedAt: -1 }).limit(50),
      Appointment.find({ doctorId }).sort({ date: -1 }).limit(50),
      Prescription.find({ doctorId }).sort({ createdAt: -1 }).limit(50),
    ]);

    sendSuccess(res, {
      patients,
      appointments,
      prescriptions,
    }, 'Doctor patient visit history retrieved');
  } catch (err) {
    next(err);
  }
}
