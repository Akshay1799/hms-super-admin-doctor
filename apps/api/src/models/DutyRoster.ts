import mongoose, { Document, Schema } from 'mongoose';

export type DutyRosterStatus = 'Draft' | 'Pending Approval' | 'Published' | 'Archived';

export interface IDutyRoster extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  name: string; // e.g. "Cardiology Roster - Oct 2026"
  startDate: Date;
  endDate: Date;
  status: DutyRosterStatus;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DutyRosterSchema = new Schema<IDutyRoster>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Published', 'Archived'],
      default: 'Draft'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const DutyRoster = mongoose.model<IDutyRoster>('DutyRoster', DutyRosterSchema);
export default DutyRoster;
