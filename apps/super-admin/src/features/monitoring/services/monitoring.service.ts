import {
  MOCK_MONITORING_STATS, MOCK_SYSTEM_HEALTH, MOCK_API_ENDPOINTS, MOCK_API_TREND,
  MOCK_DB_HEALTH, MOCK_QUEUES, MOCK_JOBS, MOCK_STORAGE_METRIC, MOCK_STORAGE_TREND,
  MOCK_FILE_TYPE_DISTRIBUTION, MOCK_ERRORS, MOCK_UPTIME_METRICS, MOCK_UPTIME_TREND,
} from '../mocks/monitoring.mock';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const monitoringService = {
  getMonitoringStats: async () => {  return MOCK_MONITORING_STATS; },
  getSystemHealth: async () => {  return MOCK_SYSTEM_HEALTH; },
  getApiEndpoints: async () => {  return MOCK_API_ENDPOINTS; },
  getApiTrend: async () => {  return MOCK_API_TREND; },
  getDatabaseHealth: async () => {  return MOCK_DB_HEALTH; },
  getQueues: async () => {  return MOCK_QUEUES; },
  getJobs: async () => {  return MOCK_JOBS; },
  getStorageMetric: async () => {  return MOCK_STORAGE_METRIC; },
  getStorageTrend: async () => {  return MOCK_STORAGE_TREND; },
  getFileDistribution: async () => {  return MOCK_FILE_TYPE_DISTRIBUTION; },
  getErrors: async () => {  return MOCK_ERRORS; },
  getUptimeMetrics: async () => {  return MOCK_UPTIME_METRICS; },
  getUptimeTrend: async () => {  return MOCK_UPTIME_TREND; },
};
