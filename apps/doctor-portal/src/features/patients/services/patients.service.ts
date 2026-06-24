import { MOCK_PATIENTS } from "../mocks/patients.mock";
import { Patient, SoapNote, PatientDiagnosis, PatientMedication, PatientScan } from "../types/patients.types";

let localPatients = [...MOCK_PATIENTS];

export const patientsService = {
  async getPatients(doctorId?: string): Promise<Patient[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Filter patients assigned to the specific doctor, but fall back to all if doctorId is not supplied
    if (doctorId) {
      return localPatients.filter((p) => p.assignedDoctorId === doctorId);
    }
    return [...localPatients];
  },

  async getPatientById(id: string): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patient = localPatients.find((p) => p.id === id);
    if (!patient) {
      throw new Error("Patient not found in the registry.");
    }
    return { ...patient };
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
    const patientIndex = localPatients.findIndex((p) => p.id === patientId);
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
      ...localPatients[patientIndex],
      soapNotes: [newNote, ...localPatients[patientIndex].soapNotes],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "SOAP Note Added",
          description: `SOAP note recorded by ${author}.`,
          date: "Just now",
          type: "vital" as const,
        },
        ...localPatients[patientIndex].timeline,
      ],
    };

    localPatients[patientIndex] = updatedPatient;
    return updatedPatient;
  },

  async addDiagnosis(patientId: string, code: string, description: string): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patientIndex = localPatients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found.");

    const newDiagnosis: PatientDiagnosis = {
      id: `d-${Date.now()}`,
      code,
      description,
      date: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    const updatedPatient = {
      ...localPatients[patientIndex],
      diagnoses: [...localPatients[patientIndex].diagnoses, newDiagnosis],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Diagnosis Added",
          description: `${code} - ${description} diagnosed.`,
          date: "Just now",
          type: "diagnosis" as const,
        },
        ...localPatients[patientIndex].timeline,
      ],
    };

    localPatients[patientIndex] = updatedPatient;
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
    const patientIndex = localPatients.findIndex((p) => p.id === patientId);
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
      ...localPatients[patientIndex],
      medications: [newMed, ...localPatients[patientIndex].medications],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Prescription Written",
          description: `Prescribed ${medication} (${dosage}).`,
          date: "Just now",
          type: "prescription" as const,
        },
        ...localPatients[patientIndex].timeline,
      ],
    };

    localPatients[patientIndex] = updatedPatient;
    return updatedPatient;
  },

  async addLabOrder(
    patientId: string,
    name: string,
    type: "X-Ray" | "CT" | "MRI" | "ECG" | "Ultrasound",
    prescribedBy: string
  ): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const patientIndex = localPatients.findIndex((p) => p.id === patientId);
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
      ...localPatients[patientIndex],
      scans: [newScan, ...localPatients[patientIndex].scans],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: "Lab Order Submitted",
          description: `Ordered ${type}: ${name}.`,
          date: "Just now",
          type: "vital" as const,
        },
        ...localPatients[patientIndex].timeline,
      ],
    };

    localPatients[patientIndex] = updatedPatient;
    return updatedPatient;
  },
};
