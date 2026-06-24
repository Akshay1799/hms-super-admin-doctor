import { User, Role, Session, LoginHistory, MfaSettings } from "../types/iam.types";

export const MOCK_ROLES: Role[] = [
  { id: "r-1", name: "SUPER_ADMIN", description: "Full root access to administer the entire SaaS platform.", permissions: ["*"], status: "Active" },
  { id: "r-2", name: "TENANT_ADMIN", description: "Administer tenant-wide hospitals, branches, and licensing billing.", permissions: ["hospitals:create", "hospitals:read", "hospitals:update", "branches:manage", "users:manage", "billing:read"], status: "Active" },
  { id: "r-3", name: "HOSPITAL_ADMIN", description: "Manage clinical personnel, bed capacity, and branch localization settings.", permissions: ["branches:read", "departments:manage", "users:read", "users:create", "capacity:update", "settings:update"], status: "Active" },
  { id: "r-4", name: "BRANCH_ADMIN", description: "Manage localized outpatient units and clinical department staff allocations.", permissions: ["departments:read", "users:read", "capacity:read"], status: "Active" },
  { id: "r-5", name: "DOCTOR", description: "Electronic Medical Records (EMR) charting and patient consults.", permissions: ["emr:write", "patients:read", "appointments:manage"], status: "Active" },
  { id: "r-6", name: "STAFF", description: "Reception and billing clerk duties, outpatient check-ins.", permissions: ["patients:read", "appointments:read", "billing:create"], status: "Active" },
];

export const MOCK_USERS: User[] = [
  { id: "u-1", firstName: "Alex", lastName: "Mercer", email: "admin@medichain.com", phone: "+1 (555) 019-2834", role: "SUPER_ADMIN", tenantId: "1", hospitalId: "h-1", branchId: "b-1", status: "Active", lastLogin: "2026-06-23 11:30", createdAt: "2026-01-01" },
  { id: "u-2", firstName: "Sarah", lastName: "Connor", email: "sconnor@apollo.com", phone: "+1 (555) 019-8877", role: "TENANT_ADMIN", tenantId: "1", hospitalId: "h-1", branchId: "b-2", status: "Active", lastLogin: "2026-06-22 15:45", createdAt: "2026-01-12" },
  { id: "u-3", firstName: "Gregory", lastName: "House", email: "house@apollo.com", phone: "+1 (555) 911-0022", role: "DOCTOR", tenantId: "1", hospitalId: "h-1", branchId: "b-1", status: "Active", lastLogin: "2026-06-23 08:15", createdAt: "2026-01-15" },
  { id: "u-4", firstName: "John", lastName: "Watson", email: "watson@carefirst.com", phone: "+1 (555) 040-5690", role: "HOSPITAL_ADMIN", tenantId: "2", hospitalId: "h-3", branchId: "b-5", status: "Pending", lastLogin: "Never", createdAt: "2026-05-20" },
  { id: "u-5", firstName: "Stephen", lastName: "Strange", email: "strange@sutter.com", phone: "+1 (555) 099-1221", role: "DOCTOR", tenantId: "3", hospitalId: "h-4", branchId: "b-7", status: "Suspended", lastLogin: "2026-06-15 10:30", createdAt: "2026-04-15" },
];

export const MOCK_PERMISSIONS = [
  "Dashboard",
  "Tenants",
  "Hospitals",
  "Branches",
  "Departments",
  "Users",
  "Roles",
  "Doctors",
  "Patients",
  "Billing",
  "Notifications",
  "Reports",
  "Audit Logs",
  "Settings",
];

export const MOCK_SESSIONS: Session[] = [
  { id: "sess-1", userId: "u-1", userEmail: "admin@medichain.com", userName: "Alex Mercer", device: "MacBook Pro", browser: "Chrome", os: "macOS", ipAddress: "192.168.1.50", loginTime: "2026-06-23 09:00", lastActivity: "2026-06-23 11:35", status: "Active" },
  { id: "sess-2", userId: "u-1", userEmail: "admin@medichain.com", userName: "Alex Mercer", device: "iPhone 15", browser: "Safari", os: "iOS", ipAddress: "172.56.21.90", loginTime: "2026-06-23 10:15", lastActivity: "2026-06-23 11:30", status: "Active" },
  { id: "sess-3", userId: "u-3", userEmail: "house@apollo.com", userName: "Gregory House", device: "Dell XPS", browser: "Firefox", os: "Windows", ipAddress: "192.168.1.120", loginTime: "2026-06-23 08:15", lastActivity: "2026-06-23 10:45", status: "Active" },
];

export const MOCK_LOGIN_HISTORY: LoginHistory[] = [
  { id: "lh-1", userId: "u-1", userEmail: "admin@medichain.com", userName: "Alex Mercer", device: "MacBook Pro", browser: "Chrome", ipAddress: "192.168.1.50", country: "United States", loginTime: "2026-06-23 09:00", status: "Success" },
  { id: "lh-2", userId: "u-1", userEmail: "admin@medichain.com", userName: "Alex Mercer", device: "MacBook Pro", browser: "Chrome", ipAddress: "192.168.1.50", country: "United States", loginTime: "2026-06-22 09:12", status: "Success" },
  { id: "lh-3", userId: "u-3", userEmail: "house@apollo.com", userName: "Gregory House", device: "Dell XPS", browser: "Firefox", ipAddress: "192.168.1.120", country: "United States", loginTime: "2026-06-23 08:15", status: "Success" },
  { id: "lh-4", userId: "u-5", userEmail: "strange@sutter.com", userName: "Stephen Strange", device: "Lenovo ThinkPad", browser: "Chrome", ipAddress: "80.22.12.98", country: "United Kingdom", loginTime: "2026-06-19 14:22", status: "Failed" },
  { id: "lh-5", userId: "u-5", userEmail: "strange@sutter.com", userName: "Stephen Strange", device: "Unknown Device", browser: "Opera", ipAddress: "185.90.12.33", country: "Russia", loginTime: "2026-06-19 14:15", status: "Blocked" },
];

export const MOCK_MFA: MfaSettings[] = [
  { userId: "u-1", userName: "Alex Mercer", userEmail: "admin@medichain.com", role: "SUPER_ADMIN", mfaEnabled: true, method: "Authenticator App", updatedAt: "2026-01-05" },
  { userId: "u-2", userName: "Sarah Connor", userEmail: "sconnor@apollo.com", role: "TENANT_ADMIN", mfaEnabled: true, method: "SMS OTP", updatedAt: "2026-01-14" },
  { userId: "u-3", userName: "Gregory House", userEmail: "house@apollo.com", role: "DOCTOR", mfaEnabled: false, method: "Email OTP", updatedAt: "2026-01-15" },
  { userId: "u-4", userName: "John Watson", userEmail: "watson@carefirst.com", role: "HOSPITAL_ADMIN", mfaEnabled: false, method: "Email OTP", updatedAt: "2026-05-20" },
  { userId: "u-5", userName: "Stephen Strange", userEmail: "strange@sutter.com", role: "DOCTOR", mfaEnabled: true, method: "Email OTP", updatedAt: "2026-04-18" },
];
