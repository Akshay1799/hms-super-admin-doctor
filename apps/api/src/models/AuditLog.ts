import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId?: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: string;
  module: string;          // e.g. "patients", "billing", "auth"
  action: string;          // e.g. "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"
  entityType?: string;     // e.g. "Patient", "Invoice"
  entityId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;  // extra context (before/after values, etc.)
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  userName: String,
  userRole: String,
  module: { type: String, required: true, index: true },
  action: { type: String, required: true },
  entityType: String,
  entityId: String,
  description: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
  },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Auto-expire audit logs after 1 year (optional, remove if you want permanent logs)
// AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
