import { Activity } from "../types/dashboard.types";

export const MOCK_ACTIVITIES: Activity[] = [
  { id: "act-1", type: "Tenant Created", message: "Client tenant 'CareFirst Clinics' onboarded.", createdAt: "10m ago" },
  { id: "act-2", type: "Hospital Added", message: "Hospital 'Manipal Goa' added under Manipal Group.", createdAt: "45m ago" },
  { id: "act-3", type: "Doctor Registered", message: "Dr. Sarah Jenkins registered to Neurology, Apollo Delhi.", createdAt: "2h ago" },
  { id: "act-4", type: "Invoice Generated", message: "Invoice INV-2026-089 generated for Apollo Mumbai.", createdAt: "5h ago" },
  { id: "act-5", type: "Role Updated", message: "Role 'Clinical Auditor' permissions updated.", createdAt: "1d ago" },
];
