import {
  Hospital,
  Branch,
  Department,
  HospitalCapacity,
  HospitalAccreditation,
  HospitalSettings,
  HospitalAuditLog,
} from "../types/hospital.types";
import { CreateHospitalInput } from "../schemas/hospital.schema";
import {
  MOCK_HOSPITALS,
  MOCK_BRANCHES,
  MOCK_DEPARTMENTS,
  MOCK_CAPACITY,
  MOCK_ACCREDITATION,
  MOCK_SETTINGS,
  MOCK_AUDIT_LOGS,
} from "../mocks/hospitals.mock";
import { apiClient } from "@/lib/api-client";

// In-memory fallback store — used when API is offline
let hospitalsData = [...MOCK_HOSPITALS];
const branchesData = { ...MOCK_BRANCHES };
const departmentsData = { ...MOCK_DEPARTMENTS };
const capacitiesData = { ...MOCK_CAPACITY };
const accreditationsData = { ...MOCK_ACCREDITATION };
const settingsData = { ...MOCK_SETTINGS };
const auditsData = { ...MOCK_AUDIT_LOGS };

/** Normalize a raw API hospital object to the frontend Hospital type */
function mapHospital(raw: any): Hospital {
  return {
    id: raw._id ?? raw.id,
    tenantId: raw.tenantId ?? "",
    name: raw.name,
    code: raw.code,
    type: raw.type,
    branchCount: raw.branchCount ?? 0,
    doctorCount: raw.doctorCount ?? 0,
    patientCount: raw.patientCount ?? 0,
    bedCount: raw.bedCount ?? raw.capacity?.totalBeds ?? 0,
    status: raw.status ?? "Active",
    createdAt: raw.createdAt
      ? new Date(raw.createdAt).toISOString().split("T")[0]
      : "",
    email: raw.email,
    phone: raw.phone,
    website: raw.website,
    description: raw.description,
    logo: raw.logo,
    address: raw.address,
    city: raw.city,
    state: raw.state,
    country: raw.country,
    pincode: raw.pincode,
  } as any;
}

function mapDepartment(raw: any): Department {
  return {
    id: raw._id ?? raw.id,
    branchId: raw.hospitalId ?? raw.branchId ?? "",
    name: raw.name,
    status: raw.status ?? "Active",
    doctorCount: raw.doctorCount ?? 0,
    patientCount: raw.patientCount ?? 0,
    createdAt: raw.createdAt
      ? new Date(raw.createdAt).toISOString().split("T")[0]
      : "",
  };
}

export interface HospitalDetails {
  hospital: Hospital;
  capacity: HospitalCapacity;
  accreditation: HospitalAccreditation;
  settings: HospitalSettings;
  branches: Branch[];
  auditLogs: HospitalAuditLog[];
}

