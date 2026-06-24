export type AuditSeverity = "info" | "warning" | "error" | "critical";
export type AuditStatus = "success" | "failed" | "blocked";

export interface AuditLog {
  id: string;
  module: string;
  action: string;
  entity: string;
  user: string;
  severity: AuditSeverity;
  status: AuditStatus;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: AuditSeverity;
  user: string;
  ipAddress: string;
  createdAt: string;
  status: AuditStatus;
}

export interface DataAccess {
  id: string;
  module: string;
  entity: string;
  action: string;
  user: string;
  reason: string;
  createdAt: string;
}

export interface AccessHistory {
  id: string;
  user: string;
  role: string;
  ipAddress: string;
  browser: string;
  os: string;
  country: string;
  loginTime: string;
  logoutTime?: string;
  status: AuditStatus;
}

export interface ActivityEvent {
  id: string;
  action: string;
  user: string;
  description: string;
  timestamp: string;
}

export interface ComplianceStats {
  hipaaEvents: number;
  phiAccess: number;
  exportEvents: number;
  sensitiveOperations: number;
  securityViolations: number;
  retentionCompliance: number;
}

export interface AuditDashboardStats {
  totalEvents: number;
  securityEvents: number;
  failedLogins: number;
  dataAccessEvents: number;
  permissionChanges: number;
  roleChanges: number;
  exports: number;
  complianceViolations: number;
}
