import mongoose, { Document, Schema } from 'mongoose';

export interface IReschedulePolicy extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId; // Optional: department-specific policies
  maxReschedules: number;
  minimumNoticePeriodHours: number;
  allowSameDayReschedule: boolean;
  requiresDoctorApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReschedulePolicySchema = new Schema<IReschedulePolicy>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    maxReschedules: { type: Number, default: 3 },
    minimumNoticePeriodHours: { type: Number, default: 24 },
    allowSameDayReschedule: { type: Boolean, default: false },
    requiresDoctorApproval: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ReschedulePolicy = mongoose.model<IReschedulePolicy>('ReschedulePolicy', ReschedulePolicySchema);
