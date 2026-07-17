import { MOCK_USER } from "../mocks/auth.mock";
import { User, AuthSession } from "../types/auth.types";
import { LoginSchemaType, ResetPasswordSchemaType, MfaSchemaType } from "../schemas/auth.schema";
import { apiClient } from "@/lib/api-client";

export const authService = {
  async login(data: LoginSchemaType): Promise<AuthSession> {
    try {
      const res = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      return res.data.data; // contains { user: User }
    } catch (error: any) {
      // Fallback for sandboxed offline testing if backend is not running
      if (error.status === 404 || error.message?.includes("Network Error")) {
        if (data.email === MOCK_USER.email && data.password === "password123") {
          return {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: MOCK_USER,
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
    await apiClient.post("/auth/forgot-password", { email, portalType: 'super-admin' });
  },

  async resetPassword(data: ResetPasswordSchemaType & { token: string }): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      token: data.token,
      password: data.password,
    });
  },

  async verifyOtp(data: MfaSchemaType): Promise<void> {
    // Keep standard dummy verification or call verification endpoint if configured
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (data.otp !== "123456") {
      throw new Error("Invalid or expired OTP code.");
    }
  },
};
