"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(() => {
    if (typeof window !== "undefined" && useAuthStore.persist?.hasHydrated) {
      return useAuthStore.persist.hasHydrated();
    }
    return false;
  });

  const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/activate-account"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get("user");
      if (userParam) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userParam));
          useAuthStore.getState().login(parsedUser);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error("Failed to parse cross-portal session", e);
        }
      }
    }

    if (!useAuthStore.persist.hasHydrated()) {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isPublicRoute && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated && user) {
      const userEncoded = encodeURIComponent(JSON.stringify(user));
      if (user.role === 'DOCTOR') {
        window.location.href = `http://localhost:3000/dashboard?user=${userEncoded}`;
      } else if (pathname === "/login") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, pathname, isPublicRoute, router, hasHydrated, user]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
