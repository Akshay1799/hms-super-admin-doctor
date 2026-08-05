import mongoose, { Document, Schema } from 'mongoose';

export interface IRoster extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // User (Doctor/Nurse)
  date: Date;
  shiftType: 'Day' | 'Night' | 'On-Call';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RosterSchema = new Schema<IRoster>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    shiftType: {
      type: String,
      enum: ['Day', 'Night', 'On-Call'],
      required: true
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Roster = mongoose.model<IRoster>('Roster', RosterSchema);
