import {
  Hospital,
  Branch,
  Department,
  HospitalCapacity,
  HospitalAccreditation,
  HospitalSettings,
  HospitalAuditLog,
} from "../types/hospital.types";

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "h-1",
    tenantId: "1",
    name: "Apollo Main Hospital",
    code: "AP-NY",
    type: "General Hospital",
    branchCount: 3,
    doctorCount: 45,
    patientCount: 1200,
    bedCount: 250,
    status: "Active",
    createdAt: "2026-01-15",
    email: "ny-admin@apollo.com",
    phone: "+1 (555) 019-2834",
    website: "https://ny.apollo.com",
    description: "State-of-the-art general hospital based in New York, specializing in cardio care and robotic surgery.",
  },
  {
    id: "h-2",
    tenantId: "1",
    name: "Apollo Cardiac Clinic",
    code: "AP-BOS",
    type: "Specialty Hospital",
    branchCount: 1,
    doctorCount: 12,
    patientCount: 340,
    bedCount: 50,
    status: "Active",
    createdAt: "2026-02-10",
    email: "boston-admin@apollo.com",
    phone: "+1 (555) 019-8877",
    website: "https://boston.apollo.com",
    description: "Specialized cardiac surgery and recovery hospital unit.",
  },
  {
    id: "h-3",
    tenantId: "2",
    name: "CareFirst Diagnostics",
    code: "CF-CHI",
    type: "Diagnostic Center",
    branchCount: 2,
    doctorCount: 8,
    patientCount: 950,
    bedCount: 0,
    status: "Under Review",
    createdAt: "2026-05-22",
    email: "chicago-lab@carefirst.com",
    phone: "+1 (555) 040-5690",
    website: "https://lab.carefirst.com",
    description: "Centralized laboratory diagnostics and diagnostic imaging clinic.",
  },
  {
    id: "h-4",
    tenantId: "3",
    name: "Sutter Regional Labs",
    code: "SU-SF",
    type: "Clinic",
    branchCount: 1,
    doctorCount: 5,
    patientCount: 120,
    bedCount: 10,
    status: "Active",
    createdAt: "2026-04-20",
    email: "sf-clinic@sutter.com",
    phone: "+1 (555) 099-1221",
    website: "https://sf.sutter.com",
    description: "Neighborhood clinic and laboratory testing station.",
  },
  {
    id: "h-5",
    tenantId: "4",
    name: "Max Medical Solutions",
    code: "MAX-LA",
    type: "Teaching Hospital",
    branchCount: 4,
    doctorCount: 95,
    patientCount: 4500,
    bedCount: 600,
    status: "Suspended",
    createdAt: "2025-11-15",
    email: "la-teaching@maxmedical.com",
    phone: "+1 (555) 070-1928",
    website: "https://la.maxmedical.com",
    description: "Multi-discipline medical teaching university hospital network.",
  },
];

