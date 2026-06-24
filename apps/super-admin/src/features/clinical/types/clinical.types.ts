export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  branchId: string;
  departmentId: string;
  experience: number;
  rating: number;
  status: "Active" | "Inactive" | "Suspended" | "On Leave";
  patientsCount: number;
  consultationTime: number; // in minutes
  successRate: number; // percentage
  avatarUrl?: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Other" | string;
  age: number;
  hospitalId: string;
  doctorId: string;
  status: "Active" | "Inactive" | string;
  lastVisit: string;
  bloodGroup: string;
  dateOfBirth?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  status: "Completed" | "Pending" | "Cancelled" | "Rescheduled";
}

export interface Nurse {
  id: string;
  name: string;
  hospitalId: string;
  branchId: string;
  departmentId: string;
  shift: "Morning" | "Evening" | "Night";
  status: "Active" | "Inactive" | string;
}

export interface Staff {
  id: string;
  name: string;
  type: "Receptionist" | "Pharmacist" | "Lab Technician" | "Radiologist" | "Admin Staff" | "Billing Staff" | string;
  hospitalId: string;
  branchId: string;
  departmentId: string;
  status: "Active" | "Inactive" | string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  type: "IPD" | "OPD" | "Emergency";
  status: "Admitted" | "Discharged";
  admissionDate: string;
  dischargeDate?: string;
}

export interface BedOccupancy {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  icuBeds: number;
  emergencyBeds: number;
}
