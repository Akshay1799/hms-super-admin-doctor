import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointmentHistory extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  action: 'Created' | 'Rescheduled' | 'Cancelled' | 'Updated' | 'Status Changed';
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  reason?: string;
  changedBy: mongoose.Types.ObjectId;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentHistorySchema = new Schema<IAppointmentHistory>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    action: {
      type: String,
      enum: ['Created', 'Rescheduled', 'Cancelled', 'Updated', 'Status Changed'],
      required: true
    },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    reason: { type: String },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    ipAddress: { type: String },
    device: { type: String }
  },
  { timestamps: true }
);

// Prevent edits to history records (Audit trail immutability)
AppointmentHistorySchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Audit records cannot be edited'));
});
AppointmentHistorySchema.pre('updateOne', function (next) {
  next(new Error('Audit records cannot be edited'));
});

export const AppointmentHistory = mongoose.model<IAppointmentHistory>('AppointmentHistory', AppointmentHistorySchema);
