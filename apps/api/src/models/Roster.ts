import mongoose, { Document, Schema } from 'mongoose';

export interface IRoster extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  shiftType: 'Day' | 'Night' | 'On-Call';
  departmentId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RosterSchema = new Schema<IRoster>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    shiftType: {
      type: String,
      enum: ['Day', 'Night', 'On-Call'],
      required: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure unique constraint so a user cannot be scheduled on two shifts for the same date
RosterSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Roster = mongoose.model<IRoster>('Roster', RosterSchema);
