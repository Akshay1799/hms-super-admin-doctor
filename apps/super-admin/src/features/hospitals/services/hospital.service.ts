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

let hospitalsData = [...MOCK_HOSPITALS];
const branchesData = { ...MOCK_BRANCHES };
const departmentsData = { ...MOCK_DEPARTMENTS };
const capacitiesData = { ...MOCK_CAPACITY };
const accreditationsData = { ...MOCK_ACCREDITATION };
const settingsData = { ...MOCK_SETTINGS };
const auditsData = { ...MOCK_AUDIT_LOGS };

export interface HospitalDetails {
  hospital: Hospital;
  capacity: HospitalCapacity;
  accreditation: HospitalAccreditation;
  settings: HospitalSettings;
  branches: Branch[];
  auditLogs: HospitalAuditLog[];
}

export const hospitalService = {
  async getHospitals(filters?: {
    search?: string;
    tenantId?: string;
    type?: string;
    status?: string;
    state?: string;
  }): Promise<Hospital[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
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
      result = result.filter((h) => h.tenantId === filters.tenantId);
    }

    if (filters?.type && filters.type !== "All") {
      result = result.filter((h) => h.type === filters.type);
    }

    if (filters?.status && filters.status !== "All") {
      result = result.filter((h) => h.status === filters.status);
    }

    return result.sort((a, b) => b.id.localeCompare(a.id));
  },

  async getHospital(id: string): Promise<HospitalDetails> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const hospital = hospitalsData.find((h) => h.id === id);
    if (!hospital) {
      throw new Error(`Hospital with ID ${id} not found.`);
    }

    return {
      hospital,
      capacity: capacitiesData[id] || {
        totalBeds: 0,
        availableBeds: 0,
        occupiedBeds: 0,
        icuBeds: 0,
        otRooms: 0,
        ambulances: 0,
        emergencyUnits: 0,
        pharmacyAvailable: false,
        laboratoryAvailable: false,
        bloodBankAvailable: false,
      },
      accreditation: accreditationsData[id] || {
        nabh: "Not Applied",
        jci: "Not Applied",
        iso: "Not Certified",
        licenseNumber: "N/A",
        expiryDate: "",
      },
      settings: settingsData[id] || {
        timezone: "UTC",
        currency: "USD",
        language: "en",
        format24h: true,
        weekStart: "Monday",
      },
      branches: branchesData[id] || [],
      auditLogs: auditsData[id] || [],
    };
  },

  async createHospital(input: CreateHospitalInput): Promise<Hospital> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (hospitalsData.some((h) => h.code === input.code.toUpperCase())) {
      throw new Error(`Hospital code "${input.code.toUpperCase()}" is already in use.`);
    }

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

    // Set Capacity
    capacitiesData[newId] = {
      totalBeds: input.totalBeds,
      icuBeds: input.icuBeds,
      otRooms: input.otRooms,
      emergencyUnits: input.emergencyUnits,
      ambulances: input.ambulances,
      occupiedBeds: 0,
      availableBeds: input.totalBeds,
      pharmacyAvailable: input.pharmacyAvailable,
      laboratoryAvailable: input.laboratoryAvailable,
      bloodBankAvailable: input.bloodBankAvailable,
    };

    // Set Accreditation
    accreditationsData[newId] = {
      nabh: input.nabh,
      jci: input.jci,
      iso: input.iso,
      licenseNumber: input.licenseNumber,
      expiryDate: input.expiryDate,
      documents: input.documents,
    };

    // Set Settings
    settingsData[newId] = {
      timezone: input.timezone,
      currency: input.currency,
      language: input.language,
      format24h: input.format24h,
      weekStart: input.weekStart,
    };

    // Initialize Branches
    branchesData[newId] = [];

    // Set Initial Audit Log
    auditsData[newId] = [
      {
        id: `aud-${Date.now()}`,
        action: "Hospital Onboarded",
        user: "Super Admin",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        description: `Hospital "${input.name}" was registered under tenant ID ${input.tenantId}.`,
      },
    ];

    return newHospital;
  },

  async updateHospital(id: string, input: Partial<CreateHospitalInput>): Promise<Hospital> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const idx = hospitalsData.findIndex((h) => h.id === id);
    if (idx === -indexOrNotFound(idx)) throw new Error("Hospital not found");

    function indexOrNotFound(i: number) {
      return i === -1 ? 1 : -1;
    }

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

    // Update Capacity
    if (capacitiesData[id]) {
      capacitiesData[id] = {
        ...capacitiesData[id],
        totalBeds: input.totalBeds ?? capacitiesData[id].totalBeds,
        icuBeds: input.icuBeds ?? capacitiesData[id].icuBeds,
        otRooms: input.otRooms ?? capacitiesData[id].otRooms,
        emergencyUnits: input.emergencyUnits ?? capacitiesData[id].emergencyUnits,
        ambulances: input.ambulances ?? capacitiesData[id].ambulances,
        pharmacyAvailable: input.pharmacyAvailable ?? capacitiesData[id].pharmacyAvailable,
        laboratoryAvailable: input.laboratoryAvailable ?? capacitiesData[id].laboratoryAvailable,
        bloodBankAvailable: input.bloodBankAvailable ?? capacitiesData[id].bloodBankAvailable,
        availableBeds: (input.totalBeds ?? capacitiesData[id].totalBeds) - capacitiesData[id].occupiedBeds,
      };
    }

    // Update Accreditation
    if (acacreditationExists(id)) {
      accreditationsData[id] = {
        ...accreditationsData[id],
        nabh: input.nabh ?? accreditationsData[id].nabh,
        jci: input.jci ?? accreditationsData[id].jci,
        iso: input.iso ?? accreditationsData[id].iso,
        licenseNumber: input.licenseNumber ?? accreditationsData[id].licenseNumber,
        expiryDate: input.expiryDate ?? accreditationsData[id].expiryDate,
      };
    }

    function acacreditationExists(idxStr: string) {
      return !!accreditationsData[idxStr];
    }

    // Update Settings
    if (settingsData[id]) {
      settingsData[id] = {
        ...settingsData[id],
        timezone: input.timezone ?? settingsData[id].timezone,
        currency: input.currency ?? settingsData[id].currency,
        language: input.language ?? settingsData[id].language,
        format24h: input.format24h ?? settingsData[id].format24h,
        weekStart: input.weekStart ?? settingsData[id].weekStart,
      };
    }

    // Append Audit Log
    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `aud-${Date.now()}`,
      action: "Hospital Updated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Hospital configurations were modified.",
    });

    return updated;
  },

  async suspendHospital(id: string): Promise<Hospital> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const hosp = hospitalsData.find((h) => h.id === id);
    if (!hosp) throw new Error("Hospital not found");
    hosp.status = "Suspended";

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `aud-${Date.now()}`,
      action: "Hospital Suspended",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Hospital nodes status was set to Suspended.",
    });

    return hosp;
  },

  async activateHospital(id: string): Promise<Hospital> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const hosp = hospitalsData.find((h) => h.id === id);
    if (!hosp) throw new Error("Hospital not found");
    hosp.status = "Active";

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `aud-${Date.now()}`,
      action: "Hospital Activated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Hospital nodes status was restored to Active.",
    });

    return hosp;
  },

  async deleteHospital(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    hospitalsData = hospitalsData.filter((h) => h.id !== id);
    delete branchesData[id];
    delete capacitiesData[id];
    delete accreditationsData[id];
    delete settingsData[id];
    delete auditsData[id];
  },

  // Branch CRUD Actions
  async getBranches(hospitalId: string): Promise<Branch[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return branchesData[hospitalId] || [];
  },

  async createBranch(hospitalId: string, input: Omit<Branch, "id" | "hospitalId" | "doctorCount" | "patientCount" | "departmentCount">): Promise<Branch> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newBranch: Branch = {
      id: `b-${Date.now()}`,
      hospitalId,
      name: input.name,
      code: input.code.toUpperCase(),
      city: input.city,
      status: input.status,
      doctorCount: 0,
      patientCount: 0,
      departmentCount: 0,
    };

    if (!branchesData[hospitalId]) branchesData[hospitalId] = [];
    branchesData[hospitalId].push(newBranch);

    // Update branch count in hospital list
    const hosp = hospitalsData.find((h) => h.id === hospitalId);
    if (hosp) hosp.branchCount = branchesData[hospitalId].length;

    return newBranch;
  },

  async updateBranch(hospitalId: string, branchId: string, input: Partial<Branch>): Promise<Branch> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const branches = branchesData[hospitalId] || [];
    const idx = branches.findIndex((b) => b.id === branchId);
    if (idx === -1) throw new Error("Branch not found");

    const updated = {
      ...branches[idx],
      ...input,
      name: input.name ?? branches[idx].name,
      city: input.city ?? branches[idx].city,
      status: input.status ?? branches[idx].status,
    };
    branches[idx] = updated;
    return updated;
  },

  async deleteBranch(hospitalId: string, branchId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (branchesData[hospitalId]) {
      branchesData[hospitalId] = branchesData[hospitalId].filter((b) => b.id !== branchId);
      
      const hosp = hospitalsData.find((h) => h.id === hospitalId);
      if (hosp) hosp.branchCount = branchesData[hospitalId].length;
    }
  },

  // Department CRUD Actions
  async getDepartments(branchId: string): Promise<Department[]> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return departmentsData[branchId] || [];
  },

  async createDepartment(branchId: string, input: { name: string; status: string }): Promise<Department> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newDep: Department = {
      id: `dep-${Date.now()}`,
      branchId,
      name: input.name,
      status: input.status,
      doctorCount: 0,
      patientCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (!departmentsData[branchId]) departmentsData[branchId] = [];
    departmentsData[branchId].push(newDep);

    return newDep;
  },

  async updateDepartment(branchId: string, depId: string, input: Partial<Department>): Promise<Department> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const deps = departmentsData[branchId] || [];
    const idx = deps.findIndex((d) => d.id === depId);
    if (idx === -1) throw new Error("Department not found");

    const updated = {
      ...deps[idx],
      ...input,
      name: input.name ?? deps[idx].name,
      status: input.status ?? deps[idx].status,
    };
    deps[idx] = updated;
    return updated;
  },

  async deleteDepartment(branchId: string, depId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (departmentsData[branchId]) {
      departmentsData[branchId] = departmentsData[branchId].filter((d) => d.id !== depId);
    }
  },

  // Specialized Sub-configurations
  async updateCapacity(id: string, input: HospitalCapacity): Promise<HospitalCapacity> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    capacitiesData[id] = input;
    return input;
  },

  async updateAccreditation(id: string, input: HospitalAccreditation): Promise<HospitalAccreditation> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    accreditationsData[id] = input;
    return input;
  },

  async updateSettings(id: string, input: HospitalSettings): Promise<HospitalSettings> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    settingsData[id] = input;
    return input;
  },
};
