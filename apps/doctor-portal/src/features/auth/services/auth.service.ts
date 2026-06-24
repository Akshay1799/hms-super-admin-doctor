import { MOCK_DOCTOR } from "../mocks/auth.mock";
import { User, AuthSession } from "../types/auth.types";
import { LoginSchemaType, ResetPasswordSchemaType, ActivateAccountSchemaType } from "../schemas/auth.schema";

export const authService = {
  async login(data: LoginSchemaType): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Rate limiting simulation (mock)
    if (data.email === "ratelimit@medichain.com") {
      throw new Error("Too many attempts. Try again later.");
    }
    // Network failure simulation (mock)
    if (data.email === "network@medichain.com") {
      throw new Error("Unable to connect.");
    }

    if (data.email !== MOCK_DOCTOR.email) {
      throw new Error("Invalid email or password");
    }

    return {
      accessToken: "mock-doctor-access-token-jwt",
      refreshToken: "mock-doctor-refresh-token-jwt",
      user: MOCK_DOCTOR,
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
  },

  async forgotPassword(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (email === "network@medichain.com") {
      throw new Error("Unable to connect.");
    }
  },

  async resetPassword(data: ResetPasswordSchemaType): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async activateAccount(data: ActivateAccountSchemaType): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (data.token === "invalid") {
      throw new Error("Invalid or expired activation code.");
    }
  },
};
