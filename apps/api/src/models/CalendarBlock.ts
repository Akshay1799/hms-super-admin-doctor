import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarBlock extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  
  startTime: Date;
  endTime: Date;
  reason: string; // e.g. "Meeting", "Emergency Duty", "Training"
  
  blockedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarBlockSchema = new Schema<ICalendarBlock>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reason: { type: String, required: true },
    
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Prevent overlapping blocks for the same doctor
CalendarBlockSchema.index({ doctorId: 1, startTime: 1, endTime: 1 });

export const CalendarBlock = mongoose.model<ICalendarBlock>('CalendarBlock', CalendarBlockSchema);
export default CalendarBlock;
