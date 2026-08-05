import mongoose, { Document, Schema } from 'mongoose';

export interface IConsultationNote extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  encounterId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  
  status: 'Draft' | 'Under Review' | 'Finalized' | 'Signed' | 'Archived';
  
  // Clinical Sections
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  surgicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string; // smoking, alcohol, occupation, lifestyle
  reviewOfSystems?: string;
  
  // Physical Examination
  physicalExamination?: {
    vitals?: {
      bpSystolic?: number;
      bpDiastolic?: number;
      pulse?: number;
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
      bmi?: number;
      painScore?: number;
      gcs?: number;
    };
    generalExamination?: string;
    systemicExamination?: string;
    clinicalFindings?: string;
  };
  
  // Assessment & Diagnosis
  assessment?: string;
  diagnoses: Array<{
    type: 'Primary' | 'Secondary' | 'Differential' | 'Provisional' | 'Final' | 'Working' | 'Chronic';
    description: string;
    code?: string;
    severity?: 'Mild' | 'Moderate' | 'Severe';
    status?: 'Active' | 'Resolved';
  }>;
  
  // Treatment Plan (BR-053: linked to the consultation that created them)
  treatmentPlan?: {
    medicationRecommendations?: string; // Text representation, distinct from formal Prescription
    laboratoryTests?: string;
    radiology?: string;
    procedures?: string;
    admissionRecommendation?: string;
    observation?: string;
    lifestyleModifications?: string;
    dietAdvice?: string;
    exerciseAdvice?: string;
    physiotherapy?: string;
    specialistReferral?: string;
    followUpDate?: Date;
    followUpReason?: string;
  };
  
  attachments: string[]; // URLs pointing to documents/images

  finalizedAt?: Date;
  signedAt?: Date;
  archivedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ConsultationNoteSchema = new Schema<IConsultationNote>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    status: {
      type: String,
      enum: ['Draft', 'Under Review', 'Finalized', 'Signed', 'Archived'],
      default: 'Draft',
    },

    chiefComplaint: { type: String, required: true },
    historyOfPresentIllness: String,
    pastMedicalHistory: String,
    surgicalHistory: String,
    familyHistory: String,
    socialHistory: String,
    reviewOfSystems: String,

    physicalExamination: {
      vitals: {
        bpSystolic: Number,
        bpDiastolic: Number,
        pulse: Number,
        temperature: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number,
        weight: Number,
        height: Number,
        bmi: Number,
        painScore: Number,
        gcs: Number,
      },
      generalExamination: String,
      systemicExamination: String,
      clinicalFindings: String,
    },

    assessment: String,
    
    diagnoses: [
      {
        type: { 
          type: String, 
          enum: ['Primary', 'Secondary', 'Differential', 'Provisional', 'Final', 'Working', 'Chronic'],
          required: true
        },
        description: { type: String, required: true },
        code: String,
        severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
        status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' }
      }
    ],

    treatmentPlan: {
      medicationRecommendations: String,
      laboratoryTests: String,
      radiology: String,
      procedures: String,
      admissionRecommendation: String,
      observation: String,
      lifestyleModifications: String,
      dietAdvice: String,
      exerciseAdvice: String,
      physiotherapy: String,
      specialistReferral: String,
      followUpDate: Date,
      followUpReason: String,
    },

    attachments: [{ type: String }],
    
    finalizedAt: Date,
    signedAt: Date,
    archivedAt: Date,
  },
  { timestamps: true }
);

// Indexes (as per PRD)
ConsultationNoteSchema.index({ encounterId: 1 });
ConsultationNoteSchema.index({ patientId: 1, date: -1 });
ConsultationNoteSchema.index({ doctorId: 1 });

export const ConsultationNote = mongoose.model<IConsultationNote>('ConsultationNote', ConsultationNoteSchema);
