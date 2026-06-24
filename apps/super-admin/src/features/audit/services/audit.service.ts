import {
  MOCK_AUDIT_STATS, MOCK_COMPLIANCE_STATS, MOCK_AUDIT_LOGS,
  MOCK_SECURITY_EVENTS, MOCK_ACCESS_HISTORY, MOCK_DATA_ACCESS,
  MOCK_ACTIVITY_TIMELINE
} from '../mocks/audit.mock';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const auditService = {
  getAuditStats: async () => {  return MOCK_AUDIT_STATS; },
  getComplianceStats: async () => {  return MOCK_COMPLIANCE_STATS; },
  getAuditLogs: async () => {  return MOCK_AUDIT_LOGS; },
  getSecurityEvents: async () => {  return MOCK_SECURITY_EVENTS; },
  getAccessHistory: async () => {  return MOCK_ACCESS_HISTORY; },
  getDataAccess: async () => {  return MOCK_DATA_ACCESS; },
  getActivityTimeline: async () => {  return MOCK_ACTIVITY_TIMELINE; },
};
