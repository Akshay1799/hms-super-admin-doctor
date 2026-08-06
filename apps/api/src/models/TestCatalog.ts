import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCatalog extends Document {
  testCode: string;
  testName: string;
  category: string;
  departmentId: mongoose.Types.ObjectId;
  sampleType: string;
  preparationInstructions?: string;
  fastingRequired: boolean;
  turnaroundTimeHours: number;
  billingCode?: string;
  reportTemplateId?: mongoose.Types.ObjectId;
  isActive: boolean;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestCatalogSchema: Schema = new Schema(
  {
    testCode: { type: String, required: true, index: true },
    testName: { type: String, required: true },
    category: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    sampleType: { type: String, required: true },
    preparationInstructions: { type: String },
    fastingRequired: { type: Boolean, default: false },
    turnaroundTimeHours: { type: Number, required: true, default: 24 },
    billingCode: { type: String },
    reportTemplateId: { type: Schema.Types.ObjectId, ref: 'ReportTemplate' },
    isActive: { type: Boolean, default: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Ensure testCode is unique per hospital
TestCatalogSchema.index({ testCode: 1, hospitalId: 1 }, { unique: true });

export const TestCatalog = mongoose.model<ITestCatalog>('TestCatalog', TestCatalogSchema);
