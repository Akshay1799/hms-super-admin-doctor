import mongoose, { Schema, Document } from 'mongoose';

export interface IReferenceRange extends Document {
  testId: mongoose.Types.ObjectId;
  gender: 'Male' | 'Female' | 'All';
  minAgeDays: number;
  maxAgeDays: number;
  normalMinValue: number;
  normalMaxValue: number;
  criticalMinValue?: number;
  criticalMaxValue?: number;
  panicMinValue?: number;
  panicMaxValue?: number;
  unit?: string;
  isActive: boolean;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReferenceRangeSchema: Schema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'TestCatalog', required: true, index: true },
    gender: { type: String, enum: ['Male', 'Female', 'All'], default: 'All' },
    minAgeDays: { type: Number, required: true, default: 0 },
    maxAgeDays: { type: Number, required: true, default: 43800 }, // 120 years
    normalMinValue: { type: Number, required: true },
    normalMaxValue: { type: Number, required: true },
    criticalMinValue: { type: Number },
    criticalMaxValue: { type: Number },
    panicMinValue: { type: Number },
    panicMaxValue: { type: Number },
    unit: { type: String },
    isActive: { type: Boolean, default: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const ReferenceRange = mongoose.model<IReferenceRange>('ReferenceRange', ReferenceRangeSchema);
