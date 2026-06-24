"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { ROUTES } from "@/constants/routes";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/header/header";
import { CommandPalette } from "@/components/command-palette/command-palette";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.login);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto bg-background/30">
          {children}
        </main>
      </div>

      {/* Ctrl + K Command Palette */}
      <CommandPalette />
    </div>
  );
}
