import {
  PlatformSettings, SecurityPolicy, FeatureFlag,
  BrandingSettings, StorageSettings, RetentionPolicy,
  EnvironmentSettings, SystemMetrics
} from '../types/settings.types';

export const MOCK_GENERAL_SETTINGS: PlatformSettings = {
  platformName: 'HMS Cloud',
  companyName: 'Global Health Systems Inc.',
  website: 'https://hms-cloud.example.com',
  supportEmail: 'support@hmscloud.com',
  supportPhone: '+1-800-555-0199',
  timezone: 'UTC',
  currency: 'USD',
  language: 'English',
  maintenanceMode: false,
};

export const MOCK_SECURITY_POLICY: SecurityPolicy = {
  passwordLength: 12,
  requireUppercase: true,
  requireSpecialChar: true,
  passwordExpiryDays: 90,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  mfaRequired: true,
  rememberMe: false,
  concurrentSessions: 1,
};

export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'ff-1', name: 'EMR Module', description: 'Enable Electronic Medical Records', enabled: true, updatedAt: '2026-06-20T10:00:00Z' },
  { id: 'ff-2', name: 'Billing Engine v2', description: 'Use new automated billing engine', enabled: true, updatedAt: '2026-06-15T09:00:00Z' },
  { id: 'ff-3', name: 'Telemedicine', description: 'Video consultation features', enabled: false, updatedAt: '2026-06-22T14:30:00Z' },
  { id: 'ff-4', name: 'AI Diagnostics', description: 'Experimental AI image analysis', enabled: false, updatedAt: '2026-06-10T11:00:00Z' },
  { id: 'ff-5', name: 'Advanced Analytics', description: 'Predictive analytics dashboard', enabled: true, updatedAt: '2026-06-21T08:15:00Z' },
];

export const MOCK_BRANDING: BrandingSettings = {
  primaryColor: '#0ea5e9',
  secondaryColor: '#6366f1',
  companyName: 'HMS Super Admin',
  tagline: 'Healthcare Managed Securely',
  footerText: '© 2026 Global Health Systems Inc. All rights reserved.',
};

export const MOCK_STORAGE: StorageSettings = {
  provider: 's3',
  bucketName: 'hms-production-assets',
  retentionDays: 365,
  maxFileSizeMB: 50,
  backupEnabled: true,
};

export const MOCK_RETENTION_POLICIES: RetentionPolicy[] = [
  { id: 'ret-1', category: 'Audit Logs', durationDays: 365, description: 'Immutable security and access logs' },
  { id: 'ret-2', category: 'Patient Records', durationDays: 2555, description: 'Medical histories (7 years minimum)' },
  { id: 'ret-3', category: 'Invoices', durationDays: 1825, description: 'Financial records for tax compliance' },
  { id: 'ret-4', category: 'System Backups', durationDays: 30, description: 'Rolling daily database snapshots' },
];

export const MOCK_ENVIRONMENT: EnvironmentSettings = {
  environmentName: 'production',
  apiUrl: 'https://api.hmscloud.com/v1',
  region: 'us-east-1',
  maintenanceMode: false,
  buildVersion: 'v2.4.1-stable',
};

export const MOCK_SYSTEM_METRICS: SystemMetrics = {
  version: '2.4.1',
  buildNumber: '88421a',
  environment: 'Production',
  storageUsedGB: 412.5,
  databaseStatus: 'healthy',
  redisStatus: 'healthy',
};
