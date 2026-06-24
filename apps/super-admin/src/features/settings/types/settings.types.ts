export interface PlatformSettings {
  platformName: string;
  companyName: string;
  website: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
}

export interface SecurityPolicy {
  passwordLength: number;
  requireUppercase: boolean;
  requireSpecialChar: boolean;
  passwordExpiryDays: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  mfaRequired: boolean;
  rememberMe: boolean;
  concurrentSessions: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  tagline: string;
  footerText: string;
}

export interface StorageSettings {
  provider: "s3" | "cloudinary" | "local";
  bucketName: string;
  retentionDays: number;
  maxFileSizeMB: number;
  backupEnabled: boolean;
}

export interface RetentionPolicy {
  id: string;
  category: string;
  durationDays: number;
  description: string;
}

export interface EnvironmentSettings {
  environmentName: "development" | "staging" | "production";
  apiUrl: string;
  region: string;
  maintenanceMode: boolean;
  buildVersion: string;
}

export interface SystemMetrics {
  version: string;
  buildNumber: string;
  environment: string;
  storageUsedGB: number;
  databaseStatus: "healthy" | "degraded" | "offline";
  redisStatus: "healthy" | "degraded" | "offline";
}
