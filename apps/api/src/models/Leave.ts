import mongoose, { Document, Schema } from 'mongoose';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface ILeave extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  startDate: Date;
  endDate: Date;
  leaveType: string;
  reason: string;
  status: LeaveStatus;
  
  approvedBy?: mongoose.Types.ObjectId;
  approvalNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leaveType: { type: String, required: true }, // e.g. "Sick Leave", "Annual Leave"
    reason: { type: String, required: true },
    
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending'
    },
    
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: { type: String }
  },
  { timestamps: true }
);

export const Leave = mongoose.model<ILeave>('Leave', LeaveSchema);
export default Leave;
