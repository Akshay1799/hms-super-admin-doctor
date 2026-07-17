"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import { Toaster } from "sonner";
import Link from "next/link";
import {
  Heart,
  FileText,
  Settings,
  LogOut,
  Moon,
  Sun,
  Activity,
  ChevronRight,
  Loader2,
  Search,
  User as UserIcon,
  Bell,
  X,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Attending Doctor Checkup",
      description: "Dr. Shweta updated your medication log and diagnoses parameters.",
      type: "info",
      isRead: false,
      date: "12 mins ago",
    },
    {
      id: "2",
      title: "Invoice Settlement Approved",
      description: "Payment for ICU Consultation invoice INV-2026-0001 has been settled successfully.",
      type: "success",
      isRead: false,
      date: "45 mins ago",
    },
    {
      id: "3",
      title: "Health Portal Activated",
      description: "Welcome to MediChain Secure EMR. Your clinical registry is fully secure.",
      type: "success",
      isRead: true,
      date: "1 day ago",
    },
  ]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  React.useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", clickOutside);
    }
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [isProfileOpen]);

  // Ctrl+K search interceptor
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Initialize theme
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("hms-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("hms-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Auth check on mount
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const userData = res.data.data;
        if (userData && userData.role && userData.role !== "PATIENT" && userData.role !== "SUPER_ADMIN") {
          logout();
          router.replace("/login");
          return;
        }
        setUser(userData);
      } catch (err) {
        logout();
        router.replace("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (isAuthenticated) {
      checkAuth();
    } else {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, setUser, logout, router]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      logout();
      router.replace("/login");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center text-muted-foreground text-sm font-semibold">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        Synchronizing credentials...
      </div>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "My Health EMR", icon: Heart },
    { href: "/invoices", label: "Billing & Invoices", icon: FileText },
    { href: "/settings", label: "Portal Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } shrink-0 bg-card border-r border-border flex flex-col justify-between transition-all duration-300 z-30`}
      >
        <div className="flex flex-col pt-4 overflow-y-auto">
          {/* Header/Logo */}
          <div className="flex items-center justify-between px-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              {isSidebarOpen && (
                <span className="font-extrabold tracking-tight text-foreground text-sm uppercase">
                  My Health
                </span>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              {isSidebarOpen ? <ChevronRight className="h-4 w-4 rotate-180" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-3 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isSidebarOpen && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground font-semibold text-center select-none">
            {isSidebarOpen ? "Patient Health Portal v1.0" : "v1.0"}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-between px-6 z-20">
          <h2 className="text-base font-bold text-foreground capitalize">
            {pathname === "/dashboard" ? "My Clinical Records" : pathname?.replace("/", "")?.replace("-", " ") || "Health Dashboard"}
          </h2>

          <div className="flex items-center gap-4">
            {/* Search shortcut hint */}
            <div className="hidden sm:flex items-center gap-2 border border-border bg-muted/30 px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-semibold">
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-[9px] font-mono select-none">
                Ctrl + K
              </kbd>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Open Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full focus:outline-hidden cursor-pointer"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase font-extrabold border border-border">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5 p-1 animate-in fade-in zoom-in-95 duration-100 z-30">
                    <div className="px-3.5 py-3 border-b border-border text-left">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email || "patient@medichain.com"}</p>
                      <div className="mt-2 space-y-1.5">
                        <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary mr-1">
                          {user.role}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                          <span>Status:</span>
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-450 font-extrabold">
                            HIPAA Secure
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      >
                        <UserIcon className="h-4 w-4 shrink-0" /> Settings & Profile
                      </Link>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 shrink-0" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Children scroll panel */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Slideout Notification drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-250">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setIsNotifOpen(false)} />
          
          <div className="relative w-full max-w-[400px] h-full bg-card border-l border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                  className="text-primary hover:underline font-bold cursor-pointer"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setNotifications([])}
                  className="text-muted-foreground hover:text-foreground hover:underline font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item))}
                    className={`p-3.5 border border-border rounded-xl bg-card transition-all cursor-pointer hover:border-primary/50 relative overflow-hidden ${
                      !n.isRead ? "border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold text-foreground">{n.title}</p>
                      <span className="text-[9px] text-muted-foreground shrink-0 font-medium">{n.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{n.description}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <Bell className="h-8 w-8 text-muted-foreground/45" />
                  <p className="text-xs text-muted-foreground font-semibold">No notifications</p>
                  <p className="text-[10px] text-muted-foreground/75 font-medium">You are all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" richColors />

      {/* Ctrl+K Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh] animate-in fade-in duration-150"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search records, invoices, appointments..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
              />
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className="text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground cursor-pointer"
              >
                ESC
              </kbd>
            </div>
            {/* Quick Links */}
            <div className="p-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-2 py-1.5">Quick Navigate</p>
              {[
                { label: "My Clinical Records", href: "/dashboard" },
                { label: "Invoices & Billing", href: "/invoices" },
                { label: "Settings & Profile", href: "/settings" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
