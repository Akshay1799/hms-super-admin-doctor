import mongoose, { Document, Schema } from 'mongoose';

export interface IOperationTheatre extends Document {
  otNumber: string;
  name: string;
  category: string;
  floor: string;
  departmentId: mongoose.Types.ObjectId;
  capacity: number;
  status: 'Available' | 'Reserved' | 'In Surgery' | 'Cleaning' | 'Maintenance';
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OperationTheatreSchema = new Schema<IOperationTheatre>(
  {
    otNumber: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    floor: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    capacity: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'In Surgery', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate OT numbers per hospital
OperationTheatreSchema.index({ hospitalId: 1, otNumber: 1 }, { unique: true });

export const OperationTheatre = mongoose.model<IOperationTheatre>('OperationTheatre', OperationTheatreSchema);
