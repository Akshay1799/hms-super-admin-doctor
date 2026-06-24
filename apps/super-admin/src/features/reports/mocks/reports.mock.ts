import {
  ReportDashboardStats, ScheduledReport, ExportHistory,
  TenantReport, HospitalReport
} from '../types/reports.types';

export const MOCK_REPORT_STATS: ReportDashboardStats = {
  totalReports: 142,
  scheduledReports: 28,
  exportsToday: 415,
  revenueReports: 18,
  operationalReports: 45,
  complianceReports: 12,
  customReports: 36,
};

export const MOCK_SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'sr-1', name: 'Monthly Revenue Summary', frequency: 'monthly', status: 'active', nextRun: '2026-07-01T00:00:00Z', recipients: ['finance@hms.com'] },
  { id: 'sr-2', name: 'Weekly Occupancy Report', frequency: 'weekly', status: 'active', nextRun: '2026-06-29T00:00:00Z', recipients: ['operations@hms.com', 'admin@hms.com'] },
  { id: 'sr-3', name: 'Daily Claims Sync', frequency: 'daily', status: 'active', nextRun: '2026-06-24T00:00:00Z', recipients: ['billing@hms.com'] },
  { id: 'sr-4', name: 'HIPAA Compliance Audit', frequency: 'quarterly', status: 'active', nextRun: '2026-09-01T00:00:00Z', recipients: ['compliance@hms.com'] },
  { id: 'sr-5', name: 'Custom User Activity', frequency: 'weekly', status: 'failed', nextRun: '2026-06-29T00:00:00Z', recipients: ['security@hms.com'] },
];

export const MOCK_EXPORT_HISTORY: ExportHistory[] = [
  { id: 'exp-1', reportName: 'Q2 Revenue Breakdown', format: 'excel', status: 'completed', requestedBy: 'finance_admin', createdAt: '2026-06-23T09:15:00Z' },
  { id: 'exp-2', reportName: 'Patient Roster - Branch A', format: 'csv', status: 'completed', requestedBy: 'dr.smith', createdAt: '2026-06-23T08:30:00Z' },
  { id: 'exp-3', reportName: 'Audit Logs (Last 30 Days)', format: 'pdf', status: 'processing', requestedBy: 'sec_admin', createdAt: '2026-06-23T10:00:00Z' },
  { id: 'exp-4', reportName: 'Inventory Shortages', format: 'excel', status: 'failed', requestedBy: 'operations', createdAt: '2026-06-22T14:45:00Z' },
  { id: 'exp-5', reportName: 'Weekly Appointments', format: 'pdf', status: 'completed', requestedBy: 'frontdesk', createdAt: '2026-06-22T08:00:00Z' },
];

export const MOCK_TENANT_REPORTS: TenantReport[] = [
  { id: 'tr-1', tenant: 'Global Health', plan: 'Enterprise', hospitals: 45, users: 4500, revenue: 1250000, status: 'Active' },
  { id: 'tr-2', tenant: 'City Care Clinics', plan: 'Professional', hospitals: 12, users: 850, revenue: 320000, status: 'Active' },
  { id: 'tr-3', tenant: 'Sunrise Medical', plan: 'Startup', hospitals: 2, users: 45, revenue: 25000, status: 'Suspended' },
  { id: 'tr-4', tenant: 'CarePlus Network', plan: 'Enterprise', hospitals: 18, users: 2100, revenue: 840000, status: 'Active' },
];

export const MOCK_HOSPITAL_REPORTS: HospitalReport[] = [
  { id: 'hr-1', hospital: 'Global Health Central', doctors: 245, patients: 12400, revenue: 450000, status: 'Active' },
  { id: 'hr-2', hospital: 'Global Health North', doctors: 120, patients: 8200, revenue: 280000, status: 'Active' },
  { id: 'hr-3', hospital: 'City Care Downtown', doctors: 45, patients: 3100, revenue: 115000, status: 'Active' },
];

export const MOCK_REVENUE_TREND = [
  { date: 'Jan', revenue: 1200000, collections: 1100000 },
  { date: 'Feb', revenue: 1350000, collections: 1250000 },
  { date: 'Mar', revenue: 1420000, collections: 1380000 },
  { date: 'Apr', revenue: 1550000, collections: 1500000 },
  { date: 'May', revenue: 1680000, collections: 1600000 },
  { date: 'Jun', revenue: 1800000, collections: 1750000 },
];
