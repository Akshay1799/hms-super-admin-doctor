export interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  hospitalCount: number;
  branchCount: number;
  userCount: number;
  storageUsed: number;
  createdAt: string;
}

export interface TenantSubscription {
  plan: string;
  renewalDate: string;
  billingCycle: "Monthly" | "Yearly";
  status: string;
  amount: number;
}

export interface TenantDomain {
  id: string;
  primaryDomain: string;
  customDomain?: string;
  sslEnabled: boolean;
  verified: boolean;
}

export interface FeatureFlags {
  emr: boolean;
  appointments: boolean;
  billing: boolean;
  pharmacy: boolean;
  inventory: boolean;
  laboratory: boolean;
  radiology: boolean;
  insurance: boolean;
  telemedicine: boolean;
  notifications: boolean;
  reports: boolean;
}

export interface UsageQuota {
  hospitals: { current: number; max: number };
  branches: { current: number; max: number };
  doctors: { current: number; max: number };
  staff: { current: number; max: number };
  patients: { current: number; max: number };
  storage: { current: number; max: number };
  apiCalls: { current: number; max: number };
}

export interface TenantAuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  description: string;
}
