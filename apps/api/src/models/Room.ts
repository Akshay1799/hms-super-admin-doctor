import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  wardId: mongoose.Types.ObjectId;
  roomType: string; // e.g. Single, Twin Sharing, VIP
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Maintenance';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
    roomType: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active' },
  },
  { timestamps: true }
);

RoomSchema.index({ tenantId: 1, hospitalId: 1, roomNumber: 1 }, { unique: true });
RoomSchema.index({ wardId: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
