"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import { SessionModal } from "@/features/auth/components/SessionModal";
import { Loader2 } from "lucide-react";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const COUNTDOWN_TIME = 30; // 30 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define public routes that do not require auth
  const publicRoutes = [ROUTES.login, ROUTES.forgotPassword, ROUTES.resetPassword, "/unauthorized", "/forbidden", "/design-system"];

  const isPublicRoute = publicRoutes.includes(pathname);

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Check if store has already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  // Route protection redirect checks
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isPublicRoute && !isAuthenticated) {
      router.push(ROUTES.login);
    } else if (isAuthenticated && user) {
      const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN"];
      const userRoleStr = (user.role as string) || '';
      if (userRoleStr && !allowedRoles.includes(userRoleStr)) {
        const userEncoded = encodeURIComponent(JSON.stringify(user));
        const isDev = process.env.NODE_ENV === 'development';
        const hospitalAdminUrl = process.env.NEXT_PUBLIC_HOSPITAL_ADMIN_URL || (isDev ? 'http://localhost:3002' : 'https://hms-super-admin-doctor-hospital-adm.vercel.app');
        const doctorPortalUrl = process.env.NEXT_PUBLIC_DOCTOR_PORTAL_URL || (isDev ? 'http://localhost:3000' : 'https://hms-doctor-portal-phi.vercel.app');
        const patientPortalUrl = process.env.NEXT_PUBLIC_PATIENT_PORTAL_URL || (isDev ? 'http://localhost:3003' : 'https://hms-patient-portal-iota.vercel.app');

        if (userRoleStr === 'DOCTOR') {
          window.location.href = `${doctorPortalUrl}/dashboard?user=${userEncoded}`;
        } else if (userRoleStr === 'PATIENT') {
          window.location.href = `${patientPortalUrl}/dashboard?user=${userEncoded}`;
        } else {
          window.location.href = `${hospitalAdminUrl}/dashboard?user=${userEncoded}`;
        }
      } else if (pathname === ROUTES.login) {
        router.push(ROUTES.dashboard);
      }
    }
  }, [isAuthenticated, user, pathname, isPublicRoute, router, hasHydrated]);

  // Inactivity tracking
  const resetInactivityTimer = () => {
    if (isWarningOpen) return;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setIsWarningOpen(true);
      setCountdown(COUNTDOWN_TIME);
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Activity event listeners
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isAuthenticated, isWarningOpen]);

  // Countdown timer effect
  useEffect(() => {
    if (isWarningOpen && countdown > 0) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isWarningOpen && countdown === 0) {
      handleLogout();
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isWarningOpen, countdown]);

  const handleStaySignedIn = () => {
    setIsWarningOpen(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    resetInactivityTimer();
  };

  const handleLogout = () => {
    setIsWarningOpen(false);
    logout();
    router.push(ROUTES.login);
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {children}
      <SessionModal
        isOpen={isWarningOpen}
        countdown={countdown}
        onStaySignedIn={handleStaySignedIn}
        onLogout={handleLogout}
      />
    </>
  );
}
