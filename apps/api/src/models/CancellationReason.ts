import mongoose, { Document, Schema } from 'mongoose';

export interface ICancellationReason extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  code: string;
  description: string;
  category: 'Patient' | 'Doctor' | 'Hospital' | 'System';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CancellationReasonSchema = new Schema<ICancellationReason>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    code: { type: String, required: true }, // e.g., 'PATIENT_NO_SHOW', 'EMERGENCY'
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Patient', 'Doctor', 'Hospital', 'System'],
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const CancellationReason = mongoose.model<ICancellationReason>('CancellationReason', CancellationReasonSchema);
