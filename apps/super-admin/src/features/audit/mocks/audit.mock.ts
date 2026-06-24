import {
  AuditLog, SecurityEvent, DataAccess, AccessHistory,
  ActivityEvent, ComplianceStats, AuditDashboardStats
} from '../types/audit.types';

export const MOCK_AUDIT_STATS: AuditDashboardStats = {
  totalEvents: 124890,
  securityEvents: 412,
  failedLogins: 128,
  dataAccessEvents: 45200,
  permissionChanges: 45,
  roleChanges: 12,
  exports: 320,
  complianceViolations: 3,
};

export const MOCK_COMPLIANCE_STATS: ComplianceStats = {
  hipaaEvents: 8520,
  phiAccess: 45200,
  exportEvents: 320,
  sensitiveOperations: 840,
  securityViolations: 3,
  retentionCompliance: 99.9,
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'aud-1', module: 'Authentication', action: 'Login', entity: 'Session', user: 'admin@hms.com', severity: 'info', status: 'success', createdAt: '2026-06-23T09:15:00Z' },
  { id: 'aud-2', module: 'User Management', action: 'Create User', entity: 'Doctor', user: 'admin@hms.com', severity: 'info', status: 'success', createdAt: '2026-06-23T08:45:00Z' },
  { id: 'aud-3', module: 'Settings', action: 'Change Permission', entity: 'Role', user: 'superadmin@hms.com', severity: 'warning', status: 'success', createdAt: '2026-06-23T08:30:00Z' },
  { id: 'aud-4', module: 'Billing', action: 'Delete Invoice', entity: 'Invoice', user: 'finance@hms.com', severity: 'error', status: 'failed', createdAt: '2026-06-23T08:15:00Z' },
  { id: 'aud-5', module: 'Authentication', action: 'Login', entity: 'Session', user: 'unknown@hms.com', severity: 'critical', status: 'blocked', createdAt: '2026-06-23T08:00:00Z' },
  { id: 'aud-6', module: 'Patient Access', action: 'View Record', entity: 'Medical History', user: 'dr.smith@hms.com', severity: 'info', status: 'success', createdAt: '2026-06-23T07:45:00Z' },
];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'sec-1', type: 'Failed Login', severity: 'warning', user: 'dr.jones@hms.com', ipAddress: '192.168.1.45', createdAt: '2026-06-23T09:00:00Z', status: 'failed' },
  { id: 'sec-2', type: 'Account Locked', severity: 'error', user: 'finance_temp@hms.com', ipAddress: '45.22.11.9', createdAt: '2026-06-23T08:20:00Z', status: 'blocked' },
  { id: 'sec-3', type: 'Role Escalation', severity: 'critical', user: 'admin@hms.com', ipAddress: '10.0.0.15', createdAt: '2026-06-22T14:30:00Z', status: 'success' },
  { id: 'sec-4', type: 'MFA Disabled', severity: 'critical', user: 'nurse.station1@hms.com', ipAddress: '192.168.2.11', createdAt: '2026-06-21T11:15:00Z', status: 'success' },
  { id: 'sec-5', type: 'Session Terminated', severity: 'info', user: 'superadmin@hms.com', ipAddress: '10.0.0.5', createdAt: '2026-06-21T09:00:00Z', status: 'success' },
];

export const MOCK_ACCESS_HISTORY: AccessHistory[] = [
  { id: 'acc-1', user: 'admin@hms.com', role: 'Super Admin', ipAddress: '10.0.0.5', browser: 'Chrome 120', os: 'Windows 11', country: 'USA', loginTime: '2026-06-23T09:15:00Z', status: 'success' },
  { id: 'acc-2', user: 'dr.smith@hms.com', role: 'Doctor', ipAddress: '192.168.1.100', browser: 'Safari 17', os: 'macOS 14', country: 'UK', loginTime: '2026-06-23T08:00:00Z', logoutTime: '2026-06-23T12:00:00Z', status: 'success' },
  { id: 'acc-3', user: 'unknown', role: 'None', ipAddress: '45.22.11.9', browser: 'Firefox 121', os: 'Linux', country: 'Russia', loginTime: '2026-06-23T07:30:00Z', status: 'blocked' },
];

export const MOCK_DATA_ACCESS: DataAccess[] = [
  { id: 'da-1', module: 'Patient Records', entity: 'Patient: PR-9281', action: 'View', user: 'dr.smith@hms.com', reason: 'Routine Checkup', createdAt: '2026-06-23T09:10:00Z' },
  { id: 'da-2', module: 'Billing', entity: 'Invoice: INV-4492', action: 'Export', user: 'finance@hms.com', reason: 'End of month reconciliation', createdAt: '2026-06-23T08:45:00Z' },
  { id: 'da-3', module: 'Patient Records', entity: 'Patient: PR-1120', action: 'Update', user: 'nurse.sarah@hms.com', reason: 'Vitals Entry', createdAt: '2026-06-23T08:30:00Z' },
];

export const MOCK_ACTIVITY_TIMELINE: ActivityEvent[] = [
  { id: 'act-1', action: 'Login Attempt', user: 'admin@hms.com', description: 'Successful login from IP 10.0.0.5', timestamp: '2026-06-23T09:15:00Z' },
  { id: 'act-2', action: 'User Created', user: 'admin@hms.com', description: 'Created new Doctor account for Dr. Jones', timestamp: '2026-06-23T08:45:00Z' },
  { id: 'act-3', action: 'Permission Changed', user: 'superadmin@hms.com', description: 'Added "Manage Billing" permission to Finance Manager role', timestamp: '2026-06-23T08:30:00Z' },
  { id: 'act-4', action: 'Invoice Generated', user: 'System', description: 'Auto-generated invoice INV-4493 for Tenant ID: T-821', timestamp: '2026-06-23T08:00:00Z' },
  { id: 'act-5', action: 'Tenant Suspended', user: 'superadmin@hms.com', description: 'Suspended Tenant ID: T-105 due to billing failure', timestamp: '2026-06-22T15:00:00Z' },
];
