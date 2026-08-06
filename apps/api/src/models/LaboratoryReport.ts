import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryReport extends Document {
  reportNumber: string;
  laboratoryOrderId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  status: 'Draft' | 'Pending Review' | 'Under Review' | 'Correction Required' | 'Approved' | 'Published' | 'Amended';
  version: number;
  previousVersionId?: mongoose.Types.ObjectId;
  results: mongoose.Types.ObjectId[];
  pdfBase64?: string;
  generatedBy: mongoose.Types.ObjectId;
  generatedAt: Date;
  submittedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  approvalRemarks?: string;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratoryReportSchema: Schema = new Schema(
  {
    reportNumber: { type: String, required: true, index: true },
    laboratoryOrderId: { type: Schema.Types.ObjectId, ref: 'LaboratoryOrder', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Under Review', 'Correction Required', 'Approved', 'Published', 'Amended'],
      default: 'Draft',
      index: true
    },
    version: { type: Number, required: true, default: 1 },
    previousVersionId: { type: Schema.Types.ObjectId, ref: 'LaboratoryReport' },
    results: [{ type: Schema.Types.ObjectId, ref: 'LaboratoryResult' }],
    pdfBase64: { type: String }, // Can store the generated base64 PDF stream
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    approvalRemarks: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Ensure reportNumber is unique per hospital
LaboratoryReportSchema.index({ reportNumber: 1, hospitalId: 1 }, { unique: true });

export const LaboratoryReport = mongoose.model<ILaboratoryReport>('LaboratoryReport', LaboratoryReportSchema);
