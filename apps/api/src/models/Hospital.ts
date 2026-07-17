import mongoose, { Document, Schema } from 'mongoose';

export interface IHospital extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  type: 'General' | 'Specialty' | 'Teaching' | 'Clinic' | 'Diagnostic';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Under Review';
  // Contact
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  // Capacity
  capacity: {
    totalBeds: number;
    icuBeds: number;
    otRooms: number;
    ambulances: number;
    emergencyBeds?: number;
  };
  // Accreditation
  accreditation: {
    nabh: boolean;
    jci: boolean;
    iso: boolean;
    others?: string[];
  };
  // Settings
  settings: {
    timezone: string;
    currency: string;
    language: string;
    workingHours?: { open: string; close: string };
  };
  // Admin
  adminId?: mongoose.Types.ObjectId;  // HOSPITAL_ADMIN user
  // Computed denormalized counts
  branchCount: number;
  departmentCount: number;
  doctorCount: number;
  patientCount: number;
  bedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['General', 'Specialty', 'Teaching', 'Clinic', 'Diagnostic'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Under Review'],
      default: 'Active',
    },
    email: String,
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      pincode: String,
    },
    capacity: {
      totalBeds: { type: Number, default: 0 },
      icuBeds: { type: Number, default: 0 },
      otRooms: { type: Number, default: 0 },
      ambulances: { type: Number, default: 0 },
      emergencyBeds: { type: Number, default: 0 },
    },
    accreditation: {
      nabh: { type: Boolean, default: false },
      jci: { type: Boolean, default: false },
      iso: { type: Boolean, default: false },
      others: [String],
    },
    settings: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR' },
      language: { type: String, default: 'en' },
      workingHours: { open: String, close: String },
    },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    branchCount: { type: Number, default: 0 },
    departmentCount: { type: Number, default: 0 },
    doctorCount: { type: Number, default: 0 },
    patientCount: { type: Number, default: 0 },
    bedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

HospitalSchema.index({ tenantId: 1, code: 1 }, { unique: true });
HospitalSchema.index({ status: 1 });

export const Hospital = mongoose.model<IHospital>('Hospital', HospitalSchema);
