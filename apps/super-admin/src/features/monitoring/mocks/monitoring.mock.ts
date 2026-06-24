import {
  MonitoringStats, ServiceHealth, ApiEndpointHealth, ApiHealthTrend,
  DatabaseHealth, QueueMetric, JobRecord, StorageMetric, StorageTrend,
  FileTypeDistribution, ErrorLog, UptimeMetric, UptimeTrend,
} from '../types/monitoring.types';

export const MOCK_MONITORING_STATS: MonitoringStats = {
  totalServices: 8,
  healthyServices: 6,
  criticalServices: 1,
  queueJobs: 142,
  storageUsedPercent: 62.4,
  avgResponseTimeMs: 145,
  errorCount: 23,
  uptimePercent: 99.87,
};

export const MOCK_SYSTEM_HEALTH: ServiceHealth[] = [
  { id: 'svc-1', service: 'API Gateway', status: 'healthy', responseTime: 42, version: 'v2.4.1', lastChecked: new Date().toISOString(), uptime: 99.98 },
  { id: 'svc-2', service: 'Auth Service', status: 'healthy', responseTime: 88, version: 'v1.8.3', lastChecked: new Date().toISOString(), uptime: 99.95 },
  { id: 'svc-3', service: 'Notification Service', status: 'warning', responseTime: 410, version: 'v1.2.0', lastChecked: new Date().toISOString(), uptime: 98.80 },
  { id: 'svc-4', service: 'Billing Service', status: 'healthy', responseTime: 130, version: 'v3.1.2', lastChecked: new Date().toISOString(), uptime: 99.90 },
  { id: 'svc-5', service: 'Analytics Service', status: 'critical', responseTime: 2800, version: 'v2.0.0', lastChecked: new Date().toISOString(), uptime: 94.20 },
  { id: 'svc-6', service: 'Queue Worker', status: 'healthy', responseTime: 65, version: 'v1.5.0', lastChecked: new Date().toISOString(), uptime: 99.92 },
  { id: 'svc-7', service: 'Storage Service', status: 'healthy', responseTime: 55, version: 'v2.2.0', lastChecked: new Date().toISOString(), uptime: 100.00 },
  { id: 'svc-8', service: 'FHIR Gateway', status: 'healthy', responseTime: 210, version: 'v1.0.4', lastChecked: new Date().toISOString(), uptime: 99.70 },
];

export const MOCK_API_ENDPOINTS: ApiEndpointHealth[] = [
  { id: 'api-1', endpoint: '/auth', method: 'POST', avgLatencyMs: 88, p95LatencyMs: 145, requestsPerMinute: 340, errorRate: 0.2, successRate: 99.8, status: 'healthy' },
  { id: 'api-2', endpoint: '/tenants', method: 'GET', avgLatencyMs: 65, p95LatencyMs: 110, requestsPerMinute: 120, errorRate: 0.0, successRate: 100.0, status: 'healthy' },
  { id: 'api-3', endpoint: '/hospitals', method: 'GET', avgLatencyMs: 92, p95LatencyMs: 180, requestsPerMinute: 200, errorRate: 0.5, successRate: 99.5, status: 'healthy' },
  { id: 'api-4', endpoint: '/users', method: 'GET', avgLatencyMs: 110, p95LatencyMs: 220, requestsPerMinute: 180, errorRate: 1.2, successRate: 98.8, status: 'warning' },
  { id: 'api-5', endpoint: '/doctors', method: 'GET', avgLatencyMs: 142, p95LatencyMs: 310, requestsPerMinute: 95, errorRate: 0.8, successRate: 99.2, status: 'healthy' },
  { id: 'api-6', endpoint: '/patients', method: 'GET', avgLatencyMs: 185, p95LatencyMs: 480, requestsPerMinute: 75, errorRate: 3.5, successRate: 96.5, status: 'critical' },
];

export const MOCK_API_TREND: ApiHealthTrend[] = [
  { time: '07:00', avgLatency: 95, requests: 280, errors: 2 },
  { time: '08:00', avgLatency: 110, requests: 420, errors: 4 },
  { time: '09:00', avgLatency: 130, requests: 580, errors: 8 },
  { time: '10:00', avgLatency: 145, requests: 620, errors: 6 },
  { time: '11:00', avgLatency: 155, requests: 710, errors: 10 },
  { time: '12:00', avgLatency: 140, requests: 680, errors: 7 },
  { time: '13:00', avgLatency: 125, requests: 590, errors: 5 },
];

export const MOCK_DB_HEALTH: DatabaseHealth[] = [
  { id: 'db-1', name: 'PostgreSQL (Primary)', type: 'postgres', status: 'healthy', connections: 42, maxConnections: 100, queriesPerSecond: 280, activeSessions: 18, storageUsedGB: 48.2, storageLimitGB: 200, cpuUsage: 34, memoryUsage: 52, lastChecked: new Date().toISOString() },
  { id: 'db-2', name: 'Redis (Cache)', type: 'redis', status: 'healthy', connections: 24, maxConnections: 50, queriesPerSecond: 1200, activeSessions: 24, storageUsedGB: 4.1, storageLimitGB: 20, cpuUsage: 12, memoryUsage: 28, lastChecked: new Date().toISOString() },
  { id: 'db-3', name: 'PostgreSQL (Replica)', type: 'postgres', status: 'warning', connections: 38, maxConnections: 50, queriesPerSecond: 95, activeSessions: 12, storageUsedGB: 47.8, storageLimitGB: 200, cpuUsage: 68, memoryUsage: 75, lastChecked: new Date().toISOString() },
];

