import mongoose, { Document, Schema } from 'mongoose';

export interface IReportVersion extends Document {
  reportId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  versionNumber: number;
  clinicalIndication?: string;
  technique?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Published' | 'Amended';
  savedBy: mongoose.Types.ObjectId;
  savedAt: Date;
}

const ReportVersionSchema = new Schema<IReportVersion>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'RadiologyReport', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    versionNumber: { type: Number, required: true },
    clinicalIndication: { type: String },
    technique: { type: String },
    findings: { type: String, default: '' },
    impression: { type: String, default: '' },
    recommendations: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Published', 'Amended'],
      required: true
    },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false } // Only need savedAt for immutability
);

ReportVersionSchema.index({ reportId: 1, versionNumber: 1 }, { unique: true });

export const ReportVersion = mongoose.model<IReportVersion>('ReportVersion', ReportVersionSchema);
