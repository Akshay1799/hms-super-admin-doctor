import mongoose, { Document, Schema } from 'mongoose';

export interface ISurgeryRequest extends Document {
  patientId: mongoose.Types.ObjectId;
  admissionId: mongoose.Types.ObjectId; // The IPD Admission ID
  primarySurgeonId: mongoose.Types.ObjectId;
  otId?: mongoose.Types.ObjectId; // Populated when scheduled
  
  surgeryName: string;
  category: string;
  priority: 'Elective' | 'Urgent' | 'Emergency' | 'STAT';
  
  status: 'Requested' | 'Scheduled' | 'Patient Ready' | 'Shifted to OT' | 'Pre-Operative Check Completed' | 'In Progress' | 'Completed';
  
  scheduledTime?: Date;
  estimatedDurationMins?: number; // Minutes
  
  notes?: string;

  surgicalTeam: {
    assistantSurgeonId?: mongoose.Types.ObjectId;
    anesthesiologistId?: mongoose.Types.ObjectId;
    scrubNurseId?: mongoose.Types.ObjectId;
    circulatingNurseId?: mongoose.Types.ObjectId;
  };

  preOpChecklist: {
    patientIdentityConfirmed: boolean;
    consentAvailable: boolean;
    surgicalSiteMarked: boolean;
    allergyReview: boolean;
    fastingConfirmed: boolean;
    bloodAvailabilityConfirmed: boolean;
  };

  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SurgeryRequestSchema = new Schema<ISurgeryRequest>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    admissionId: { type: Schema.Types.ObjectId, ref: 'IPD', required: true },
    primarySurgeonId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otId: { type: Schema.Types.ObjectId, ref: 'OperationTheatre' },
    
    surgeryName: { type: String, required: true },
    category: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['Elective', 'Urgent', 'Emergency', 'STAT'],
      default: 'Elective'
    },
    
    status: {
      type: String,
      enum: ['Requested', 'Scheduled', 'Patient Ready', 'Shifted to OT', 'Pre-Operative Check Completed', 'In Progress', 'Completed'],
      default: 'Requested'
    },

    scheduledTime: { type: Date },
    estimatedDurationMins: { type: Number },
    notes: { type: String },

    surgicalTeam: {
      assistantSurgeonId: { type: Schema.Types.ObjectId, ref: 'User' },
      anesthesiologistId: { type: Schema.Types.ObjectId, ref: 'User' },
      scrubNurseId: { type: Schema.Types.ObjectId, ref: 'User' },
      circulatingNurseId: { type: Schema.Types.ObjectId, ref: 'User' },
    },

    preOpChecklist: {
      patientIdentityConfirmed: { type: Boolean, default: false },
      consentAvailable: { type: Boolean, default: false },
      surgicalSiteMarked: { type: Boolean, default: false },
      allergyReview: { type: Boolean, default: false },
      fastingConfirmed: { type: Boolean, default: false },
      bloodAvailabilityConfirmed: { type: Boolean, default: false },
    },

    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  },
  { timestamps: true }
);

export const SurgeryRequest = mongoose.model<ISurgeryRequest>('SurgeryRequest', SurgeryRequestSchema);
