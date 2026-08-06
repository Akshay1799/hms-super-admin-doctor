import mongoose, { Document, Schema } from 'mongoose';

export interface IWard extends Document {
  name: string;
  wardType: string; // e.g. ICU, General, Maternity
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const WardSchema = new Schema<IWard>(
  {
    name: { type: String, required: true },
    wardType: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

WardSchema.index({ tenantId: 1, hospitalId: 1 });

export const Ward = mongoose.model<IWard>('Ward', WardSchema);
