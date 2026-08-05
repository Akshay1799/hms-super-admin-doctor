import mongoose, { Document, Schema } from 'mongoose';

export type ShiftAssignmentStatus = 'Scheduled' | 'Completed' | 'Missed' | 'Leave' | 'Swap_Requested' | 'Swap_Doctor_Approved' | 'Cancelled';

export interface IShiftAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  dutyRosterId: mongoose.Types.ObjectId;
  shiftTemplateId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId; // References DoctorProfile or User
  
  date: Date;
  status: ShiftAssignmentStatus;
  
  assignedBy: mongoose.Types.ObjectId;
  
  // Swap Workflow
  swapRequestedWith?: mongoose.Types.ObjectId; // ID of doctor being requested to swap
  swapRequestedBy?: mongoose.Types.ObjectId; // ID of doctor requesting swap
  swapAdminApprovedBy?: mongoose.Types.ObjectId;
  swapNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const ShiftAssignmentSchema = new Schema<IShiftAssignment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    dutyRosterId: { type: Schema.Types.ObjectId, ref: 'DutyRoster', required: true, index: true },
    shiftTemplateId: { type: Schema.Types.ObjectId, ref: 'ShiftTemplate', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Missed', 'Leave', 'Swap_Requested', 'Swap_Doctor_Approved', 'Cancelled'],
      default: 'Scheduled'
    },
    
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    swapRequestedWith: { type: Schema.Types.ObjectId, ref: 'User' },
    swapRequestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    swapAdminApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    swapNotes: { type: String }
  },
  { timestamps: true }
);

// Prevent overlapping assignments: one doctor cannot be assigned to the exact same shift template on the exact same date
ShiftAssignmentSchema.index({ doctorId: 1, date: 1, shiftTemplateId: 1 }, { unique: true });

export const ShiftAssignment = mongoose.model<IShiftAssignment>('ShiftAssignment', ShiftAssignmentSchema);
export default ShiftAssignment;