export const hospitalService = {
  // ── List ──────────────────────────────────────────────────────────
  async getHospitals(filters?: {
    search?: string;
    tenantId?: string;
    type?: string;
    status?: string;
    state?: string;
  }): Promise<Hospital[]> {
    try {
      const params: Record<string, string> = { limit: "100" };
      if (filters?.search) params.search = filters.search;
      if (filters?.tenantId && filters.tenantId !== "All")
        params.tenantId = filters.tenantId;
      if (filters?.type && filters.type !== "All") params.type = filters.type;
      if (filters?.status && filters.status !== "All")
        params.status = filters.status;

      const res = await apiClient.get("/hospitals", { params });
      const hospitals: Hospital[] = (res.data.data ?? []).map(mapHospital);

      // If API returned real data use it; otherwise fall through to mock
      if (hospitals.length > 0) return hospitals;
      throw new Error("empty");
    } catch {
      // Offline / empty → apply filters to mock data
      let result = [...hospitalsData];

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.code.toLowerCase().includes(q) ||
            (h.email && h.email.toLowerCase().includes(q))
        );
      }
      if (filters?.tenantId && filters.tenantId !== "All") {
        const targetId = filters.tenantId;
        result = result.filter(
          (h) =>
            h.tenantId === targetId ||
            (targetId === "1" && h.tenantId === "1") ||
            (targetId === "tenant-1" && h.tenantId === "1")
        );
      }
      if (filters?.type && filters.type !== "All")
        result = result.filter((h) => h.type === filters.type);
      if (filters?.status && filters.status !== "All")
        result = result.filter((h) => h.status === filters.status);

      return result.sort((a, b) => b.id.localeCompare(a.id));
    }
  },

  // ── Detail ────────────────────────────────────────────────────────
  async getHospital(id: string): Promise<HospitalDetails> {
    try {
      const [hospitalRes, depsRes] = await Promise.all([
        apiClient.get(`/hospitals/${id}`),
        apiClient.get(`/hospitals/${id}/departments`).catch(() => ({ data: { data: [] } })),
      ]);

      const raw = hospitalRes.data.data;
      const hospital = mapHospital(raw);
      const departments: Department[] = (depsRes.data.data ?? []).map(mapDepartment);

      const defaultBranch: Branch = {
        id: hospital.id,
        hospitalId: hospital.id,
        name: hospital.name,
        code: hospital.code,
        city: (hospital as any).city || "Indore",
        status: hospital.status || "Active",
        doctorCount: hospital.doctorCount,
        patientCount: hospital.patientCount,
        departmentCount: departments.length || (hospital as any).departmentCount || 0,
      };

      return {
        hospital,
        capacity: raw.capacity ?? capacitiesData[id] ?? {
          totalBeds: 0, availableBeds: 0, occupiedBeds: 0, icuBeds: 0,
          otRooms: 0, ambulances: 0, emergencyUnits: 0,
          pharmacyAvailable: false, laboratoryAvailable: false, bloodBankAvailable: false,
        },
        accreditation: raw.accreditation ?? accreditationsData[id] ?? {
          nabh: "Not Applied", jci: "Not Applied", iso: "Not Certified",
          licenseNumber: "N/A", expiryDate: "",
        },
        settings: raw.settings ?? settingsData[id] ?? {
          timezone: "Asia/Kolkata", currency: "INR", language: "en",
          format24h: true, weekStart: "Monday",
        },
        branches: (branchesData[id] && branchesData[id].length > 0) ? branchesData[id] : [defaultBranch],
        auditLogs: auditsData[id] ?? [],
      };
    } catch {
      // Offline fallback
      const hospital = hospitalsData.find((h) => h.id === id);
      if (!hospital) throw new Error(`Hospital with ID ${id} not found.`);
      const defaultBranch: Branch = {
        id: hospital.id,
        hospitalId: hospital.id,
        name: hospital.name,
        code: hospital.code,
        city: (hospital as any).city || "Indore",
        status: hospital.status || "Active",
        doctorCount: hospital.doctorCount,
        patientCount: hospital.patientCount,
        departmentCount: (hospital as any).departmentCount || 0,
      };
      return {
        hospital,
        capacity: capacitiesData[id] ?? {
          totalBeds: 0, availableBeds: 0, occupiedBeds: 0, icuBeds: 0,
          otRooms: 0, ambulances: 0, emergencyUnits: 0,
          pharmacyAvailable: false, laboratoryAvailable: false, bloodBankAvailable: false,
        },
        accreditation: accreditationsData[id] ?? {
          nabh: "Not Applied", jci: "Not Applied", iso: "Not Certified",
          licenseNumber: "N/A", expiryDate: "",
        },
        settings: settingsData[id] ?? {
          timezone: "UTC", currency: "USD", language: "en",
          format24h: true, weekStart: "Monday",
        },
        branches: (branchesData[id] && branchesData[id].length > 0) ? branchesData[id] : [defaultBranch],
        auditLogs: auditsData[id] ?? [],
      };
    }
  },

  // ── Create ────────────────────────────────────────────────────────
  async createHospital(input: CreateHospitalInput): Promise<Hospital> {
    try {
      const res = await apiClient.post("/hospitals", {
        tenantId: input.tenantId,
        name: input.name,
        code: input.code.toUpperCase(),
        type: input.type,
        email: input.email,
        phone: input.phone,
        website: input.website,
        description: input.description,
        logo: input.logo,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        pincode: (input as any).pincode,
        capacity: {
          totalBeds: input.totalBeds,
          icuBeds: input.icuBeds,
          otRooms: input.otRooms,
          emergencyUnits: input.emergencyUnits,
          ambulances: input.ambulances,
          pharmacyAvailable: input.pharmacyAvailable,
          laboratoryAvailable: input.laboratoryAvailable,
          bloodBankAvailable: input.bloodBankAvailable,
        },
        accreditation: {
          nabh: input.nabh,
          jci: input.jci,
          iso: input.iso,
          licenseNumber: input.licenseNumber,
          expiryDate: input.expiryDate,
        },
        settings: {
          timezone: input.timezone,
          currency: input.currency,
          language: input.language,
          format24h: input.format24h,
          weekStart: input.weekStart,
        },
      });
      return mapHospital(res.data.data);
    } catch {
      // Offline fallback — mutate in-memory store
      if (hospitalsData.some((h) => h.code === input.code.toUpperCase()))
        throw new Error(`Hospital code "${input.code.toUpperCase()}" is already in use.`);

      const newId = `h-${Date.now()}`;
      const newHospital: Hospital = {
        id: newId,
        tenantId: input.tenantId,
        name: input.name,
        code: input.code.toUpperCase(),
        type: input.type,
        branchCount: 0,
        doctorCount: 0,
        patientCount: 0,
        bedCount: input.totalBeds,
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0],
        email: input.email,
        phone: input.phone,
        website: input.website,
        description: input.description,
        logo: input.logo,
      };
      hospitalsData.push(newHospital);
      capacitiesData[newId] = {
        totalBeds: input.totalBeds, icuBeds: input.icuBeds, otRooms: input.otRooms,
        emergencyUnits: input.emergencyUnits, ambulances: input.ambulances,
        occupiedBeds: 0, availableBeds: input.totalBeds,
        pharmacyAvailable: input.pharmacyAvailable,
        laboratoryAvailable: input.laboratoryAvailable,
        bloodBankAvailable: input.bloodBankAvailable,
      };
      accreditationsData[newId] = {
        nabh: input.nabh, jci: input.jci, iso: input.iso,
        licenseNumber: input.licenseNumber, expiryDate: input.expiryDate,
        documents: input.documents,
      };
      settingsData[newId] = {
        timezone: input.timezone, currency: input.currency, language: input.language,
        format24h: input.format24h, weekStart: input.weekStart,
      };
      branchesData[newId] = [];
      auditsData[newId] = [{
        id: `aud-${Date.now()}`, action: "Hospital Onboarded", user: "Super Admin",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        description: `Hospital "${input.name}" was registered under tenant ID ${input.tenantId}.`,
      }];
      return newHospital;
    }
  },

  // ── Update ────────────────────────────────────────────────────────
  async updateHospital(id: string, input: Partial<CreateHospitalInput>): Promise<Hospital> {
    try {
      const payload: Record<string, any> = { ...input };
      if (input.totalBeds !== undefined) {
        payload.capacity = {
          totalBeds: input.totalBeds, icuBeds: input.icuBeds, otRooms: input.otRooms,
          emergencyUnits: input.emergencyUnits, ambulances: input.ambulances,
          pharmacyAvailable: input.pharmacyAvailable,
          laboratoryAvailable: input.laboratoryAvailable,
          bloodBankAvailable: input.bloodBankAvailable,
        };
      }
      const res = await apiClient.patch(`/hospitals/${id}`, payload);
      return mapHospital(res.data.data);
    } catch {
      const idx = hospitalsData.findIndex((h) => h.id === id);
      if (idx === -1) throw new Error("Hospital not found");
      const existing = hospitalsData[idx];
      const updated: Hospital = {
        ...existing,
        name: input.name ?? existing.name,
        type: input.type ?? existing.type,
        email: input.email ?? existing.email,
        phone: input.phone ?? existing.phone,
        website: input.website ?? existing.website,
        description: input.description ?? existing.description,
        bedCount: input.totalBeds ?? existing.bedCount,
      };
      hospitalsData[idx] = updated;
      return updated;
    }
  },

  // ── Suspend / Activate ────────────────────────────────────────────
  async suspendHospital(id: string): Promise<Hospital> {
    try {
      const res = await apiClient.patch(`/hospitals/${id}`, { status: "Suspended" });
      return mapHospital(res.data.data);
    } catch {
      const hosp = hospitalsData.find((h) => h.id === id);
      if (!hosp) throw new Error("Hospital not found");
      hosp.status = "Suspended";
      return hosp;
    }
  },

  async activateHospital(id: string): Promise<Hospital> {
    try {
      const res = await apiClient.patch(`/hospitals/${id}`, { status: "Active" });
      return mapHospital(res.data.data);
    } catch {
      const hosp = hospitalsData.find((h) => h.id === id);
      if (!hosp) throw new Error("Hospital not found");
      hosp.status = "Active";
      return hosp;
    }
  },

  // ── Delete ────────────────────────────────────────────────────────
  async deleteHospital(id: string): Promise<void> {
    try {
      await apiClient.delete(`/hospitals/${id}`);
    } catch {
      hospitalsData = hospitalsData.filter((h) => h.id !== id);
      delete branchesData[id];
      delete capacitiesData[id];
      delete accreditationsData[id];
      delete settingsData[id];
      delete auditsData[id];
    }
  },

  // ── Departments ───────────────────────────────────────────────────
  async getDepartments(hospitalId: string): Promise<Department[]> {
    try {
      const res = await apiClient.get(`/hospitals/${hospitalId}/departments`);
      const deps = (res.data.data ?? []).map(mapDepartment);
      if (deps.length > 0) return deps;
      throw new Error("empty");
    } catch {
      return departmentsData[hospitalId] ?? [];
    }
  },

  async createDepartment(
    branchId: string,
    input: { name: string; status: string }
  ): Promise<Department> {
    try {
      const res = await apiClient.post(`/departments`, {
        hospitalId: branchId, ...input,
      });
      return mapDepartment(res.data.data);
    } catch {
      const newDep: Department = {
        id: `dep-${Date.now()}`, branchId, name: input.name, status: input.status,
        doctorCount: 0, patientCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      if (!departmentsData[branchId]) departmentsData[branchId] = [];
      departmentsData[branchId].push(newDep);
      return newDep;
    }
  },

  async updateDepartment(
    branchId: string,
    depId: string,
    input: Partial<Department>
  ): Promise<Department> {
    try {
      const res = await apiClient.patch(`/departments/${depId}`, input);
      return mapDepartment(res.data.data);
    } catch {
      const deps = departmentsData[branchId] ?? [];
      const idx = deps.findIndex((d) => d.id === depId);
      if (idx === -1) throw new Error("Department not found");
      const updated = { ...deps[idx], ...input };
      deps[idx] = updated;
      return updated;
    }
  },

  async deleteDepartment(branchId: string, depId: string): Promise<void> {
    try {
      await apiClient.delete(`/departments/${depId}`);
    } catch {
      if (departmentsData[branchId])
        departmentsData[branchId] = departmentsData[branchId].filter((d) => d.id !== depId);
    }
  },

  // ── Branches (legacy — kept for mock compatibility) ────────────────
  async getBranches(hospitalId: string): Promise<Branch[]> {
    return branchesData[hospitalId] ?? [];
  },

  async createBranch(
    hospitalId: string,
    input: Omit<Branch, "id" | "hospitalId" | "doctorCount" | "patientCount" | "departmentCount">
  ): Promise<Branch> {
    const newBranch: Branch = {
      id: `b-${Date.now()}`, hospitalId, name: input.name,
      code: input.code.toUpperCase(), city: input.city, status: input.status,
      doctorCount: 0, patientCount: 0, departmentCount: 0,
    };
    if (!branchesData[hospitalId]) branchesData[hospitalId] = [];
    branchesData[hospitalId].push(newBranch);
    const hosp = hospitalsData.find((h) => h.id === hospitalId);
    if (hosp) hosp.branchCount = branchesData[hospitalId].length;
    return newBranch;
  },

  async updateBranch(hospitalId: string, branchId: string, input: Partial<Branch>): Promise<Branch> {
    const branches = branchesData[hospitalId] ?? [];
    const idx = branches.findIndex((b) => b.id === branchId);
    if (idx === -1) throw new Error("Branch not found");
    const updated = { ...branches[idx], ...input };
    branches[idx] = updated;
    return updated;
  },

  async deleteBranch(hospitalId: string, branchId: string): Promise<void> {
    if (branchesData[hospitalId]) {
      branchesData[hospitalId] = branchesData[hospitalId].filter((b) => b.id !== branchId);
      const hosp = hospitalsData.find((h) => h.id === hospitalId);
      if (hosp) hosp.branchCount = branchesData[hospitalId].length;
    }
  },

  // ── Sub-configs (capacity / accreditation / settings) ─────────────
  async updateCapacity(id: string, input: HospitalCapacity): Promise<HospitalCapacity> {
    try {
      const res = await apiClient.patch(`/hospitals/${id}`, { capacity: input });
      return res.data.data?.capacity ?? input;
    } catch {
      capacitiesData[id] = input;
      return input;
    }
  },

  async updateAccreditation(id: string, input: HospitalAccreditation): Promise<HospitalAccreditation> {
    try {
      const res = await apiClient.patch(`/hospitals/${id}`, { accreditation: input });
      return res.data.data?.accreditation ?? input;
    } catch {
      accreditationsData[id] = input;
      return input;
    }
  },

  async updateSettings(id: string, input: HospitalSettings): Promise<HospitalSettings> {
    try {
      const res = await apiClient.patch(`/hospitals/${id}`, { settings: input });
      return res.data.data?.settings ?? input;
    } catch {
      settingsData[id] = input;
      return input;
    }
  },
};
