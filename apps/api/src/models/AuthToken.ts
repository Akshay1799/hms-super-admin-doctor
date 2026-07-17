import mongoose, { Document, Schema } from 'mongoose';

// ── Refresh Token ─────────────────────────────────────────────
export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;   // SHA-256 hash of the actual token
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  userAgent: String,
  ipAddress: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 8 }, // TTL: 8 days
});

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

// ── Invitation ────────────────────────────────────────────────
export interface IInvitation extends Document {
  tokenHash: string;    // SHA-256 hash of the actual JWT token
  userId: mongoose.Types.ObjectId;
  email: string;
  role: string;
  hospitalId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, lowercase: true },
  role: { type: String, required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 4 }, // TTL: 4 days
});

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);

// ── Password Reset Token ─────────────────────────────────────
export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 }, // TTL: 1 hour
});

export const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
