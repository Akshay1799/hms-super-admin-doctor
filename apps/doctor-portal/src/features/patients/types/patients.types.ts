export interface PatientVitals {
  timestamp: string;
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number; // °F
  weight: number; // kg
  spo2: number; // %
}

export interface PatientMedication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  timing: string;
  foodInstructions: string;
  status: "Active" | "Discontinued" | "Past";
  prescribedBy: string;
  administeredBy?: string;
  administeredDate?: string;
}

export interface PatientDiagnosis {
  id: string;
  code: string;
  description: string;
  date: string;
  status: "Active" | "Resolved";
}

export interface SoapNote {
  id: string;
  date: string;
  author: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface PatientTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "admission" | "diagnosis" | "prescription" | "vital" | "discharge";
}

export interface PatientBillingSummary {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Refunded";
  date: string;
}

export interface PatientAuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ipAddress: string;
}

export interface PatientScan {
  id: string;
  name: string;
  type: "X-Ray" | "CT" | "MRI" | "ECG" | "Ultrasound";
  date: string;
  url: string;
  report: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bedNumber: string;
  ward: string;
  status: "Active" | "Admitted" | "ICU" | "Follow-up Due";
  allergies: string[];
  medicalHistory: string[];
  assignedDoctorId: string;
  assignedNurse: string;
  assignedCompounder: string;
  shift: string;
  vitals: PatientVitals[];
  medications: PatientMedication[];
  diagnoses: PatientDiagnosis[];
  soapNotes: SoapNote[];
  timeline: PatientTimelineEvent[];
  billing: PatientBillingSummary[];
  audits: PatientAuditLog[];
  scans: PatientScan[];
}