export const MOCK_QUEUES: QueueMetric[] = [
  { id: 'q-1', name: 'Email Queue', type: 'emails', waiting: 12, active: 4, completed: 8420, failed: 3, delayed: 0, status: 'healthy' },
  { id: 'q-2', name: 'Notification Queue', type: 'notifications', waiting: 45, active: 8, completed: 12800, failed: 12, delayed: 5, status: 'warning' },
  { id: 'q-3', name: 'Invoice Queue', type: 'invoices', waiting: 3, active: 1, completed: 2140, failed: 0, delayed: 0, status: 'healthy' },
  { id: 'q-4', name: 'Report Queue', type: 'reports', waiting: 8, active: 2, completed: 980, failed: 5, delayed: 3, status: 'healthy' },
  { id: 'q-5', name: 'Claims Queue', type: 'claims', waiting: 74, active: 0, completed: 3200, failed: 28, delayed: 12, status: 'critical' },
];

export const MOCK_JOBS: JobRecord[] = [
  { id: 'job-1', jobId: 'job-9c4f3a12', type: 'SendEmail', queue: 'emails', status: 'completed', startedAt: '2026-06-23T06:55:00Z', finishedAt: '2026-06-23T06:55:02Z', retries: 0 },
  { id: 'job-2', jobId: 'job-7e1b2d89', type: 'GenerateInvoice', queue: 'invoices', status: 'active', startedAt: '2026-06-23T07:09:00Z', retries: 0 },
  { id: 'job-3', jobId: 'job-2a8c5f41', type: 'ProcessClaim', queue: 'claims', status: 'failed', startedAt: '2026-06-23T06:30:00Z', finishedAt: '2026-06-23T06:30:45Z', retries: 3, error: 'Insurance API timeout after 30s' },
  { id: 'job-4', jobId: 'job-5d7e1c03', type: 'SendNotification', queue: 'notifications', status: 'waiting', retries: 0 },
  { id: 'job-5', jobId: 'job-8f3b6a90', type: 'GenerateReport', queue: 'reports', status: 'delayed', retries: 1 },
  { id: 'job-6', jobId: 'job-1c9d2e78', type: 'ProcessClaim', queue: 'claims', status: 'failed', startedAt: '2026-06-23T05:00:00Z', finishedAt: '2026-06-23T05:01:00Z', retries: 5, error: 'Max retries exceeded' },
];

export const MOCK_STORAGE_METRIC: StorageMetric = {
  totalGB: 500,
  usedGB: 312.4,
  imagesGB: 128.4,
  documentsGB: 140.2,
  backupsGB: 43.8,
  usagePercent: 62.4,
  status: 'healthy',
};

export const MOCK_STORAGE_TREND: StorageTrend[] = [
  { date: 'Jun 17', usedGB: 285 },
  { date: 'Jun 18', usedGB: 290 },
  { date: 'Jun 19', usedGB: 296 },
  { date: 'Jun 20', usedGB: 302 },
  { date: 'Jun 21', usedGB: 305 },
  { date: 'Jun 22', usedGB: 309 },
  { date: 'Jun 23', usedGB: 312.4 },
];

export const MOCK_FILE_TYPE_DISTRIBUTION: FileTypeDistribution[] = [
  { type: 'Documents', sizeGB: 140.2 },
  { type: 'Images', sizeGB: 128.4 },
  { type: 'Backups', sizeGB: 43.8 },
];

export const MOCK_ERRORS: ErrorLog[] = [
  { id: 'err-1', service: 'Analytics Service', severity: 'critical', message: 'Unhandled exception in /analytics/aggregate endpoint', occurrences: 14, createdAt: '2026-06-23T06:45:00Z', status: 'open' },
  { id: 'err-2', service: 'Claims Queue', severity: 'error', message: 'Insurance API timeout after 30s — provider: BlueCross', occurrences: 28, createdAt: '2026-06-23T05:30:00Z', status: 'open' },
  { id: 'err-3', service: 'Notification Service', severity: 'warning', message: 'High queue latency detected (>400ms avg)', occurrences: 8, createdAt: '2026-06-23T04:00:00Z', status: 'open' },
  { id: 'err-4', service: 'Auth Service', severity: 'warning', message: 'Elevated login failure rate — possible brute force', occurrences: 3, createdAt: '2026-06-22T22:00:00Z', status: 'ignored' },
  { id: 'err-5', service: 'Billing Service', severity: 'error', message: 'Stripe webhook signature verification failed', occurrences: 2, createdAt: '2026-06-22T18:00:00Z', status: 'resolved' },
  { id: 'err-6', service: 'FHIR Gateway', severity: 'info', message: 'FHIR R4 endpoint response degraded > 200ms', occurrences: 5, createdAt: '2026-06-22T16:00:00Z', status: 'open' },
];

export const MOCK_UPTIME_METRICS: UptimeMetric[] = [
  { period: '24 Hours', uptimePercent: 100.0, downtimeMinutes: 0, incidents: 0 },
  { period: '7 Days', uptimePercent: 99.87, downtimeMinutes: 13, incidents: 1 },
  { period: '30 Days', uptimePercent: 99.62, downtimeMinutes: 165, incidents: 3 },
  { period: '90 Days', uptimePercent: 99.51, downtimeMinutes: 392, incidents: 5 },
];

export const MOCK_UPTIME_TREND: UptimeTrend[] = [
  { date: 'Jun 17', uptime: 100.0, responseTime: 122 },
  { date: 'Jun 18', uptime: 100.0, responseTime: 130 },
  { date: 'Jun 19', uptime: 99.3, responseTime: 148 },
  { date: 'Jun 20', uptime: 100.0, responseTime: 135 },
  { date: 'Jun 21', uptime: 100.0, responseTime: 128 },
  { date: 'Jun 22', uptime: 100.0, responseTime: 142 },
  { date: 'Jun 23', uptime: 100.0, responseTime: 145 },
];
