import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryPackage extends Document {
  packageCode: string;
  packageName: string;
  description?: string;
  tests: mongoose.Types.ObjectId[];
  panels: mongoose.Types.ObjectId[];
  basePrice: number;
  billingCode?: string;
  isActive: boolean;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratoryPackageSchema: Schema = new Schema(
  {
    packageCode: { type: String, required: true, index: true },
    packageName: { type: String, required: true },
    description: { type: String },
    tests: [{ type: Schema.Types.ObjectId, ref: 'TestCatalog' }],
    panels: [{ type: Schema.Types.ObjectId, ref: 'LaboratoryPanel' }],
    basePrice: { type: Number, required: true, default: 0 },
    billingCode: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Ensure packageCode is unique per hospital
LaboratoryPackageSchema.index({ packageCode: 1, hospitalId: 1 }, { unique: true });

export const LaboratoryPackage = mongoose.model<ILaboratoryPackage>('LaboratoryPackage', LaboratoryPackageSchema);
