import mongoose, { Document, Schema } from 'mongoose';

export interface IBedAllocation extends Document {
  admissionId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  status: 'Reserved' | 'Occupied' | 'Released';
  allocationTime?: Date;
  releaseTime?: Date;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BedAllocationSchema = new Schema<IBedAllocation>(
  {
    admissionId: { type: Schema.Types.ObjectId, ref: 'Admission', required: true },
    bedId: { type: Schema.Types.ObjectId, ref: 'Bed', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    status: {
      type: String,
      enum: ['Reserved', 'Occupied', 'Released'],
      default: 'Reserved'
    },
    allocationTime: { type: Date },
    releaseTime: { type: Date },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

BedAllocationSchema.index({ tenantId: 1, hospitalId: 1 });
BedAllocationSchema.index({ admissionId: 1 });
BedAllocationSchema.index({ bedId: 1, status: 1 }); // Useful to check active allocation for a bed

export const BedAllocation = mongoose.model<IBedAllocation>('BedAllocation', BedAllocationSchema);
