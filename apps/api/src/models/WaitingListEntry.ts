import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitingListEntry extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  preferredDoctorId?: mongoose.Types.ObjectId;
  preferredDepartmentId?: mongoose.Types.ObjectId;
  preferredDate?: Date;
  preferredTime?: string;
  priorityLevel: number; // lower number = higher priority
  status: 'Waiting' | 'Offer Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled' | 'Archived';
  offerDetails?: {
    offeredDoctorId: mongoose.Types.ObjectId;
    offeredDepartmentId: mongoose.Types.ObjectId;
    offeredDate: Date;
    offeredTime: string;
    offerExpiresAt: Date;
  };
  history: Array<{
    action: string;
    timestamp?: Date;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const WaitingListEntrySchema = new Schema<IWaitingListEntry>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    preferredDoctorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    preferredDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    preferredDate: { type: Date, index: true },
    preferredTime: { type: String },
    priorityLevel: { type: Number, default: 10, index: true },
    status: {
      type: String,
      enum: ['Waiting', 'Offer Sent', 'Accepted', 'Rejected', 'Expired', 'Cancelled', 'Archived'],
      default: 'Waiting',
      index: true
    },
    offerDetails: {
      offeredDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
      offeredDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
      offeredDate: { type: Date },
      offeredTime: { type: String },
      offerExpiresAt: { type: Date }
    },
    history: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export const WaitingListEntry = mongoose.model<IWaitingListEntry>('WaitingListEntry', WaitingListEntrySchema);
