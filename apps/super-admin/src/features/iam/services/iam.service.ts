import { User, Role, Session, LoginHistory, MfaSettings } from "../types/iam.types";
import { CreateUserInput, CreateRoleInput } from "../schemas/iam.schema";
import {
  MOCK_USERS,
  MOCK_ROLES,
  MOCK_PERMISSIONS,
  MOCK_SESSIONS,
  MOCK_LOGIN_HISTORY,
  MOCK_MFA,
} from "../mocks/iam.mocks";

let usersData = [...MOCK_USERS];
let rolesData = [...MOCK_ROLES];
let sessionsData = [...MOCK_SESSIONS];
let loginHistoryData = [...MOCK_LOGIN_HISTORY];
let mfaSettingsData = [...MOCK_MFA];

export interface UserDetails {
  user: User;
  roles: Role[];
  permissions: string[];
  sessions: Session[];
  loginHistory: LoginHistory[];
  mfa: MfaSettings;
  auditLogs: { id: string; action: string; timestamp: string; description: string }[];
}

export const iamService = {
  async getUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    tenantId?: string;
  }): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let result = [...usersData];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
      );
    }

    if (filters?.role && filters.role !== "All") {
      result = result.filter((u) => u.role === filters.role);
    }

    if (filters?.status && filters.status !== "All") {
      result = result.filter((u) => u.status === filters.status);
    }

    if (filters?.tenantId && filters.tenantId !== "All") {
      result = result.filter((u) => u.tenantId === filters.tenantId);
    }

    return result.sort((a, b) => b.id.localeCompare(a.id));
  },

  async getUser(id: string): Promise<UserDetails> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = usersData.find((u) => u.id === id);
    if (!user) throw new Error(`User with ID ${id} not found.`);

    const userMfa = mfaSettingsData.find((m) => m.userId === id) || {
      userId: id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      role: user.role,
      mfaEnabled: false,
      method: "Email OTP" as const,
      updatedAt: user.createdAt,
    };

    return {
      user,
      roles: rolesData,
      permissions: MOCK_PERMISSIONS,
      sessions: sessionsData.filter((s) => s.userId === id && s.status === "Active"),
      loginHistory: loginHistoryData.filter((l) => l.userId === id),
      mfa: userMfa,
      auditLogs: [
        { id: "aud-1", action: "User Created", timestamp: user.createdAt, description: "User account provisioned on platform." },
      ],
    };
  },

  async createUser(input: CreateUserInput): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (usersData.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error(`Email "${input.email}" is already registered.`);
    }

    const newId = `u-${Date.now()}`;
    const newUser: User = {
      id: newId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      role: input.role,
      tenantId: input.tenantId,
      hospitalId: input.hospitalId || "",
      branchId: input.branchId || "",
      status: input.status,
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    usersData.push(newUser);

    // Initialize default MFA settings for user
    mfaSettingsData.push({
      userId: newId,
      userName: `${input.firstName} ${input.lastName}`,
      userEmail: input.email,
      role: input.role,
      mfaEnabled: false,
      method: "Email OTP",
      updatedAt: new Date().toISOString().split("T")[0],
    });

    return newUser;
  },

  async updateUser(id: string, input: Partial<CreateUserInput>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const idx = usersData.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");

    const existing = usersData[idx];
    const updated: User = {
      ...existing,
      firstName: input.firstName ?? existing.firstName,
      lastName: input.lastName ?? existing.lastName,
      email: input.email ?? existing.email,
      phone: input.phone ?? existing.phone,
      role: input.role ?? existing.role,
      tenantId: input.tenantId ?? existing.tenantId,
      hospitalId: input.hospitalId ?? existing.hospitalId,
      branchId: input.branchId ?? existing.branchId,
      status: input.status ?? existing.status,
    };

    usersData[idx] = updated;

    // Sync MFA settings
    const mfaIdx = mfaSettingsData.findIndex((m) => m.userId === id);
    if (mfaIdx !== -1) {
      mfaSettingsData[mfaIdx] = {
        ...mfaSettingsData[mfaIdx],
        userName: `${updated.firstName} ${updated.lastName}`,
        userEmail: updated.email,
        role: updated.role,
      };
    }

    return updated;
  },

  async deleteUser(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    usersData = usersData.filter((u) => u.id !== id);
    sessionsData = sessionsData.filter((s) => s.userId !== id);
    loginHistoryData = loginHistoryData.filter((l) => l.userId !== id);
    mfaSettingsData = mfaSettingsData.filter((m) => m.userId !== id);
  },

  async suspendUser(id: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const user = usersData.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    user.status = "Suspended";
    return user;
  },

  async activateUser(id: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const user = usersData.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    user.status = "Active";
    return user;
  },

  // Roles CRUD
  async getRoles(): Promise<Role[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...rolesData];
  },

  async createRole(input: CreateRoleInput): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newRole: Role = {
      id: `r-${Date.now()}`,
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      status: input.status,
    };
    rolesData.push(newRole);
    return newRole;
  },

  async updateRole(id: string, input: Partial<CreateRoleInput>): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const idx = rolesData.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Role not found");

    const updated = {
      ...rolesData[idx],
      ...input,
      name: input.name ?? rolesData[idx].name,
      description: input.description ?? rolesData[idx].description,
      permissions: input.permissions ?? rolesData[idx].permissions,
      status: input.status ?? rolesData[idx].status,
    };
    rolesData[idx] = updated;
    return updated;
  },

  async duplicateRole(id: string): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const role = rolesData.find((r) => r.id === id);
    if (!role) throw new Error("Role not found");

    const duplicated: Role = {
      id: `r-${Date.now()}`,
      name: `${role.name} Copy`,
      description: `Duplicate copy of ${role.name}.`,
      permissions: [...role.permissions],
      status: "Active",
    };
    rolesData.push(duplicated);
    return duplicated;
  },

  async deleteRole(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    rolesData = rolesData.filter((r) => r.id !== id);
  },

  // Permissions Matrix
  async getPermissions(): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_PERMISSIONS;
  },

  // Sessions
  async getSessions(): Promise<Session[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return sessionsData.filter((s) => s.status === "Active");
  },

  async terminateSession(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const sess = sessionsData.find((s) => s.id === id);
    if (sess) {
      sess.status = "Terminated";
    }
  },

  async forceLogoutAll(userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    sessionsData.forEach((s) => {
      if (s.userId === userId) {
        s.status = "Terminated";
      }
    });
  },

  // Login History
  async getLoginHistory(): Promise<LoginHistory[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...loginHistoryData];
  },

  // MFA Management
  async getMfa(): Promise<MfaSettings[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mfaSettingsData];
  },

  async enableMfa(userId: string, method: MfaSettings["method"]): Promise<MfaSettings> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const mfa = mfaSettingsData.find((m) => m.userId === userId);
    if (!mfa) throw new Error("MFA record not found");

    mfa.mfaEnabled = true;
    mfa.method = method;
    mfa.updatedAt = new Date().toISOString().split("T")[0];
    return mfa;
  },

  async disableMfa(userId: string): Promise<MfaSettings> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const mfa = mfaSettingsData.find((m) => m.userId === userId);
    if (!mfa) throw new Error("MFA record not found");

    mfa.mfaEnabled = false;
    mfa.updatedAt = new Date().toISOString().split("T")[0];
    return mfa;
  },
};
