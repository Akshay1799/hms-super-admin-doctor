import { apiClient } from "@/lib/api-client";
import { Patient } from "../types/patients.types";

function normalizePatient(p: any): Patient {
  let docId = "";
  if (p.assignedDoctorId) {
    if (typeof p.assignedDoctorId === "object") {
      docId = p.assignedDoctorId._id || p.assignedDoctorId.id || "";
    } else {
      docId = p.assignedDoctorId;
    }
  }
  return {
    ...p,
    id: p._id || p.id,
    assignedDoctorId: docId,
    soapNotes: (p.soapNotes || []).map((sn: any) => ({ ...sn, id: sn._id || sn.id })),
    diagnoses: (p.diagnoses || []).map((d: any) => ({ ...d, id: d._id || d.id })),
    medications: (p.medications || []).map((m: any) => ({ ...m, id: m._id || m.id })),
    scans: (p.scans || []).map((s: any) => ({ ...s, id: s._id || s.id })),
    timeline: (p.timeline || []).map((t: any) => ({ ...t, id: t._id || t.id })),
    billing: p.billing || [],
    audits: p.audits || [],
  };
}

export const patientsService = {
  async getPatients(doctorId?: string): Promise<Patient[]> {
    const res = await apiClient.get('/patients');
    const rawData = res.data?.data;
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return list.map(normalizePatient);
  },

  async getPatientById(id: string): Promise<Patient> {
    const res = await apiClient.get(`/patients/${id}`);
    return normalizePatient(res.data.data);
  },

  async createPatient(patientData: Omit<Patient, "id" | "soapNotes" | "diagnoses" | "medications" | "scans" | "timeline" | "vitalTrends" | "vitals" | "billing" | "audits">): Promise<Patient> {
    const res = await apiClient.post('/patients', patientData);
    return normalizePatient(res.data.data);
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const res = await apiClient.patch(`/patients/${id}`, updates);
    return normalizePatient(res.data.data);
  },

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },

  async addSoapNote(
    patientId: string,
    subjective: string,
    objective: string,
    assessment: string,
    plan: string,
    author: string
  ): Promise<Patient> {
    await apiClient.post(`/patients/${patientId}/soap-notes`, {
      subjective,
      objective,
      assessment,
      plan,
      author
    });
    return this.getPatientById(patientId);
  },

  async addDiagnosis(patientId: string, code: string, description: string): Promise<Patient> {
    await apiClient.post(`/patients/${patientId}/diagnoses`, {
      code,
      description
    });
    return this.getPatientById(patientId);
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
    await apiClient.post(`/patients/${patientId}/medications`, {
      name: medication,
      dose: dosage,
      frequency,
      duration,
      timing,
      foodInstructions,
      prescribedBy
    });
    return this.getPatientById(patientId);
  },

  async addLabOrder(
    patientId: string,
    name: string,
    type: "X-Ray" | "CT" | "MRI" | "ECG" | "Ultrasound",
    prescribedBy: string
  ): Promise<Patient> {
    await apiClient.post(`/patients/${patientId}/scans`, {
      name,
      type,
      orderedBy: prescribedBy
    });
    return this.getPatientById(patientId);
  },
};