export const MOCK_BRANCHES: Record<string, Branch[]> = {
  "h-1": [
    { id: "b-1", hospitalId: "h-1", name: "Manhattan Main Wing", code: "AP-NY-MHT", city: "New York", status: "Active", doctorCount: 25, patientCount: 800, departmentCount: 5 },
    { id: "b-2", hospitalId: "h-1", name: "Brooklyn Outpatient", code: "AP-NY-BRK", city: "Brooklyn", status: "Active", doctorCount: 15, patientCount: 350, departmentCount: 3 },
    { id: "b-3", hospitalId: "h-1", name: "Queens Radiology", code: "AP-NY-QNS", city: "Queens", status: "Inactive", doctorCount: 5, patientCount: 50, departmentCount: 1 },
  ],
  "h-2": [
    { id: "b-4", hospitalId: "h-2", name: "Boston Heart Center", code: "AP-BOS-MAIN", city: "Boston", status: "Active", doctorCount: 12, patientCount: 340, departmentCount: 2 },
  ],
  "h-3": [
    { id: "b-5", hospitalId: "h-3", name: "Chicago Loop Center", code: "CF-CHI-LOOP", city: "Chicago", status: "Active", doctorCount: 6, patientCount: 700, departmentCount: 2 },
    { id: "b-6", hospitalId: "h-3", name: "Evanston Testing", code: "CF-CHI-EVN", city: "Evanston", status: "Active", doctorCount: 2, patientCount: 250, departmentCount: 1 },
  ],
  "h-4": [
    { id: "b-7", hospitalId: "h-4", name: "Sutter SF Central", code: "SU-SF-MAIN", city: "San Francisco", status: "Active", doctorCount: 5, patientCount: 120, departmentCount: 3 },
  ],
  "h-5": [
    { id: "b-8", hospitalId: "h-5", name: "Max LA Medical Center", code: "MAX-LA-MC", city: "Los Angeles", status: "Active", doctorCount: 60, patientCount: 3000, departmentCount: 8 },
    { id: "b-9", hospitalId: "h-5", name: "Max UCLA Outpost", code: "MAX-LA-UCLA", city: "Westwood", status: "Active", doctorCount: 20, patientCount: 1000, departmentCount: 4 },
  ],
};

export const MOCK_DEPARTMENTS: Record<string, Department[]> = {
  "b-1": [
    { id: "dep-1", branchId: "b-1", name: "Cardiology", doctorCount: 8, patientCount: 250, status: "Active", createdAt: "2026-01-15" },
    { id: "dep-2", branchId: "b-1", name: "Neurology", doctorCount: 5, patientCount: 150, status: "Active", createdAt: "2026-01-15" },
    { id: "dep-3", branchId: "b-1", name: "Orthopedics", doctorCount: 6, patientCount: 200, status: "Active", createdAt: "2026-01-18" },
    { id: "dep-4", branchId: "b-1", name: "Radiology", doctorCount: 3, patientCount: 120, status: "Active", createdAt: "2026-01-20" },
    { id: "dep-5", branchId: "b-1", name: "Emergency", doctorCount: 3, patientCount: 80, status: "Active", createdAt: "2026-01-15" },
  ],
  "b-2": [
    { id: "dep-6", branchId: "b-2", name: "Pediatrics", doctorCount: 6, patientCount: 180, status: "Active", createdAt: "2026-02-01" },
    { id: "dep-7", branchId: "b-2", name: "Dermatology", doctorCount: 5, patientCount: 110, status: "Active", createdAt: "2026-02-05" },
    { id: "dep-8", branchId: "b-2", name: "ENT", doctorCount: 4, patientCount: 60, status: "Active", createdAt: "2026-02-01" },
  ],
  "b-3": [
    { id: "dep-9", branchId: "b-3", name: "Radiology", doctorCount: 5, patientCount: 50, status: "Inactive", createdAt: "2026-03-01" },
  ],
  "b-4": [
    { id: "dep-10", branchId: "b-4", name: "Cardiology", doctorCount: 9, patientCount: 260, status: "Active", createdAt: "2026-02-10" },
    { id: "dep-11", branchId: "b-4", name: "Emergency", doctorCount: 3, patientCount: 80, status: "Active", createdAt: "2026-02-12" },
  ],
  "b-5": [
    { id: "dep-12", branchId: "b-5", name: "Pathology", doctorCount: 4, patientCount: 400, status: "Active", createdAt: "2026-05-22" },
    { id: "dep-13", branchId: "b-5", name: "Radiology", doctorCount: 2, patientCount: 300, status: "Active", createdAt: "2026-05-24" },
  ],
};

