"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/activate-account"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get("user");
      if (userParam) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userParam));
          const roleStr = (parsedUser?.role as string) || '';
          if (['RECEPTIONIST', 'NURSE', 'STAFF', 'DEPT_ADMIN', 'HOSPITAL_ADMIN'].includes(roleStr)) {
            useAuthStore.getState().login(parsedUser);
          } else {
            useAuthStore.getState().logout();
          }
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
    } else {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isPublicRoute && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated && user) {
      const userEncoded = encodeURIComponent(JSON.stringify(user));
      const roleStr = (user.role as string) || '';
      const isDev = process.env.NODE_ENV === 'development';
      const doctorPortalUrl = process.env.NEXT_PUBLIC_DOCTOR_PORTAL_URL || (isDev ? 'http://localhost:3000' : 'https://hms-doctor-portal-phi.vercel.app');
      const superAdminUrl = process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || (isDev ? 'http://localhost:3001' : 'https://hms-super-admin-amber.vercel.app');
      const patientPortalUrl = process.env.NEXT_PUBLIC_PATIENT_PORTAL_URL || (isDev ? 'http://localhost:3003' : 'https://hms-patient-portal-iota.vercel.app');

      if (roleStr === 'DOCTOR') {
        window.location.href = `${doctorPortalUrl}/dashboard?user=${userEncoded}`;
      } else if (['SUPER_ADMIN', 'TENANT_ADMIN'].includes(roleStr)) {
        window.location.href = `${superAdminUrl}/dashboard?user=${userEncoded}`;
      } else if (roleStr === 'PATIENT') {
        window.location.href = `${patientPortalUrl}/dashboard?user=${userEncoded}`;
      } else if (pathname === "/login") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, pathname, isPublicRoute, router, hasHydrated, user]);

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
