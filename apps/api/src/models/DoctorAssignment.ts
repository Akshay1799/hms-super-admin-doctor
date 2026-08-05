import mongoose, { Document, Schema } from 'mongoose';

export type AssignmentRole = 'Primary' | 'Secondary' | 'Resident' | 'Duty Doctor' | 'Consulting';
export type AssignmentStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Transferred' | 'Closed';

export interface IDoctorAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  encounterId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  
  role: AssignmentRole;
  status: AssignmentStatus;
  
  assignedBy: mongoose.Types.ObjectId;
  transferNotes?: string;
  transferredTo?: mongoose.Types.ObjectId; // References the new DoctorAssignment if transferred
  
  createdAt: Date;
  updatedAt: Date;
}

const DoctorAssignmentSchema = new Schema<IDoctorAssignment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    
    role: {
      type: String,
      enum: ['Primary', 'Secondary', 'Resident', 'Duty Doctor', 'Consulting'],
      required: true,
      default: 'Primary'
    },
    
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Transferred', 'Closed'],
      default: 'Pending'
    },
    
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transferNotes: { type: String },
    transferredTo: { type: Schema.Types.ObjectId, ref: 'DoctorAssignment' }
  },
  { timestamps: true }
);

export const DoctorAssignment = mongoose.model<IDoctorAssignment>('DoctorAssignment', DoctorAssignmentSchema);
export default DoctorAssignment;
