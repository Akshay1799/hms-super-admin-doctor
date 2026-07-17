import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;  // unique short code e.g. "APOLLO"
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'Active' | 'Suspended' | 'Trial' | 'Inactive';
  // Contact
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  // Settings
  domain?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  // Feature flags
  featureFlags: {
    emr: boolean;
    appointments: boolean;
    billing: boolean;
    pharmacy: boolean;
    inventory: boolean;
    laboratory: boolean;
    radiology: boolean;
    insurance: boolean;
    telemedicine: boolean;
    notifications: boolean;
    reports: boolean;
  };
  // Usage quotas
  quotas: {
    maxHospitals: number;
    maxBranches: number;
    maxDoctors: number;
    maxStaff: number;
    maxPatients: number;
    maxStorageGb: number;
    maxApiCallsPerDay: number;
  };
  // Subscription
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  // Computed (denormalized for performance)
  hospitalCount: number;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Trial', 'Inactive'],
      default: 'Trial',
    },
    contactEmail: String,
    contactPhone: String,
    website: String,
    address: String,
    domain: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    featureFlags: {
      emr: { type: Boolean, default: true },
      appointments: { type: Boolean, default: true },
      billing: { type: Boolean, default: true },
      pharmacy: { type: Boolean, default: false },
      inventory: { type: Boolean, default: false },
      laboratory: { type: Boolean, default: false },
      radiology: { type: Boolean, default: false },
      insurance: { type: Boolean, default: false },
      telemedicine: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
    },
    quotas: {
      maxHospitals: { type: Number, default: 1 },
      maxBranches: { type: Number, default: 3 },
      maxDoctors: { type: Number, default: 20 },
      maxStaff: { type: Number, default: 50 },
      maxPatients: { type: Number, default: 1000 },
      maxStorageGb: { type: Number, default: 10 },
      maxApiCallsPerDay: { type: Number, default: 10000 },
    },
    subscriptionStart: Date,
    subscriptionEnd: Date,
    hospitalCount: { type: Number, default: 0 },
    userCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TenantSchema.index({ status: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
