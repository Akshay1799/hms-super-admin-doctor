import mongoose, { Document, Schema } from 'mongoose';

export interface IImagingStudy extends Document {
  studyUid: string;
  accessionNumber: string;
  patientId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId;
  machineId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  modality: string;
  studyDate: Date;
  status: 'Pending Upload' | 'Available' | 'Archived' | 'Failed';
  dicomMetadata?: {
    seriesCount?: number;
    instanceCount?: number;
    bodyPart?: string;
    protocolName?: string;
    contrastUsed?: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImagingStudySchema = new Schema<IImagingStudy>(
  {
    studyUid: { type: String, required: true, unique: true },
    accessionNumber: { type: String, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'RadiologyOrder', required: true },
    orderItemId: { type: Schema.Types.ObjectId, required: true },
    machineId: { type: Schema.Types.ObjectId, ref: 'Machine' },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    modality: { type: String, required: true },
    studyDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending Upload', 'Available', 'Archived', 'Failed'],
      default: 'Available'
    },
    dicomMetadata: {
      seriesCount: { type: Number },
      instanceCount: { type: Number },
      bodyPart: { type: String },
      protocolName: { type: String },
      contrastUsed: { type: Boolean }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ImagingStudySchema.index({ tenantId: 1, hospitalId: 1, accessionNumber: 1 });
ImagingStudySchema.index({ patientId: 1 });
ImagingStudySchema.index({ orderId: 1 });
ImagingStudySchema.index({ status: 1 });
ImagingStudySchema.index({ studyDate: 1 });

export const ImagingStudy = mongoose.model<IImagingStudy>('ImagingStudy', ImagingStudySchema);
