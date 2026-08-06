import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecimenHistory {
  status: string;
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  details?: string;
}

export interface ILaboratorySpecimen extends Document {
  barcode: string;
  laboratoryOrderId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  sampleType: string;
  containerType?: string;
  status: 'Collection Pending' | 'Collected' | 'Verified' | 'Received' | 'Accepted' | 'Processing' | 'Completed' | 'Stored' | 'Disposed' | 'Archived' | 'Rejected';
  collectorId?: mongoose.Types.ObjectId;
  collectionTime?: Date;
  receivedById?: mongoose.Types.ObjectId;
  receivedTime?: Date;
  rejectionReason?: string;
  recollectionRequested: boolean;
  history: ISpecimenHistory[];
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratorySpecimenSchema: Schema = new Schema(
  {
    barcode: { type: String, required: true, index: true },
    laboratoryOrderId: { type: Schema.Types.ObjectId, ref: 'LaboratoryOrder', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    sampleType: { type: String, required: true },
    containerType: { type: String },
    status: {
      type: String,
      enum: ['Collection Pending', 'Collected', 'Verified', 'Received', 'Accepted', 'Processing', 'Completed', 'Stored', 'Disposed', 'Archived', 'Rejected'],
      default: 'Collection Pending',
      index: true
    },
    collectorId: { type: Schema.Types.ObjectId, ref: 'User' },
    collectionTime: { type: Date },
    receivedById: { type: Schema.Types.ObjectId, ref: 'User' },
    receivedTime: { type: Date },
    rejectionReason: { type: String },
    recollectionRequested: { type: Boolean, default: false },
    history: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        details: String
      }
    ],
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Ensure barcode is unique per hospital
LaboratorySpecimenSchema.index({ barcode: 1, hospitalId: 1 }, { unique: true });

export const LaboratorySpecimen = mongoose.model<ILaboratorySpecimen>('LaboratorySpecimen', LaboratorySpecimenSchema);
