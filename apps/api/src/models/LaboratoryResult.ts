import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryResult extends Document {
  laboratoryOrderId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  specimenId?: mongoose.Types.ObjectId;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  isCritical: boolean;
  isPanic: boolean;
  deltaWarning: boolean;
  classification: 'Normal' | 'Low' | 'High' | 'Critical Low' | 'Critical High' | 'Panic Low' | 'Panic High' | 'Invalid';
  enteredBy: mongoose.Types.ObjectId;
  enteredAt: Date;
  status: 'Pending' | 'Entered' | 'Validated';
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratoryResultSchema: Schema = new Schema(
  {
    laboratoryOrderId: { type: Schema.Types.ObjectId, ref: 'LaboratoryOrder', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    testId: { type: Schema.Types.ObjectId, ref: 'TestCatalog', required: true },
    specimenId: { type: Schema.Types.ObjectId, ref: 'LaboratorySpecimen' },
    value: { type: Schema.Types.Mixed, required: true },
    unit: { type: String },
    referenceRange: { type: String },
    isAbnormal: { type: Boolean, default: false },
    isCritical: { type: Boolean, default: false },
    isPanic: { type: Boolean, default: false },
    deltaWarning: { type: Boolean, default: false },
    classification: {
      type: String,
      enum: ['Normal', 'Low', 'High', 'Critical Low', 'Critical High', 'Panic Low', 'Panic High', 'Invalid'],
      default: 'Normal'
    },
    enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    enteredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Entered', 'Validated'],
      default: 'Entered'
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const LaboratoryResult = mongoose.model<ILaboratoryResult>('LaboratoryResult', LaboratoryResultSchema);
