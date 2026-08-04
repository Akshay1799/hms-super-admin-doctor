import mongoose, { Document, Schema, Model } from 'mongoose';

export type DoctorProfileStatus = 'Draft' | 'Pending Verification' | 'Pending Approval' | 'Active' | 'On Leave' | 'Suspended' | 'Retired' | 'Archived';

export interface IDoctorQualification {
  degree: string;
  specialization: string;
  university: string;
  institution: string;
  country: string;
  completionYear: number;
  registrationNumber?: string;
  documentUrl?: string; // e.g. Cloudinary/S3 URL
}

export interface IDoctorSpecialization {
  primarySpecialization: string;
  secondarySpecialization?: string;
  yearsOfExperience: number;
  activeStatus: boolean;
}

export interface IDoctorExperience {
  hospitalName: string;
  organization: string;
  position: string;
  department: string;
  startDate: Date;
  endDate?: Date;
  totalDuration?: string;
  responsibilities?: string;
}

export interface IDoctorRegistration {
  medicalRegistrationNumber: string;
  registrationCouncil: string;
  registrationDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

export interface IDoctorProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional until linked
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  
  // Basic Info
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: Date;
  nationality?: string;
  photographUrl?: string;
  
  // Professional Info
  doctorCategory?: string;
  employmentType?: string;
  consultantType?: string;
  
  // Contact
  mobileNumber: string;
  email: string;
  officeExtension?: string;
  emergencyContact?: string;
  
  // Arrays of Nested Data
  qualifications: IDoctorQualification[];
  specializations: IDoctorSpecialization[];
  experience: IDoctorExperience[];
  registrations: IDoctorRegistration[];
  
  languages: string[];
  clinicalPrivileges: string[];
  
  // Operational Status
  departments: mongoose.Types.ObjectId[];
  status: DoctorProfileStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

const QualificationSchema = new Schema<IDoctorQualification>({
  degree: { type: String, required: true },
  specialization: { type: String, required: true },
  university: { type: String, required: true },
  institution: { type: String, required: true },
  country: { type: String, required: true },
  completionYear: { type: Number, required: true },
  registrationNumber: String,
  documentUrl: String
});

const SpecializationSchema = new Schema<IDoctorSpecialization>({
  primarySpecialization: { type: String, required: true },
  secondarySpecialization: String,
  yearsOfExperience: { type: Number, required: true },
  activeStatus: { type: Boolean, default: true }
});

const ExperienceSchema = new Schema<IDoctorExperience>({
  hospitalName: { type: String, required: true },
  organization: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  totalDuration: String,
  responsibilities: String
});

const RegistrationSchema = new Schema<IDoctorRegistration>({
  medicalRegistrationNumber: { type: String, required: true },
  registrationCouncil: { type: String, required: true },
  registrationDate: { type: Date, required: true },
  expiryDate: Date,
  documentUrl: String
});

const DoctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },

    title: String,
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    preferredName: String,
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dateOfBirth: { type: Date, required: true },
    nationality: String,
    photographUrl: String,

    doctorCategory: String,
    employmentType: String,
    consultantType: String,

    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    officeExtension: String,
    emergencyContact: String,

    qualifications: [QualificationSchema],
    specializations: [SpecializationSchema],
    experience: [ExperienceSchema],
    registrations: [RegistrationSchema],

    languages: [{ type: String }],
    clinicalPrivileges: [{ type: String }],

    departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    status: {
      type: String,
      enum: ['Draft', 'Pending Verification', 'Pending Approval', 'Active', 'On Leave', 'Suspended', 'Retired', 'Archived'],
      default: 'Draft'
    }
  },
  { timestamps: true }
);

// Indexes
DoctorProfileSchema.index({ email: 1 });
DoctorProfileSchema.index({ mobileNumber: 1 });
DoctorProfileSchema.index({ 'registrations.medicalRegistrationNumber': 1 });
DoctorProfileSchema.index({ departments: 1 });
DoctorProfileSchema.index({ tenantId: 1, hospitalId: 1 });

export const DoctorProfile = mongoose.model<IDoctorProfile>('DoctorProfile', DoctorProfileSchema);
export default DoctorProfile;
