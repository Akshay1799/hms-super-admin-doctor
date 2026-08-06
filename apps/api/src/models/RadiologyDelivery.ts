import mongoose, { Document, Schema } from 'mongoose';

export interface IAccessHistory {
  accessedBy: mongoose.Types.ObjectId;
  role: string;
  action: 'Viewed' | 'Downloaded';
  timestamp: Date;
  ipAddress?: string;
}

export interface IRadiologyDelivery extends Document {
  reportId: mongoose.Types.ObjectId;
  studyId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  channel: 'Email' | 'Patient Portal' | 'Doctor Portal';
  status: 'Pending' | 'Delivered' | 'Viewed' | 'Downloaded' | 'Failed';
  recipientEmail?: string;
  accessHistory: IAccessHistory[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AccessHistorySchema = new Schema<IAccessHistory>(
  {
    accessedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    action: { type: String, enum: ['Viewed', 'Downloaded'], required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String }
  },
  { _id: false }
);

const RadiologyDeliverySchema = new Schema<IRadiologyDelivery>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'RadiologyReport', required: true },
    studyId: { type: Schema.Types.ObjectId, ref: 'ImagingStudy', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    channel: {
      type: String,
      enum: ['Email', 'Patient Portal', 'Doctor Portal'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Delivered', 'Viewed', 'Downloaded', 'Failed'],
      default: 'Pending'
    },
    recipientEmail: { type: String },
    accessHistory: [AccessHistorySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RadiologyDeliverySchema.index({ tenantId: 1, hospitalId: 1, reportId: 1 });
RadiologyDeliverySchema.index({ patientId: 1 });
RadiologyDeliverySchema.index({ status: 1 });

export const RadiologyDelivery = mongoose.model<IRadiologyDelivery>('RadiologyDelivery', RadiologyDeliverySchema);
