import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  // Demographics
  name: string;
  age: number;
  dateOfBirth?: Date;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  // Emergency contact
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  // Clinical status
  status: 'Active' | 'Admitted' | 'ICU' | 'Follow-up Due' | 'Discharged' | 'Deceased';
  bedNumber?: string;
  ward?: string;
  // Assignments
  assignedDoctorId?: mongoose.Types.ObjectId;
  assignedNurse?: string;
  assignedCompounder?: string;
  shift?: string;
  // Medical
  allergies: string[];
  medicalHistory: string[];
  // EMR sub-documents (stored inline for quick access)
  vitals: Array<{
    timestamp: Date;
    bpSystolic?: number;
    bpDiastolic?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    spo2?: number;
    pulse?: number;
    respiratoryRate?: number;
    recordedBy?: string;
  }>;
  medications: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    timing?: string;
    foodInstructions?: string;
    status: 'Active' | 'Completed' | 'Discontinued';
    prescribedBy: string;
    startDate: Date;
    endDate?: Date;
  }>;
  diagnoses: Array<{
    code?: string;   // ICD-10 code
    description: string;
    date: Date;
    status: 'Active' | 'Resolved' | 'Chronic';
    diagnosedBy: string;
  }>;
  soapNotes: Array<{
    date: Date;
    author: string;
    authorId?: mongoose.Types.ObjectId;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  }>;
  timeline: Array<{
    title: string;
    description?: string;
    date: Date;
    type: 'admission' | 'diagnosis' | 'prescription' | 'vital' | 'discharge' | 'lab' | 'procedure' | 'note';
    createdBy?: string;
  }>;
  scans: Array<{
    name: string;
    type: 'X-Ray' | 'CT' | 'MRI' | 'ECG' | 'Ultrasound' | 'Other';
    date: Date;
    url?: string;
    report?: string;
    orderedBy?: string;
  }>;
  // Admission info
  admissionDate?: Date;
  dischargeDate?: Date;
  dischargeNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: String,
    phone: String,
    email: String,
    address: String,
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Admitted', 'ICU', 'Follow-up Due', 'Discharged', 'Deceased'],
      default: 'Active',
    },
    bedNumber: String,
    ward: String,
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedNurse: String,
    assignedCompounder: String,
    shift: String,
    allergies: [{ type: String }],
    medicalHistory: [{ type: String }],
    vitals: [
      {
        timestamp: { type: Date, default: Date.now },
        bpSystolic: Number,
        bpDiastolic: Number,
        temperature: Number,
        weight: Number,
        height: Number,
        spo2: Number,
        pulse: Number,
        respiratoryRate: Number,
        recordedBy: String,
      },
    ],
    medications: [
      {
        name: { type: String, required: true },
        dose: String,
        frequency: String,
        duration: String,
        timing: String,
        foodInstructions: String,
        status: { type: String, enum: ['Active', 'Completed', 'Discontinued'], default: 'Active' },
        prescribedBy: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    diagnoses: [
      {
        code: String,
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['Active', 'Resolved', 'Chronic'], default: 'Active' },
        diagnosedBy: String,
      },
    ],
    soapNotes: [
      {
        date: { type: Date, default: Date.now },
        author: String,
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        subjective: String,
        objective: String,
        assessment: String,
        plan: String,
      },
    ],
    timeline: [
      {
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ['admission', 'diagnosis', 'prescription', 'vital', 'discharge', 'lab', 'procedure', 'note'],
        },
        createdBy: String,
      },
    ],
    scans: [
      {
        name: String,
        type: { type: String, enum: ['X-Ray', 'CT', 'MRI', 'ECG', 'Ultrasound', 'Other'] },
        date: { type: Date, default: Date.now },
        url: String,
        report: String,
        orderedBy: String,
      },
    ],
    admissionDate: Date,
    dischargeDate: Date,
    dischargeNotes: String,
  },
  { timestamps: true }
);

PatientSchema.index({ tenantId: 1, hospitalId: 1 });
PatientSchema.index({ assignedDoctorId: 1 });
PatientSchema.index({ name: 'text' }); // text search

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
