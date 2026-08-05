import mongoose, { Document, Schema } from 'mongoose';

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'General' | 'Emergency' | 'ICU' | 'On-Call';

export interface IShiftTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  name: string; // e.g. "Morning OPD"
  shiftType: ShiftType;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "14:00"
  breakDurationMinutes: number;
  consultationDurationMinutes?: number;
  maxPatients?: number;
  consultationType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftTemplateSchema = new Schema<IShiftTemplate>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    name: { type: String, required: true },
    shiftType: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'General', 'Emergency', 'ICU', 'On-Call'],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    breakDurationMinutes: { type: Number, default: 0 },
    consultationDurationMinutes: { type: Number },
    maxPatients: { type: Number },
    consultationType: { type: String }
  },
  { timestamps: true }
);

export const ShiftTemplate = mongoose.model<IShiftTemplate>('ShiftTemplate', ShiftTemplateSchema);
export default ShiftTemplate;
