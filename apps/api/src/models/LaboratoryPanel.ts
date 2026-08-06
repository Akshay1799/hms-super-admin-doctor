import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryPanel extends Document {
  panelCode: string;
  panelName: string;
  category: string;
  tests: mongoose.Types.ObjectId[];
  billingCode?: string;
  isActive: boolean;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratoryPanelSchema: Schema = new Schema(
  {
    panelCode: { type: String, required: true, index: true },
    panelName: { type: String, required: true },
    category: { type: String, required: true },
    tests: [{ type: Schema.Types.ObjectId, ref: 'TestCatalog' }],
    billingCode: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Ensure panelCode is unique per hospital
LaboratoryPanelSchema.index({ panelCode: 1, hospitalId: 1 }, { unique: true });

export const LaboratoryPanel = mongoose.model<ILaboratoryPanel>('LaboratoryPanel', LaboratoryPanelSchema);
