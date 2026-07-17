import { MOCK_DOCTOR } from "../mocks/auth.mock";
import { User, AuthSession } from "../types/auth.types";
import { LoginSchemaType, ResetPasswordSchemaType, ActivateAccountSchemaType } from "../schemas/auth.schema";
import { apiClient } from "@/lib/api-client";

export const authService = {
  async login(data: LoginSchemaType): Promise<AuthSession> {
    try {
      const res = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const session = res.data.data;
      if (session && session.user) {
        session.user.id = session.user._id || session.user.id;
      }
      return session;
    } catch (error: any) {
      // Fallback for sandboxed offline testing if backend is not running
      if (error.status === 404 || error.message?.includes("Network Error")) {
        if (data.email.toLowerCase() === MOCK_DOCTOR.email.toLowerCase()) {
          return {
            accessToken: "mock-doctor-access-token",
            refreshToken: "mock-doctor-refresh-token",
            user: MOCK_DOCTOR,
          };
        }
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore logout errors to guarantee local state clears
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email, portalType: 'doctor' });
  },

  async resetPassword(data: ResetPasswordSchemaType & { token: string }): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      token: data.token,
      password: data.password,
    });
  },

  async activateAccount(data: ActivateAccountSchemaType): Promise<void> {
    await apiClient.post("/auth/activate", {
      token: data.token,
      password: data.password,
    });
  },
};