export const MOCK_CAPACITY: Record<string, HospitalCapacity> = {
  "h-1": { totalBeds: 250, availableBeds: 60, occupiedBeds: 190, icuBeds: 40, otRooms: 12, ambulances: 6, emergencyUnits: 4, pharmacyAvailable: true, laboratoryAvailable: true, bloodBankAvailable: true },
  "h-2": { totalBeds: 50, availableBeds: 15, occupiedBeds: 35, icuBeds: 15, otRooms: 4, ambulances: 2, emergencyUnits: 1, pharmacyAvailable: true, laboratoryAvailable: false, bloodBankAvailable: false },
  "h-3": { totalBeds: 0, availableBeds: 0, occupiedBeds: 0, icuBeds: 0, otRooms: 0, ambulances: 3, emergencyUnits: 2, pharmacyAvailable: false, laboratoryAvailable: true, bloodBankAvailable: false },
  "h-4": { totalBeds: 10, availableBeds: 4, occupiedBeds: 6, icuBeds: 0, otRooms: 1, ambulances: 1, emergencyUnits: 1, pharmacyAvailable: true, laboratoryAvailable: true, bloodBankAvailable: false },
  "h-5": { totalBeds: 600, availableBeds: 120, occupiedBeds: 480, icuBeds: 100, otRooms: 24, ambulances: 15, emergencyUnits: 8, pharmacyAvailable: true, laboratoryAvailable: true, bloodBankAvailable: true },
};

export const MOCK_ACCREDITATION: Record<string, HospitalAccreditation> = {
  "h-1": { nabh: "Accredited", jci: "Accredited", iso: "Certified", licenseNumber: "LIC-NY-9812", expiryDate: "2028-12-31" },
  "h-2": { nabh: "Accredited", jci: "Pending", iso: "Certified", licenseNumber: "LIC-MA-4512", expiryDate: "2027-06-30" }, // Expiring soon warning!
  "h-3": { nabh: "Pending", jci: "Not Applied", iso: "Pending", licenseNumber: "LIC-IL-0129", expiryDate: "2026-08-15" },  // Expiring very soon!
  "h-4": { nabh: "Not Applied", jci: "Not Applied", iso: "Certified", licenseNumber: "LIC-CA-8871", expiryDate: "2029-01-01" },
  "h-5": { nabh: "Accredited", jci: "Accredited", iso: "Certified", licenseNumber: "LIC-CA-0091", expiryDate: "2026-03-12" }, // Expired!
};

export const MOCK_SETTINGS: Record<string, HospitalSettings> = {
  "h-1": { timezone: "EST", currency: "USD", language: "en", format24h: true, weekStart: "Monday", workingHours: "24/7", emergencyContact: "+1 (555) 911-0011" },
  "h-2": { timezone: "EST", currency: "USD", language: "en", format24h: true, weekStart: "Monday", workingHours: "08:00 - 20:00", emergencyContact: "+1 (555) 911-0022" },
  "h-3": { timezone: "CST", currency: "USD", language: "en", format24h: true, weekStart: "Monday", workingHours: "07:00 - 22:00", emergencyContact: "+1 (555) 911-0033" },
  "h-4": { timezone: "PST", currency: "USD", language: "en", format24h: false, weekStart: "Sunday", workingHours: "09:00 - 17:00", emergencyContact: "+1 (555) 911-0044" },
  "h-5": { timezone: "PST", currency: "USD", language: "en", format24h: true, weekStart: "Monday", workingHours: "24/7", emergencyContact: "+1 (555) 911-0055" },
};

export const MOCK_AUDIT_LOGS: Record<string, HospitalAuditLog[]> = {
  "h-1": [
    { id: "hau-1", action: "Hospital Registered", user: "Super Admin", timestamp: "2026-01-15 09:00", description: "Apollo Main Hospital successfully provisioned under Apollo Health Group tenant." },
    { id: "hau-2", action: "NABH Approved", user: "System Auditor", timestamp: "2026-02-14 11:22", description: "NABH Accreditation certificate uploaded and validated." },
  ],
  "h-2": [
    { id: "hau-3", action: "Hospital Registered", user: "Super Admin", timestamp: "2026-02-10 10:15", description: "Apollo Cardiac Clinic provisioned." },
  ],
};
