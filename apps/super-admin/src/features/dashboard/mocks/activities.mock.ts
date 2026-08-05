import { Activity } from "../types/dashboard.types";

export const MOCK_ACTIVITIES: Activity[] = [
  { id: "act-1", type: "Tenant Created", message: "Client tenant 'MediPlus Hospital Group' onboarded.", createdAt: "10m ago" },
  { id: "act-2", type: "Hospital Added", message: "Hospital 'Vivek Memorial Hospital' added under Vivek Memorial Group.", createdAt: "45m ago" },
  { id: "act-3", type: "Doctor Registered", message: "Dr. Rajesh Sharma registered to Cardiology, MediPlus Hospital.", createdAt: "2h ago" },
  { id: "act-4", type: "Invoice Generated", message: "Invoice INV-2026-089 generated for R K Hospital.", createdAt: "5h ago" },
  { id: "act-5", type: "Role Updated", message: "Role 'Clinical Auditor' permissions updated.", createdAt: "1d ago" },
];
