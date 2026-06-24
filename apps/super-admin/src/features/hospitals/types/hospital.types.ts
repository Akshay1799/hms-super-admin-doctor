export interface Hospital {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: string;
  branchCount: number;
  doctorCount: number;
  patientCount: number;
  bedCount: number;
  status: "Active" | "Inactive" | "Suspended" | "Under Review";
  createdAt: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
}

export interface Branch {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  city: string;
  status: string;
  doctorCount: number;
  patientCount: number;
  departmentCount: number;
}

export interface Department {
  id: string;
  branchId: string;
  name: string;
  doctorCount: number;
  patientCount: number;
  status: string;
  createdAt?: string;
}

export interface HospitalCapacity {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  otRooms: number;
  ambulances: number;
  emergencyUnits: number;
  pharmacyAvailable: boolean;
  laboratoryAvailable: boolean;
  bloodBankAvailable: boolean;
}

export interface HospitalAccreditation {
  nabh: "Accredited" | "Pending" | "Not Applied" | string;
  jci: "Accredited" | "Pending" | "Not Applied" | string;
  iso: "Certified" | "Pending" | "Not Certified" | string;
  licenseNumber: string;
  expiryDate: string;
  documents?: string[];
}

export interface HospitalSettings {
  timezone: string;
  currency: string;
  language: string;
  format24h: boolean;
  weekStart: string;
  workingHours?: string;
  emergencyContact?: string;
}

export interface HospitalAuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  description: string;
}
