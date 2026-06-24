import { create } from "zustand";
import { User } from "@/features/auth/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantId: string | null;
  role: string | null;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  tenantId: null,
  role: null,

  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      role: user.role,
      tenantId: user.tenantId,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      tenantId: null,
    }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      role: user ? user.role : null,
      tenantId: user ? user.tenantId : null,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      tenantId: null,
    }),

  setIsLoading: (isLoading) => set({ isLoading }),
}));
