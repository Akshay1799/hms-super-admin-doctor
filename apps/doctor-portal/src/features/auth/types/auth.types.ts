export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "DOCTOR";
  tenantId: string;
  specialty: string;
  hospitalId: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
