import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';

export const useAuditStats = () => useQuery({ queryKey: ['audit', 'stats'], queryFn: auditService.getAuditStats });
export const useComplianceStats = () => useQuery({ queryKey: ['audit', 'compliance'], queryFn: auditService.getComplianceStats });
export const useAuditLogs = () => useQuery({ queryKey: ['audit', 'logs'], queryFn: auditService.getAuditLogs });
export const useSecurityEvents = () => useQuery({ queryKey: ['audit', 'security-events'], queryFn: auditService.getSecurityEvents });
export const useAccessHistory = () => useQuery({ queryKey: ['audit', 'access-history'], queryFn: auditService.getAccessHistory });
export const useDataAccess = () => useQuery({ queryKey: ['audit', 'data-access'], queryFn: auditService.getDataAccess });
export const useActivityTimeline = () => useQuery({ queryKey: ['audit', 'activity'], queryFn: auditService.getActivityTimeline });
