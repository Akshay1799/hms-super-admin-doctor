import {
  MOCK_REPORT_STATS, MOCK_SCHEDULED_REPORTS, MOCK_EXPORT_HISTORY,
  MOCK_TENANT_REPORTS, MOCK_HOSPITAL_REPORTS, MOCK_REVENUE_TREND
} from '../mocks/reports.mock';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const reportsService = {
  getReportStats: async () => {  return MOCK_REPORT_STATS; },
  getScheduledReports: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_scheduled_reports");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_scheduled_reports", JSON.stringify(MOCK_SCHEDULED_REPORTS));
    }
    return MOCK_SCHEDULED_REPORTS;
  },
  saveScheduledReports: async (data: any[]) => {
    await delay(100);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_scheduled_reports", JSON.stringify(data));
    }
    return data;
  },
  getExportHistory: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_export_history");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_export_history", JSON.stringify(MOCK_EXPORT_HISTORY));
    }
    return MOCK_EXPORT_HISTORY;
  },
  saveExportHistory: async (data: any[]) => {
    await delay(100);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_export_history", JSON.stringify(data));
    }
    return data;
  },
  getTenantReports: async () => {  return MOCK_TENANT_REPORTS; },
  getHospitalReports: async () => {  return MOCK_HOSPITAL_REPORTS; },
  getRevenueTrend: async () => {  return MOCK_REVENUE_TREND; },
};
