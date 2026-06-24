export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  tenantId: string;
  hospitalId: string;
  branchId: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  lastLogin: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // List of permission keys: e.g. "users:read", "hospitals:create"
  status: "Active" | "Inactive";
}

export interface Session {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  status: "Active" | "Terminated";
}

export interface LoginHistory {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  device: string;
  browser: string;
  ipAddress: string;
  country: string;
  loginTime: string;
  status: "Success" | "Failed" | "Blocked";
}

export interface MfaSettings {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  mfaEnabled: boolean;
  method: "Email OTP" | "Authenticator App" | "SMS OTP";
  updatedAt: string;
}
