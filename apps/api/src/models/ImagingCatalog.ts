import mongoose, { Document, Schema } from 'mongoose';

export interface IImagingCatalog extends Document {
  examinationCode: string;
  examinationName: string;
  modality: 'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET Scan' | 'SPECT' | 'Bone Density' | 'Fluoroscopy' | 'Interventional Radiology' | 'Nuclear Medicine';
  category: string;
  bodyPart: string;
  departmentId: mongoose.Types.ObjectId;
  contrastRequired: boolean;
  preparationInstructions: string[];
  estimatedDurationMinutes: number;
  billingCode: string;
  activeStatus: boolean;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImagingCatalogSchema = new Schema<IImagingCatalog>(
  {
    examinationCode: { type: String, required: true },
    examinationName: { type: String, required: true },
    modality: { 
      type: String, 
      enum: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'PET Scan', 'SPECT', 'Bone Density', 'Fluoroscopy', 'Interventional Radiology', 'Nuclear Medicine'], 
      required: true 
    },
    category: { type: String, required: true },
    bodyPart: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    contrastRequired: { type: Boolean, default: false },
    preparationInstructions: [{ type: String }],
    estimatedDurationMinutes: { type: Number, required: true },
    billingCode: { type: String, required: true },
    activeStatus: { type: Boolean, default: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ImagingCatalogSchema.index({ tenantId: 1, hospitalId: 1, examinationCode: 1 }, { unique: true });
ImagingCatalogSchema.index({ modality: 1 });
ImagingCatalogSchema.index({ category: 1 });

export const ImagingCatalog = mongoose.model<IImagingCatalog>('ImagingCatalog', ImagingCatalogSchema);
