import { Doctor, Patient, Appointment, Nurse, Staff, Admission, BedOccupancy } from "../types/clinical.types";

export const MOCK_DOCTORS: Doctor[] = [
  { id: "doc-1", name: "Dr. Gregory House", specialization: "Diagnostics / Nephrology", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-1", experience: 22, rating: 4.8, status: "Active", patientsCount: 480, consultationTime: 25, successRate: 94 },
  { id: "doc-2", name: "Dr. John Watson", specialization: "General Medicine", hospitalId: "h-1", branchId: "b-2", departmentId: "dep-6", experience: 14, rating: 4.5, status: "Active", patientsCount: 320, consultationTime: 15, successRate: 88 },
  { id: "doc-3", name: "Dr. Stephen Strange", specialization: "Neurosurgery", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-2", experience: 18, rating: 4.9, status: "Inactive", patientsCount: 150, consultationTime: 40, successRate: 98 },
  { id: "doc-4", name: "Dr. Hannibal Lecter", specialization: "Psychiatry", hospitalId: "h-2", branchId: "b-4", departmentId: "dep-10", experience: 25, rating: 4.7, status: "Active", patientsCount: 220, consultationTime: 50, successRate: 91 },
  { id: "doc-5", name: "Dr. Meredith Grey", specialization: "General Surgery", hospitalId: "h-5", branchId: "b-8", departmentId: "dep-1", experience: 12, rating: 4.6, status: "On Leave", patientsCount: 280, consultationTime: 20, successRate: 89 },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: "pat-1", name: "John Doe", gender: "Male", age: 45, hospitalId: "h-1", doctorId: "doc-1", status: "Active", lastVisit: "2026-06-10", bloodGroup: "O+" },
  { id: "pat-2", name: "Jane Doe", gender: "Female", age: 38, hospitalId: "h-1", doctorId: "doc-1", status: "Active", lastVisit: "2026-06-12", bloodGroup: "A-" },
  { id: "pat-3", name: "Bob Smith", gender: "Male", age: 60, hospitalId: "h-1", doctorId: "doc-2", status: "Inactive", lastVisit: "2026-05-20", bloodGroup: "B+" },
  { id: "pat-4", name: "Alice Johnson", gender: "Female", age: 29, hospitalId: "h-2", doctorId: "doc-4", status: "Active", lastVisit: "2026-06-20", bloodGroup: "AB+" },
  { id: "pat-5", name: "Bruce Wayne", gender: "Male", age: 35, hospitalId: "h-5", doctorId: "doc-5", status: "Active", lastVisit: "2026-06-15", bloodGroup: "O-" },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", doctorId: "doc-1", doctorName: "Dr. Gregory House", patientId: "pat-1", patientName: "John Doe", hospitalId: "h-1", hospitalName: "Apollo Main Hospital", date: "2026-06-23", timeSlot: "09:00 - 09:30", status: "Completed" },
  { id: "apt-2", doctorId: "doc-1", doctorName: "Dr. Gregory House", patientId: "pat-2", patientName: "Jane Doe", hospitalId: "h-1", hospitalName: "Apollo Main Hospital", date: "2026-06-23", timeSlot: "10:00 - 10:30", status: "Pending" },
  { id: "apt-3", doctorId: "doc-2", doctorName: "Dr. John Watson", patientId: "pat-3", patientName: "Bob Smith", hospitalId: "h-1", hospitalName: "Apollo Main Hospital", date: "2026-06-24", timeSlot: "11:00 - 11:30", status: "Rescheduled" },
  { id: "apt-4", doctorId: "doc-4", doctorName: "Dr. Hannibal Lecter", patientId: "pat-4", patientName: "Alice Johnson", hospitalId: "h-2", hospitalName: "Apollo Cardiac Clinic", date: "2026-06-23", timeSlot: "15:00 - 15:50", status: "Pending" },
  { id: "apt-5", doctorId: "doc-5", doctorName: "Dr. Meredith Grey", patientId: "pat-5", patientName: "Bruce Wayne", hospitalId: "h-5", hospitalName: "Max Medical Solutions", date: "2026-06-22", timeSlot: "14:00 - 14:30", status: "Cancelled" },
];

export const MOCK_NURSES: Nurse[] = [
  { id: "nur-1", name: "Nurse Joy", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-5", shift: "Morning", status: "Active" },
  { id: "nur-2", name: "Nurse Florence", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-1", shift: "Evening", status: "Active" },
  { id: "nur-3", name: "Nurse Ratched", hospitalId: "h-2", branchId: "b-4", departmentId: "dep-10", shift: "Night", status: "Active" },
];

export const MOCK_STAFF: Staff[] = [
  { id: "st-1", name: "Pam Beesly", type: "Receptionist", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-5", status: "Active" },
  { id: "st-2", name: "Angela Martin", type: "Billing Staff", hospitalId: "h-1", branchId: "b-1", departmentId: "dep-5", status: "Active" },
  { id: "st-3", name: "Oscar Martinez", type: "Admin Staff", hospitalId: "h-2", branchId: "b-4", departmentId: "dep-10", status: "Active" },
  { id: "st-4", name: "Sherlock Holmes", type: "Lab Technician", hospitalId: "h-5", branchId: "b-8", departmentId: "dep-12", status: "Active" },
];

export const MOCK_ADMISSIONS: Admission[] = [
  { id: "adm-1", patientId: "pat-1", patientName: "John Doe", hospitalId: "h-1", hospitalName: "Apollo Main Hospital", type: "IPD", status: "Admitted", admissionDate: "2026-06-18" },
  { id: "adm-2", patientId: "pat-2", patientName: "Jane Doe", hospitalId: "h-1", hospitalName: "Apollo Main Hospital", type: "Emergency", status: "Admitted", admissionDate: "2026-06-22" },
  { id: "adm-3", patientId: "pat-3", patientName: "Bob Smith", hospitalId: "h-1", hospitalName: "Apollo Main Hospital", type: "OPD", status: "Discharged", admissionDate: "2026-05-20", dischargeDate: "2026-05-21" },
];

export const MOCK_BED_OCCUPANCY: BedOccupancy = {
  totalBeds: 910, // Cumulative (h-1: 250 + h-2: 50 + h-3: 0 + h-4: 10 + h-5: 600)
  occupiedBeds: 717,
  availableBeds: 193,
  icuBeds: 155,
  emergencyBeds: 15,
};

export const MOCK_CLINICAL_ANALYTICS = {
  averageWaitTime: 18.5, // in minutes
  occupancyTrend: [
    { name: "Jan", occupancy: 65 },
    { name: "Feb", occupancy: 70 },
    { name: "Mar", occupancy: 75 },
    { name: "Apr", occupancy: 72 },
    { name: "May", occupancy: 78 },
    { name: "Jun", occupancy: 82 },
  ],
  departmentPerformance: [
    { name: "Cardiology", appointments: 420, rating: 4.8 },
    { name: "Neurology", appointments: 310, rating: 4.6 },
    { name: "Orthopedics", appointments: 280, rating: 4.5 },
    { name: "Radiology", appointments: 190, rating: 4.4 },
    { name: "Emergency", appointments: 540, rating: 4.7 },
  ],
  hospitalDistribution: [
    { name: "Apollo Main", beds: 250, occupied: 190 },
    { name: "Apollo Cardiac", beds: 50, occupied: 35 },
    { name: "Sutter Regional", beds: 10, occupied: 6 },
    { name: "Max Medical", beds: 600, occupied: 480 },
  ],
};
