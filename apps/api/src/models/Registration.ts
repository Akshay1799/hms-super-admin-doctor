import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  
  registrationType: 'OPD' | 'IPD' | 'Emergency' | 'Day Care' | 'Teleconsultation';
  visitType: 'New' | 'Follow-up';
  
  doctorId?: mongoose.Types.ObjectId;
  referralSource?: string;
  referralDoctor?: string;
  notes?: string;

  status: 'Draft' | 'Pending Verification' | 'Registered' | 'Verified' | 'Merged' | 'Archived';
  
  registeredBy?: mongoose.Types.ObjectId; // User who did the registration

  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    
    registrationType: { 
      type: String, 
      enum: ['OPD', 'IPD', 'Emergency', 'Day Care', 'Teleconsultation'],
      required: true 
    },
    visitType: { 
      type: String, 
      enum: ['New', 'Follow-up'],
      default: 'New'
    },
    
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    referralSource: String,
    referralDoctor: String,
    notes: String,

    status: {
      type: String,
      enum: ['Draft', 'Pending Verification', 'Registered', 'Verified', 'Merged', 'Archived'],
      default: 'Registered'
    },
    
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
