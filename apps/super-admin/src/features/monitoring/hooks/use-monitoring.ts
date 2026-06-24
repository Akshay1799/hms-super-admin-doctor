import { useQuery } from '@tanstack/react-query';
import { monitoringService } from '../services/monitoring.service';

export const useMonitoringStats = () =>
  useQuery({ queryKey: ['monitoring'], queryFn: monitoringService.getMonitoringStats });

export const useSystemHealth = () =>
  useQuery({ queryKey: ['system-health'], queryFn: monitoringService.getSystemHealth });

export const useApiEndpoints = () =>
  useQuery({ queryKey: ['api-health'], queryFn: monitoringService.getApiEndpoints });

export const useApiTrend = () =>
  useQuery({ queryKey: ['api-health', 'trend'], queryFn: monitoringService.getApiTrend });

export const useDatabaseHealth = () =>
  useQuery({ queryKey: ['database-health'], queryFn: monitoringService.getDatabaseHealth });

export const useQueues = () =>
  useQuery({ queryKey: ['queue-monitor'], queryFn: monitoringService.getQueues });

export const useJobs = () =>
  useQuery({ queryKey: ['job-monitor'], queryFn: monitoringService.getJobs });

export const useStorageMetric = () =>
  useQuery({ queryKey: ['storage-monitor'], queryFn: monitoringService.getStorageMetric });

export const useStorageTrend = () =>
  useQuery({ queryKey: ['storage-monitor', 'trend'], queryFn: monitoringService.getStorageTrend });

export const useFileDistribution = () =>
  useQuery({ queryKey: ['storage-monitor', 'distribution'], queryFn: monitoringService.getFileDistribution });

export const useErrors = () =>
  useQuery({ queryKey: ['error-tracker'], queryFn: monitoringService.getErrors });

export const useUptimeMetrics = () =>
  useQuery({ queryKey: ['uptime'], queryFn: monitoringService.getUptimeMetrics });

export const useUptimeTrend = () =>
  useQuery({ queryKey: ['uptime', 'trend'], queryFn: monitoringService.getUptimeTrend });
