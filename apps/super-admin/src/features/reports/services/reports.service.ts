import {
  MOCK_REPORT_STATS, MOCK_SCHEDULED_REPORTS, MOCK_EXPORT_HISTORY,
  MOCK_TENANT_REPORTS, MOCK_HOSPITAL_REPORTS, MOCK_REVENUE_TREND
} from '../mocks/reports.mock';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const reportsService = {
  getReportStats: async () => {  return MOCK_REPORT_STATS; },
  getScheduledReports: async () => {  return MOCK_SCHEDULED_REPORTS; },
  getExportHistory: async () => {  return MOCK_EXPORT_HISTORY; },
  getTenantReports: async () => {  return MOCK_TENANT_REPORTS; },
  getHospitalReports: async () => {  return MOCK_HOSPITAL_REPORTS; },
  getRevenueTrend: async () => {  return MOCK_REVENUE_TREND; },
};
