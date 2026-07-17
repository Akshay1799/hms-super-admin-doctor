"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/activate-account"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
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
    } else if (isAuthenticated && pathname === "/login") {
      router.push("/dashboard");
    } else if (isAuthenticated && user) {
      // Ensure only correct roles enter this portal
      const allowedRoles = ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DEPT_ADMIN", "RECEPTIONIST", "STAFF"];
      if (user.role && !allowedRoles.includes(user.role)) {
        logout();
        router.push("/login");
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
