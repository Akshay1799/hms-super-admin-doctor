import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  open: () => set({ collapsed: false, mobileOpen: true }),
  close: () => set({ collapsed: true, mobileOpen: false }),
}));
