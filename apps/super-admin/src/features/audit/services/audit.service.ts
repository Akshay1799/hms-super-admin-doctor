import {
  MOCK_AUDIT_STATS, MOCK_COMPLIANCE_STATS, MOCK_AUDIT_LOGS,
  MOCK_SECURITY_EVENTS, MOCK_ACCESS_HISTORY, MOCK_DATA_ACCESS,
  MOCK_ACTIVITY_TIMELINE
} from '../mocks/audit.mock';
import { apiClient } from '@/lib/api-client';

export const auditService = {
  getAuditStats: async () => {
    try {
      const res = await apiClient.get('/audit/stats');
      if (res.data?.data) {
        return res.data.data;
      }
      throw new Error("empty");
    } catch (error) {
      return MOCK_AUDIT_STATS;
    }
  },
  
  getComplianceStats: async () => { return MOCK_COMPLIANCE_STATS; },
  
  getAuditLogs: async () => {
    try {
      const res = await apiClient.get('/audit');
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data.map((l: any) => ({
          id: l._id ?? l.id,
          module: l.module ?? "System",
          action: l.action ?? "Unknown",
          entity: l.entityType ?? l.entity ?? "Unknown",
          user: l.performedBy ?? l.user ?? "System",
          severity: l.severity ?? "info",
          status: l.status ?? "success",
          createdAt: l.createdAt ?? l.timestamp
        }));
      }
      throw new Error("empty");
    } catch (error) {
      return MOCK_AUDIT_LOGS;
    }
  },
  
  getSecurityEvents: async () => { return MOCK_SECURITY_EVENTS; },
  getAccessHistory: async () => { return MOCK_ACCESS_HISTORY; },
  getDataAccess: async () => { return MOCK_DATA_ACCESS; },
  getActivityTimeline: async () => { return MOCK_ACTIVITY_TIMELINE; },
};
