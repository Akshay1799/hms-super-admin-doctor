import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';

export const useReportStats = () => useQuery({ queryKey: ['reports', 'stats'], queryFn: reportsService.getReportStats });
export const useScheduledReports = () => useQuery({ queryKey: ['reports', 'scheduled'], queryFn: reportsService.getScheduledReports });
export const useExportHistory = () => useQuery({ queryKey: ['reports', 'export-history'], queryFn: reportsService.getExportHistory });
export const useTenantReports = () => useQuery({ queryKey: ['reports', 'tenants'], queryFn: reportsService.getTenantReports });
export const useHospitalReports = () => useQuery({ queryKey: ['reports', 'hospitals'], queryFn: reportsService.getHospitalReports });
export const useRevenueTrend = () => useQuery({ queryKey: ['reports', 'revenue', 'trend'], queryFn: reportsService.getRevenueTrend });
