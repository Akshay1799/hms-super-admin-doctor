import mongoose, { Schema, Document } from 'mongoose';

export interface ITPAClaim extends Document {
  tenantId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  tpaName: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PARTIAL_APPROVED';
  submissionDate: Date;
  resolutionDate?: Date;
  notes?: string;
}

const TPAClaimSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    tpaName: { type: String, required: true },
    policyNumber: { type: String, required: true },
    claimAmount: { type: Number, required: true, min: 0 },
    approvedAmount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PARTIAL_APPROVED'],
      default: 'PENDING'
    },
    submissionDate: { type: Date, default: Date.now },
    resolutionDate: { type: Date },
    notes: String
  },
  { timestamps: true }
);

export const TPAClaim = mongoose.models.TPAClaim || mongoose.model<ITPAClaim>('TPAClaim', TPAClaimSchema);
