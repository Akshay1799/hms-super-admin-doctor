export const QUERY_KEYS = {
  tenants: "tenants",
  tenant: (id: string) => ["tenant", id] as const,
  tenantHospitals: (tenantId: string) => ["tenant", tenantId, "hospitals"] as const,
  
  hospitals: "hospitals",
  hospital: (id: string) => ["hospital", id] as const,
  hospitalBranches: (hospitalId: string) => ["hospital", hospitalId, "branches"] as const,

  branches: "branches",
  branch: (id: string) => ["branch", id] as const,
  branchDepartments: (branchId: string) => ["branch", branchId, "departments"] as const,

  departments: "departments",
  users: "users",
  roles: "roles",
  permissions: "permissions",
  doctors: "doctors",
  patients: "patients",
  revenue: "revenue",
  notifications: "notifications",
  integrations: "integrations",
  monitoring: "monitoring",
  auditLogs: "auditLogs",
  reports: "reports",
  settings: "settings",
};
