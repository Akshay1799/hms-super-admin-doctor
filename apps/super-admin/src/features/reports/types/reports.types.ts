export type ReportCategory = "financial" | "operational" | "clinical" | "user_management" | "compliance" | "audit" | "custom";
export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type ExportFormat = "pdf" | "excel" | "csv";
export type ReportStatus = "active" | "inactive" | "failed" | "completed" | "processing";

export interface Report {
  id: string;
  name: string;
  category: ReportCategory;
  type: string;
  createdAt: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ReportFrequency;
  status: ReportStatus;
  nextRun: string;
  recipients: string[];
}

export interface ExportHistory {
  id: string;
  reportName: string;
  format: ExportFormat;
  status: ReportStatus;
  requestedBy: string;
  createdAt: string;
}

export interface ReportDashboardStats {
  totalReports: number;
  scheduledReports: number;
  exportsToday: number;
  revenueReports: number;
  operationalReports: number;
  complianceReports: number;
  customReports: number;
}

export interface TenantReport {
  id: string;
  tenant: string;
  plan: string;
  hospitals: number;
  users: number;
  revenue: number;
  status: string;
}

export interface HospitalReport {
  id: string;
  hospital: string;
  doctors: number;
  patients: number;
  revenue: number;
  status: string;
}
