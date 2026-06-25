import { MOCK_PATIENTS } from "../mocks/patients.mock";
import { Patient, SoapNote, PatientDiagnosis, PatientMedication, PatientScan } from "../types/patients.types";

const STORAGE_KEY = "hms_patients_registry";

function readPatients(): Patient[] {
  if (typeof window === "undefined") return [...MOCK_PATIENTS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PATIENTS));
      return [...MOCK_PATIENTS];
    }
    return JSON.parse(raw);
  } catch {
    return [...MOCK_PATIENTS];
  }
}

function writePatients(patients: Patient[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch {}
}

export const patientsService = {
  async getPatients(doctorId?: string): Promise<Patient[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patients = readPatients();
    if (doctorId) {
      return patients.filter((p) => p.assignedDoctorId === doctorId);
    }
    return [...patients];
  },

  async getPatientById(id: string): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patients = readPatients();
    const patient = patients.find((p) => p.id === id);
    if (!patient) {
      throw new Error("Patient not found in the registry.");
    }
    return { ...patient };
  },

  async createPatient(patientData: Omit<Patient, "id" | "soapNotes" | "diagnoses" | "medications" | "scans" | "timeline" | "vitalTrends" | "vitals" | "billing" | "audits">): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const patients = readPatients();
    const newId = `pat-${Date.now()}`;
    
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      soapNotes: [],
      diagnoses: [],
      medications: [],
      scans: [],
      vitals: [
        {
          timestamp: "Just Now",
          bpSystolic: 120,
          bpDiastolic: 80,
          temperature: 98.6,
          weight: 70,
          spo2: 99
        }
      ],
      billing: [
        {
          id: `bill-${Date.now()}`,
          invoiceNumber: `INV-${Math.floor(Math.random() * 90000) + 10000}`,
          amount: 150.00,
          status: "Unpaid",
          date: new Date().toISOString().split("T")[0]
        }
      ],
      audits: [
        {
          id: `audit-${Date.now()}`,
          action: "Patient Registered",
          user: "Physician Creator",
          timestamp: new Date().toISOString(),
          ipAddress: "127.0.0.1"
        }
      ],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Intake Completed",
          description: "Patient registered and assigned to physician.",
          date: "Just now",
          type: "admission"
        }
      ]
    };

    patients.push(newPatient);
    writePatients(patients);
    return newPatient;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const patients = readPatients();
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Patient not found.");
    }

    const updatedPatient: Patient = {
      ...patients[index],
      ...updates,
      audits: [
        {
          id: `audit-${Date.now()}`,
          action: "Patient Details Updated",
          user: "Physician Creator",
          timestamp: new Date().toISOString(),
          ipAddress: "127.0.0.1"
        },
        ...patients[index].audits
      ]
    };

    patients[index] = updatedPatient;
    writePatients(patients);
    return updatedPatient;
  },

  async deletePatient(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const patients = readPatients();
    const filtered = patients.filter((p) => p.id !== id);
    writePatients(filtered);
  },

  async addSoapNote(
    patientId: string,
    subjective: string,
    objective: string,
    assessment: string,
    plan: string,
    author: string
  ): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patients = readPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found.");

    const newNote: SoapNote = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      author,
      subjective,
      objective,
      assessment,
      plan,
    };

    const updatedPatient = {
      ...patients[patientIndex],
      soapNotes: [newNote, ...patients[patientIndex].soapNotes],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "SOAP Note Added",
          description: `SOAP note recorded by ${author}.`,
          date: "Just now",
          type: "vital" as const,
        },
        ...patients[patientIndex].timeline,
      ],
    };

    patients[patientIndex] = updatedPatient;
    writePatients(patients);
    return updatedPatient;
  },

  async addDiagnosis(patientId: string, code: string, description: string): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patients = readPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found.");

    const newDiagnosis: PatientDiagnosis = {
      id: `d-${Date.now()}`,
      code,
      description,
      date: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    const updatedPatient = {
      ...patients[patientIndex],
      diagnoses: [...patients[patientIndex].diagnoses, newDiagnosis],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Diagnosis Added",
          description: `${code} - ${description} diagnosed.`,
          date: "Just now",
          type: "diagnosis" as const,
        },
        ...patients[patientIndex].timeline,
      ],
    };

    patients[patientIndex] = updatedPatient;
    writePatients(patients);
    return updatedPatient;
  },

  async addPrescription(
    patientId: string,
    medication: string,
    dosage: string,
    frequency: string,
    duration: string,
    timing: string,
    foodInstructions: string,
    prescribedBy: string
  ): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patients = readPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found.");

    const newMed: PatientMedication = {
      id: `m-${Date.now()}`,
      name: medication,
      dose: dosage,
      frequency,
      duration,
      timing,
      foodInstructions,
      status: "Active",
      prescribedBy,
      administeredBy: "Assigned Nurse",
      administeredDate: "Pending Administration",
    };

    const updatedPatient = {
      ...patients[patientIndex],
      medications: [newMed, ...patients[patientIndex].medications],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Prescription Written",
          description: `Prescribed ${medication} (${dosage}).`,
          date: "Just now",
          type: "prescription" as const,
        },
        ...patients[patientIndex].timeline,
      ],
    };

    patients[patientIndex] = updatedPatient;
    writePatients(patients);
    return updatedPatient;
  },

  async addLabOrder(
    patientId: string,
    name: string,
    type: "X-Ray" | "CT" | "MRI" | "ECG" | "Ultrasound",
    prescribedBy: string
  ): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patients = readPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found.");

    const newScan: PatientScan = {
      id: `sc-${Date.now()}`,
      name,
      type,
      date: new Date().toISOString().split("T")[0],
      url: "", // Not uploaded yet
      report: "Order submitted. Awaiting lab processing.",
    };

    const updatedPatient = {
      ...patients[patientIndex],
      scans: [newScan, ...patients[patientIndex].scans],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Lab Order Submitted",
          description: `Ordered ${type}: ${name}.`,
          date: "Just now",
          type: "vital" as const,
        },
        ...patients[patientIndex].timeline,
      ],
    };

    patients[patientIndex] = updatedPatient;
    writePatients(patients);
    return updatedPatient;
  },
};
