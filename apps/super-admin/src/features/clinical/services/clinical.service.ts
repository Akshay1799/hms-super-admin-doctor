import { Doctor, Patient, Appointment, Nurse, Staff, Admission, BedOccupancy } from "../types/clinical.types";
import { DoctorInput, PatientInput } from "../schemas/clinical.schema";
import {
  MOCK_DOCTORS,
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_NURSES,
  MOCK_STAFF,
  MOCK_ADMISSIONS,
  MOCK_BED_OCCUPANCY,
  MOCK_CLINICAL_ANALYTICS,
} from "../mocks/clinical.mocks";

let doctorsData = [...MOCK_DOCTORS];
let patientsData = [...MOCK_PATIENTS];
let appointmentsData = [...MOCK_APPOINTMENTS];
let nursesData = [...MOCK_NURSES];
let staffData = [...MOCK_STAFF];
let admissionsData = [...MOCK_ADMISSIONS];

export interface DoctorDetails {
  doctor: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  auditLogs: { id: string; action: string; timestamp: string; description: string }[];
}

export interface PatientDetails {
  patient: Patient;
  appointments: Appointment[];
  admissions: Admission[];
  doctors: Doctor[];
  timeline: { id: string; title: string; date: string; description: string }[];
}

export const clinicalService = {
  async getDoctors(filters?: {
    search?: string;
    hospitalId?: string;
    specialization?: string;
    status?: string;
  }): Promise<Doctor[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let result = [...doctorsData];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q)
      );
    }

    if (filters?.hospitalId && filters.hospitalId !== "All") {
      result = result.filter((d) => d.hospitalId === filters.hospitalId);
    }

    if (filters?.specialization && filters.specialization !== "All") {
      result = result.filter((d) => d.specialization === filters.specialization);
    }

    if (filters?.status && filters.status !== "All") {
      result = result.filter((d) => d.status === filters.status);
    }

    return result;
  },

  async getDoctor(id: string): Promise<DoctorDetails> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const doctor = doctorsData.find((d) => d.id === id);
    if (!doctor) throw new Error("Doctor not found");

    return {
      doctor,
      appointments: appointmentsData.filter((a) => a.doctorId === id),
      patients: patientsData.filter((p) => p.doctorId === id),
      auditLogs: [
        { id: "aud-1", action: "Practitioner Credentials Verified", timestamp: "2026-01-15 09:00", description: "State medical practitioner license validated." },
      ],
    };
  },

  async createDoctor(input: DoctorInput): Promise<Doctor> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newId = `doc-${Date.now()}`;
    const newDoc: Doctor = {
      id: newId,
      name: input.name,
      specialization: input.specialization,
      hospitalId: input.hospitalId,
      branchId: input.branchId,
      departmentId: input.departmentId,
      experience: input.experience,
      rating: input.rating,
      status: input.status as any,
      patientsCount: 0,
      consultationTime: 15,
      successRate: 100,
    };
    doctorsData.push(newDoc);
    return newDoc;
  },

  async getPatients(filters?: {
    search?: string;
    hospitalId?: string;
    gender?: string;
    status?: string;
  }): Promise<Patient[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let result = [...patientsData];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.id.includes(q));
    }

    if (filters?.hospitalId && filters.hospitalId !== "All") {
      result = result.filter((p) => p.hospitalId === filters.hospitalId);
    }

    if (filters?.gender && filters.gender !== "All") {
      result = result.filter((p) => p.gender === filters.gender);
    }

    if (filters?.status && filters.status !== "All") {
      result = result.filter((p) => p.status === filters.status);
    }

    return result;
  },

  async getPatient(id: string): Promise<PatientDetails> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const patient = patientsData.find((p) => p.id === id);
    if (!patient) throw new Error("Patient not found");

    const pDocs = doctorsData.filter((d) => d.id === patient.doctorId);

    return {
      patient,
      appointments: appointmentsData.filter((a) => a.patientId === id),
      admissions: admissionsData.filter((a) => a.patientId === id),
      doctors: pDocs,
      timeline: [
        { id: "t-1", title: "Consultation Check", date: patient.lastVisit, description: "Regular wellness checkup and vital checks completed." },
      ],
    };
  },

  async getNurses(filters?: { hospitalId?: string; shift?: string }): Promise<Nurse[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...nursesData];
    if (filters?.hospitalId && filters.hospitalId !== "All") {
      result = result.filter((n) => n.hospitalId === filters.hospitalId);
    }
    if (filters?.shift && filters.shift !== "All") {
      result = result.filter((n) => n.shift === filters.shift);
    }
    return result;
  },

  async getStaff(filters?: { hospitalId?: string; type?: string }): Promise<Staff[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...staffData];
    if (filters?.hospitalId && filters.hospitalId !== "All") {
      result = result.filter((s) => s.hospitalId === filters.hospitalId);
    }
    if (filters?.type && filters.type !== "All") {
      result = result.filter((s) => s.type === filters.type);
    }
    return result;
  },

  async getAppointments(filters?: { status?: string; hospitalId?: string }): Promise<Appointment[]> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    let result = [...appointmentsData];
    if (filters?.status && filters.status !== "All") {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters?.hospitalId && filters.hospitalId !== "All") {
      result = result.filter((a) => a.hospitalId === filters.hospitalId);
    }
    return result;
  },

  async getAdmissions(): Promise<Admission[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...admissionsData];
  },

  async getOccupancy(): Promise<BedOccupancy> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_BED_OCCUPANCY;
  },

  async getClinicalAnalytics() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_CLINICAL_ANALYTICS;
  },
};
