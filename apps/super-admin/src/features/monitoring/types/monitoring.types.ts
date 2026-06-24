export type HealthStatus = "healthy" | "warning" | "critical" | "offline";
export type JobStatus = "waiting" | "active" | "completed" | "failed" | "delayed";
export type ErrorSeverity = "info" | "warning" | "error" | "critical";
export type ErrorStatus = "open" | "resolved" | "ignored";

// --- Service Health ---
export interface ServiceHealth {
  id: string;
  service: string;
  status: HealthStatus;
  responseTime: number;
  version: string;
  lastChecked: string;
  uptime: number;
}

// --- API Health ---
export interface ApiEndpointHealth {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  avgLatencyMs: number;
  p95LatencyMs: number;
  requestsPerMinute: number;
  errorRate: number;
  successRate: number;
  status: HealthStatus;
}

export interface ApiHealthTrend {
  time: string;
  avgLatency: number;
  requests: number;
  errors: number;
}

// --- Database Health ---
export interface DatabaseHealth {
  id: string;
  name: string;
  type: "postgres" | "redis" | "mongo";
  status: HealthStatus;
  connections: number;
  maxConnections: number;
  queriesPerSecond: number;
  activeSessions: number;
  storageUsedGB: number;
  storageLimitGB: number;
  cpuUsage: number;
  memoryUsage: number;
  lastChecked: string;
}

// --- Queue Monitor ---
export interface QueueMetric {
  id: string;
  name: string;
  type: "emails" | "notifications" | "invoices" | "reports" | "claims";
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  status: HealthStatus;
}

// --- Job Monitor ---
export interface JobRecord {
  id: string;
  jobId: string;
  type: string;
  queue: string;
  status: JobStatus;
  startedAt?: string;
  finishedAt?: string;
  retries: number;
  payload?: string;
  error?: string;
}

// --- Storage Monitor ---
export interface StorageMetric {
  totalGB: number;
  usedGB: number;
  imagesGB: number;
  documentsGB: number;
  backupsGB: number;
  usagePercent: number;
  status: HealthStatus;
}

export interface StorageTrend {
  date: string;
  usedGB: number;
}

export interface FileTypeDistribution {
  type: string;
  sizeGB: number;
}

// --- Error Tracker ---
export interface ErrorLog {
  id: string;
  service: string;
  severity: ErrorSeverity;
  message: string;
  occurrences: number;
  createdAt: string;
  status: ErrorStatus;
  stackTrace?: string;
}

// --- Uptime ---
export interface UptimeMetric {
  period: string;
  uptimePercent: number;
  downtimeMinutes: number;
  incidents: number;
}

export interface UptimeTrend {
  date: string;
  uptime: number;
  responseTime: number;
}

// --- Monitoring Dashboard ---
export interface MonitoringStats {
  totalServices: number;
  healthyServices: number;
  criticalServices: number;
  queueJobs: number;
  storageUsedPercent: number;
  avgResponseTimeMs: number;
  errorCount: number;
  uptimePercent: number;
}
