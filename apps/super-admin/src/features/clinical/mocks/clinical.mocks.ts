import { Doctor, Patient, Appointment, Nurse, Staff, Admission, BedOccupancy, Ward } from "../types/clinical.types";

export const MOCK_DOCTORS: Doctor[] = [
  { id: "doc-1", name: "Dr. Rajesh Sharma", specialization: "Diagnostics / Nephrology", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-1", experience: 22, rating: 4.8, status: "Active", patientsCount: 480, consultationTime: 25, successRate: 94 },
  { id: "doc-2", name: "Dr. Ananya Verma", specialization: "General Medicine", hospitalId: "h-1", branchId: "b-2", departmentId: "dep-6", experience: 14, rating: 4.5, status: "Active", patientsCount: 320, consultationTime: 15, successRate: 88 },
  { id: "doc-3", name: "Dr. Vikramaditya Joshi", specialization: "Neurosurgery", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-2", experience: 18, rating: 4.9, status: "Inactive", patientsCount: 150, consultationTime: 40, successRate: 98 },
  { id: "doc-4", name: "Dr. Meenakshi Sundaram", specialization: "Psychiatry", hospitalId: "h-2", branchId: "b-4", departmentId: "dep-10", experience: 25, rating: 4.7, status: "Active", patientsCount: 220, consultationTime: 50, successRate: 91 },
  { id: "doc-5", name: "Dr. Sanjay Kulkarni", specialization: "General Surgery", hospitalId: "h-5", branchId: "b-8", departmentId: "dep-1", experience: 12, rating: 4.6, status: "On Leave", patientsCount: 280, consultationTime: 20, successRate: 89 },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: "pat-1", name: "Satish Bhosale", gender: "Male", age: 45, hospitalId: "h-1", doctorId: "doc-1", status: "Active", lastVisit: "2026-06-10", bloodGroup: "O+" },
  { id: "pat-2", name: "Anushka Ladne", gender: "Female", age: 38, hospitalId: "h-1", doctorId: "doc-1", status: "Active", lastVisit: "2026-06-12", bloodGroup: "A-" },
  { id: "pat-3", name: "Dinesh Sharma", gender: "Male", age: 60, hospitalId: "h-1", doctorId: "doc-2", status: "Inactive", lastVisit: "2026-05-20", bloodGroup: "B+" },
  { id: "pat-4", name: "Sunanda Solanki", gender: "Female", age: 29, hospitalId: "h-2", doctorId: "doc-4", status: "Active", lastVisit: "2026-06-20", bloodGroup: "AB+" },
  { id: "pat-5", name: "Ganesh Tripathi", gender: "Male", age: 35, hospitalId: "h-5", doctorId: "doc-5", status: "Active", lastVisit: "2026-06-15", bloodGroup: "O-" },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", doctorId: "doc-1", doctorName: "Dr. Rajesh Sharma", patientId: "pat-1", patientName: "Satish Bhosale", hospitalId: "h-1", hospitalName: "MediPlus Hospital", date: "2026-06-23", timeSlot: "09:00 - 09:30", status: "Completed" },
  { id: "apt-2", doctorId: "doc-1", doctorName: "Dr. Rajesh Sharma", patientId: "pat-2", patientName: "Anushka Ladne", hospitalId: "h-1", hospitalName: "MediPlus Hospital", date: "2026-06-23", timeSlot: "10:00 - 10:30", status: "Pending" },
  { id: "apt-3", doctorId: "doc-2", doctorName: "Dr. Ananya Verma", patientId: "pat-3", patientName: "Dinesh Sharma", hospitalId: "h-1", hospitalName: "MediPlus Hospital", date: "2026-06-24", timeSlot: "11:00 - 11:30", status: "Rescheduled" },
  { id: "apt-4", doctorId: "doc-4", doctorName: "Dr. Meenakshi Sundaram", patientId: "pat-4", patientName: "Sunanda Solanki", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", date: "2026-06-23", timeSlot: "15:00 - 15:50", status: "Pending" },
  { id: "apt-5", doctorId: "doc-5", doctorName: "Dr. Sanjay Kulkarni", patientId: "pat-5", patientName: "Ganesh Tripathi", hospitalId: "h-5", hospitalName: "R K Hospital", date: "2026-06-22", timeSlot: "14:00 - 14:30", status: "Cancelled" },
];

export const MOCK_NURSES: Nurse[] = [
  { id: "nur-1", name: "Nurse Priya Verma", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-5", shift: "Morning", status: "Active" },
  { id: "nur-2", name: "Nurse Anjali Sharma", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-1", shift: "Evening", status: "Active" },
  { id: "nur-3", name: "Nurse Sunita Patel", hospitalId: "h-2", branchId: "b-4", departmentId: "dep-10", shift: "Night", status: "Active" },
];

export const MOCK_STAFF: Staff[] = [
  { id: "st-1", name: "Pooja Deshmukh", type: "Receptionist", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-5", status: "Active" },
  { id: "st-2", name: "Ramesh Pawar", type: "Billing Staff", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-5", status: "Active" },
  { id: "st-3", name: "Suresh Gupta", type: "Admin Staff", hospitalId: "h-2", branchId: "b-4", departmentId: "dep-10", status: "Active" },
  { id: "st-4", name: "Vikram Singh", type: "Lab Technician", hospitalId: "h-5", branchId: "b-8", departmentId: "dep-12", status: "Active" },
];

export const MOCK_ADMISSIONS: Admission[] = [
  { id: "adm-1", patientId: "pat-1", patientName: "Satish Bhosale", hospitalId: "h-1", hospitalName: "MediPlus Hospital", type: "IPD", status: "Admitted", admissionDate: "2026-06-18" },
  { id: "adm-2", patientId: "pat-2", patientName: "Anushka Ladne", hospitalId: "h-1", hospitalName: "MediPlus Hospital", type: "Emergency", status: "Admitted", admissionDate: "2026-06-22" },
  { id: "adm-3", patientId: "pat-3", patientName: "Dinesh Sharma", hospitalId: "h-1", hospitalName: "MediPlus Hospital", type: "OPD", status: "Discharged", admissionDate: "2026-05-20", dischargeDate: "2026-05-21" },
];

export const MOCK_BED_OCCUPANCY: BedOccupancy = {
  totalBeds: 1100,
  occupiedBeds: 890,
  availableBeds: 210,
  icuBeds: 160,
  emergencyBeds: 65,
};

export const MOCK_CLINICAL_ANALYTICS = {
  averageWaitTime: 16.8, // in minutes
  occupancyTrend: [
    { name: "Jan", occupancy: 68 },
    { name: "Feb", occupancy: 72 },
    { name: "Mar", occupancy: 76 },
    { name: "Apr", occupancy: 74 },
    { name: "May", occupancy: 80 },
    { name: "Jun", occupancy: 85 },
  ],
  departmentPerformance: [
    { name: "Cardiology", appointments: 520, rating: 4.8 },
    { name: "Neurology", appointments: 380, rating: 4.7 },
    { name: "Orthopedics", appointments: 340, rating: 4.6 },
    { name: "Radiology", appointments: 260, rating: 4.5 },
    { name: "Emergency & ICU", appointments: 680, rating: 4.9 },
    { name: "Pediatrics", appointments: 290, rating: 4.6 },
  ],
  hospitalDistribution: [
    { name: "MediPlus Hospital", beds: 500, occupied: 420, icuBeds: 80, emergencyBeds: 30 },
    { name: "Vivek Memorial Hospital", beds: 350, occupied: 290, icuBeds: 50, emergencyBeds: 20 },
    { name: "R K Hospital", beds: 250, occupied: 180, icuBeds: 30, emergencyBeds: 15 },
  ],
};

export const MOCK_WARDS: Ward[] = [
  { id: "w-1", name: "Central ICU", type: "ICU", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 50, occupiedBeds: 45, status: "Active", createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-06-25T10:00:00Z" },
  { id: "w-2", name: "Cardiac HDU", type: "HDU", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 30, occupiedBeds: 28, status: "Active", createdAt: "2026-01-15T09:00:00Z", updatedAt: "2026-06-20T11:30:00Z" },
  { id: "w-3", name: "General Medicine Ward A", type: "General Ward", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 200, occupiedBeds: 180, status: "Active", createdAt: "2026-01-20T10:00:00Z", updatedAt: "2026-07-01T14:00:00Z" },
  { id: "w-4", name: "VIP Suite East", type: "Private Room", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 20, occupiedBeds: 15, status: "Active", createdAt: "2026-02-05T08:30:00Z", updatedAt: "2026-07-05T09:15:00Z" },
  { id: "w-5", name: "Infectious Disease Isolation", type: "Isolation Ward", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 15, occupiedBeds: 10, status: "Active", createdAt: "2026-02-10T11:00:00Z", updatedAt: "2026-07-10T16:45:00Z" },
  { id: "w-6", name: "Surgical ICU", type: "ICU", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 40, occupiedBeds: 35, status: "Active", createdAt: "2026-03-01T09:00:00Z", updatedAt: "2026-06-28T10:20:00Z" },
  { id: "w-7", name: "Pediatric HDU", type: "HDU", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 20, occupiedBeds: 18, status: "Active", createdAt: "2026-03-10T08:00:00Z", updatedAt: "2026-07-02T13:10:00Z" },
  { id: "w-8", name: "Orthopedics General", type: "General Ward", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 150, occupiedBeds: 120, status: "Active", createdAt: "2026-03-15T07:30:00Z", updatedAt: "2026-07-12T08:45:00Z" },
  { id: "w-9", name: "Maternity Private Suites", type: "Private Room", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 30, occupiedBeds: 25, status: "Active", createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-07-15T11:00:00Z" },
  { id: "w-10", name: "Emergency ICU", type: "ICU", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 25, occupiedBeds: 22, status: "Active", createdAt: "2026-05-01T08:00:00Z", updatedAt: "2026-07-18T09:30:00Z" },
  { id: "w-11", name: "Neurology HDU", type: "HDU", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 15, occupiedBeds: 10, status: "Active", createdAt: "2026-05-10T09:30:00Z", updatedAt: "2026-07-20T14:20:00Z" },
  { id: "w-12", name: "Surgery Recovery Ward", type: "General Ward", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 100, occupiedBeds: 85, status: "Active", createdAt: "2026-05-15T10:45:00Z", updatedAt: "2026-07-22T16:00:00Z" },
  { id: "w-13", name: "West Wing Renovation", type: "General Ward", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 50, occupiedBeds: 0, status: "Maintenance", createdAt: "2026-06-01T08:00:00Z", updatedAt: "2026-07-25T10:00:00Z" },
];
