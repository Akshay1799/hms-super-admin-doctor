import mongoose, { Document, Schema } from 'mongoose';

export interface IMachine extends Document {
  machineName: string;
  modality: 'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET Scan' | 'SPECT' | 'Bone Density' | 'Fluoroscopy' | 'Interventional Radiology' | 'Nuclear Medicine';
  departmentId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  status: 'Active' | 'Maintenance' | 'Out of Service';
  workingHours: {
    start: string; // e.g. "08:00"
    end: string;   // e.g. "18:00"
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MachineSchema = new Schema<IMachine>(
  {
    machineName: { type: String, required: true },
    modality: { 
      type: String, 
      enum: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'PET Scan', 'SPECT', 'Bone Density', 'Fluoroscopy', 'Interventional Radiology', 'Nuclear Medicine'], 
      required: true 
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Out of Service'],
      default: 'Active'
    },
    workingHours: {
      start: { type: String, default: '00:00' },
      end: { type: String, default: '23:59' }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

MachineSchema.index({ tenantId: 1, hospitalId: 1, modality: 1 });
MachineSchema.index({ status: 1 });

export const Machine = mongoose.model<IMachine>('Machine', MachineSchema);
