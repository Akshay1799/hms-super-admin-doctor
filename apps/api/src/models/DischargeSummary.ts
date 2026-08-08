import mongoose, { Document, Schema } from 'mongoose';

export interface IDischargeSummary extends Document {
  patientId: mongoose.Types.ObjectId;
  admissionId: mongoose.Types.ObjectId;
  treatingDoctorId: mongoose.Types.ObjectId;
  
  status: 'Draft' | 'Clinical Review' | 'Billing Pending' | 'Billing Cleared' | 'Approved' | 'Published';
  
  clinicalDetails: {
    chiefComplaints?: string;
    finalDiagnosis?: string;
    secondaryDiagnosis?: string;
    significantFindings?: string;
    proceduresPerformed?: string;
    hospitalCourse?: string;
  };

  medicationDetails: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];

  followUpPlan: {
    followUpDate?: Date;
    department?: string;
    lifestyleAdvice?: string;
    warningSigns?: string;
    emergencyInstructions?: string;
  };

  billingClearance: {
    isCleared: boolean;
    clearedAt?: Date;
    clearedBy?: mongoose.Types.ObjectId;
    notes?: string;
  };

  publishedAt?: Date;

  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DischargeSummarySchema = new Schema<IDischargeSummary>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    admissionId: { type: Schema.Types.ObjectId, ref: 'IPD', required: true },
    treatingDoctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    status: {
      type: String,
      enum: ['Draft', 'Clinical Review', 'Billing Pending', 'Billing Cleared', 'Approved', 'Published'],
      default: 'Draft'
    },

    clinicalDetails: {
      chiefComplaints: { type: String },
      finalDiagnosis: { type: String },
      secondaryDiagnosis: { type: String },
      significantFindings: { type: String },
      proceduresPerformed: { type: String },
      hospitalCourse: { type: String },
    },

    medicationDetails: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String },
      }
    ],

    followUpPlan: {
      followUpDate: { type: Date },
      department: { type: String },
      lifestyleAdvice: { type: String },
      warningSigns: { type: String },
      emergencyInstructions: { type: String },
    },

    billingClearance: {
      isCleared: { type: Boolean, default: false },
      clearedAt: { type: Date },
      clearedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String },
    },

    publishedAt: { type: Date },

    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  },
  { timestamps: true }
);

export const DischargeSummary = mongoose.model<IDischargeSummary>('DischargeSummary', DischargeSummarySchema);
