import { MOCK_DOCTOR } from "../mocks/auth.mock";
import { User, AuthSession } from "../types/auth.types";
import { LoginSchemaType, ResetPasswordSchemaType, ActivateAccountSchemaType } from "../schemas/auth.schema";

const STORAGE_ACCOUNTS_KEY = "hms_doctor_accounts";
const STORAGE_INVITATIONS_KEY = "hms_invitations";

interface SavedAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simulating password hash
}

function getSavedAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccount(account: SavedAccount) {
  if (typeof window === "undefined") return;
  try {
    const accounts = getSavedAccounts();
    // Prevent duplicate emails
    const filtered = accounts.filter(acc => acc.email.toLowerCase() !== account.email.toLowerCase());
    filtered.push(account);
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch {}
}

export const authService = {
  async login(data: LoginSchemaType): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Rate limiting simulation (mock)
    if (data.email === "ratelimit@medichain.com") {
      throw new Error("Too many attempts. Try again later.");
    }
    // Network failure simulation (mock)
    if (data.email === "network@medichain.com") {
      throw new Error("Unable to connect.");
    }

    // 1. Check default mock doctor
    if (data.email.toLowerCase() === MOCK_DOCTOR.email.toLowerCase()) {
      return {
        accessToken: "mock-doctor-access-token-jwt",
        refreshToken: "mock-doctor-refresh-token-jwt",
        user: MOCK_DOCTOR,
      };
    }

    // 2. Check activated local storage accounts
    const accounts = getSavedAccounts();
    const match = accounts.find(
      (acc) => acc.email.toLowerCase() === data.email.toLowerCase() && acc.passwordHash === data.password
    );

    if (!match) {
      throw new Error("Invalid email or password");
    }

    return {
      accessToken: `mock-doctor-access-token-jwt-${match.id}`,
      refreshToken: `mock-doctor-refresh-token-jwt-${match.id}`,
      user: {
        id: match.id,
        name: match.name,
        email: match.email,
        role: "DOCTOR",
        tenantId: "tenant-1",
        specialty: "General Medicine",
        hospitalId: "hosp-1",
        avatar: "/avatars/doctor.png",
      },
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
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (data.token === "invalid") {
      throw new Error("Invalid or expired activation code.");
    }

    // Look up invitation to save corresponding account credentials
    if (typeof window !== "undefined") {
      try {
        const str = atob(data.token);
        const invite = JSON.parse(str);
        if (invite && invite.doctorId && invite.name && invite.email) {
          saveAccount({
            id: invite.doctorId,
            name: invite.name,
            email: invite.email,
            passwordHash: data.password,
          });
        }
      } catch (err) {
        console.error("Failed to decode activation token details", err);
      }
    }
  },
};

