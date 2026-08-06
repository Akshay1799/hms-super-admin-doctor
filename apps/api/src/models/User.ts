import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DEPT_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'STAFF'
  | 'HR_ADMIN'
  | 'PATIENT'
  | 'PHARMACY_MANAGER'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'PATHOLOGIST'
  | 'BILLING_EXECUTIVE';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  tenantId: mongoose.Types.ObjectId | null;
  hospitalId: mongoose.Types.ObjectId | null;
  departmentId: mongoose.Types.ObjectId | null;
  // Clinical fields (for DOCTOR)
  specialty?: string;
  qualifications?: string[];
  experience?: number;  // years
  consultationFee?: number;
  consultationRoom?: string;
  availableDays?: string[]; // e.g. ['Monday', 'Tuesday', 'Wednesday']
  shiftStartTime?: string;  // e.g. '09:00'
  shiftEndTime?: string;    // e.g. '17:00'
  bio?: string;
  phone?: string;
  avatar?: string;
  // Preferences
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  // MFA
  mfaEnabled?: boolean;
  mfaMethod?: 'email' | 'sms' | 'authenticator';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF', 'PATIENT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
      default: 'Active',
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', default: null, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
    specialty: { type: String },
    qualifications: [{ type: String }],
    experience: { type: Number },
    consultationFee: { type: Number, default: 0 },
    consultationRoom: { type: String },
    availableDays: [{ type: String }],
    shiftStartTime: { type: String, default: '09:00' },
    shiftEndTime: { type: String, default: '17:00' },
    bio: { type: String },
    phone: { type: String },
    avatar: { type: String },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    mfaEnabled: { type: Boolean, default: false },
    mfaMethod: { type: String, enum: ['email', 'sms', 'authenticator'] },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static findByEmail
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Remove password from JSON output
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    return ret;
  },
});

export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
