"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import { SessionModal } from "@/features/auth/components/SessionModal";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const COUNTDOWN_TIME = 30; // 30 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define public routes that do not require auth
  const publicRoutes = [ROUTES.login, ROUTES.forgotPassword, ROUTES.resetPassword, "/unauthorized", "/forbidden", "/design-system"];

  const isPublicRoute = publicRoutes.includes(pathname);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Route protection redirect checks
  useEffect(() => {
    if (!isMounted) return;
    if (!isPublicRoute && !isAuthenticated) {
      router.push(ROUTES.login);
    } else if (isAuthenticated && pathname === ROUTES.login) {
      router.push(ROUTES.dashboard);
    }
  }, [isAuthenticated, pathname, isPublicRoute, router, isMounted]);

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
