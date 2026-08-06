import mongoose, { Document, Schema } from 'mongoose';

export interface IRadiologyReport extends Document {
  reportNumber: string;
  studyId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  radiologistId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  clinicalIndication?: string;
  technique?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Published' | 'Amended';
  version: number;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyReportSchema = new Schema<IRadiologyReport>(
  {
    reportNumber: { type: String, required: true, unique: true },
    studyId: { type: Schema.Types.ObjectId, ref: 'ImagingStudy', required: true, unique: true }, // 1:1 mapping
    orderId: { type: Schema.Types.ObjectId, ref: 'RadiologyOrder', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    radiologistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    clinicalIndication: { type: String },
    technique: { type: String },
    findings: { type: String, default: '' },
    impression: { type: String, default: '' },
    recommendations: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Published', 'Amended'],
      default: 'Draft'
    },
    version: { type: Number, default: 1 },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RadiologyReportSchema.index({ tenantId: 1, hospitalId: 1, reportNumber: 1 });
RadiologyReportSchema.index({ patientId: 1 });
RadiologyReportSchema.index({ radiologistId: 1 });
RadiologyReportSchema.index({ status: 1 });

export const RadiologyReport = mongoose.model<IRadiologyReport>('RadiologyReport', RadiologyReportSchema);
