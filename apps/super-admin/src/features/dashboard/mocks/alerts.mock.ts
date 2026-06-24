import { Alert } from "../types/dashboard.types";

export const MOCK_ALERTS: Alert[] = [
  { id: "al-1", severity: "critical", title: "Storage Space High Warning", description: "Server node E-Delhi-Storage exceeds 92% capacity threshold.", createdAt: "8m ago" },
  { id: "al-2", severity: "warning", title: "Tenant License Expiring Soon", description: "Sutter Regional Labs subscription terminates in 4 days.", createdAt: "1h ago" },
  { id: "al-3", severity: "critical", title: "Payment Processing Failure", description: "Stripe webhook failed to resolve Apollo Delhi invoice.", createdAt: "3h ago" },
  { id: "al-4", severity: "info", title: "Cron archiving Schedule Completed", description: "System logs archiving successfully compiled.", createdAt: "6h ago" },
];
