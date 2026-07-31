export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | string;
  tenantId: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
