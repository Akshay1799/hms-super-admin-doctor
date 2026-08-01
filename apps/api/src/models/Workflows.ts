import mongoose, { Schema, Document } from 'mongoose';

// ── Approval Matrix ─────────────────────────────────────────────
export interface IApprovalMatrix extends Document {
  tenantId: mongoose.Types.ObjectId;
  actionType: 'DISCOUNT' | 'WAIVER' | 'WRITE_OFF' | 'REFUND';
  role: string; // e.g., 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST'
  maxAmount: number; // Maximum amount they can auto-approve
}

const ApprovalMatrixSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    actionType: {
      type: String,
      enum: ['DISCOUNT', 'WAIVER', 'WRITE_OFF', 'REFUND'],
      required: true
    },
    role: { type: String, required: true },
    maxAmount: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

// ── Financial Request (Workflows) ──────────────────────────────
export interface IFinancialRequest extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  requestType: 'DISCOUNT' | 'WAIVER' | 'WRITE_OFF';
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const FinancialRequestSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    requestType: {
      type: String,
      enum: ['DISCOUNT', 'WAIVER', 'WRITE_OFF'],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const ApprovalMatrix = mongoose.models.ApprovalMatrix || mongoose.model<IApprovalMatrix>('ApprovalMatrix', ApprovalMatrixSchema);
export const FinancialRequest = mongoose.models.FinancialRequest || mongoose.model<IFinancialRequest>('FinancialRequest', FinancialRequestSchema);
