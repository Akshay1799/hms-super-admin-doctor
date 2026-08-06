import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDelivery extends Document {
  reportId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  channel: 'Email' | 'Patient Portal' | 'SMS' | 'WhatsApp';
  status: 'Pending' | 'Queued' | 'Delivered' | 'Failed' | 'Viewed' | 'Downloaded';
  deliveredAt?: Date;
  accessedAt?: Date;
  accessedBy?: mongoose.Types.ObjectId;
  retryCount: number;
  recipientDetails?: string; // e.g. email address
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportDeliverySchema: Schema = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'LaboratoryReport', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    channel: {
      type: String,
      enum: ['Email', 'Patient Portal', 'SMS', 'WhatsApp'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Queued', 'Delivered', 'Failed', 'Viewed', 'Downloaded'],
      default: 'Pending',
      index: true
    },
    deliveredAt: { type: Date },
    accessedAt: { type: Date },
    accessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    retryCount: { type: Number, default: 0 },
    recipientDetails: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const ReportDelivery = mongoose.model<IReportDelivery>('ReportDelivery', ReportDeliverySchema);
