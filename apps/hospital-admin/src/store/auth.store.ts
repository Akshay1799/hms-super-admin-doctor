import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "HOSPITAL_ADMIN" | "DEPT_ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "STAFF";
  tenantId: string | null;
  hospitalId: string | null;
  departmentId: string | null;
  specialty?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantId: string | null;
  hospitalId: string | null;
  role: string | null;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      tenantId: null,
      hospitalId: null,
      role: null,

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          role: user.role,
          tenantId: user.tenantId,
          hospitalId: user.hospitalId,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          tenantId: null,
          hospitalId: null,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          role: user ? user.role : null,
          tenantId: user ? user.tenantId : null,
          hospitalId: user ? user.hospitalId : null,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          tenantId: null,
          hospitalId: null,
        }),

      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "hms_hospital_admin_auth",
    }
  )
);
