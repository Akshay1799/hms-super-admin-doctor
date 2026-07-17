import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "HOSPITAL_ADMIN" | "DEPT_ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "STAFF" | "PATIENT";
  tenantId: string | null;
  hospitalId: string | null;
  departmentId: string | null;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "hms_patient_auth",
    }
  )
);
