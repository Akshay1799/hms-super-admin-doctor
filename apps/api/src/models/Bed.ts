import mongoose, { Document, Schema } from 'mongoose';

export interface IBed extends Document {
  bedNumber: string;
  roomId: mongoose.Types.ObjectId;
  wardId: mongoose.Types.ObjectId;
  bedCategory: string; // e.g. ICU Bed, General Bed
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance';
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema = new Schema<IBed>(
  {
    bedNumber: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
    bedCategory: { type: String, required: true },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available'
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  },
  { timestamps: true }
);

BedSchema.index({ tenantId: 1, hospitalId: 1, bedNumber: 1, roomId: 1 }, { unique: true });
BedSchema.index({ wardId: 1 });
BedSchema.index({ status: 1 });

export const Bed = mongoose.model<IBed>('Bed', BedSchema);
