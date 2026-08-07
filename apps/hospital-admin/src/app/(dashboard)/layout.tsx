"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  Building2,
  Users2,
  Calendar,
  Bed,
  FileBarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Sun,
  Moon,
  ChevronRight,
  Search,
  Bell,
  Clock,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "ICU Bed Critical Alert",
      description: "Shortage of Bed B-04 in Emergency ICU ward. Capacity at 90%.",
      type: "critical",
      isRead: false,
      date: "5 mins ago",
    },
    {
      id: "2",
      title: "New EMR Consultation",
      description: "Dr. Shweta completed Cardiology Unit checkup report for Rahul Sharma.",
      type: "success",
      isRead: false,
      date: "25 mins ago",
    },
    {
      id: "3",
      title: "System Parameters Sync",
      description: "Tenant database sync with Apollo Clinics group completed.",
      type: "info",
      isRead: true,
      date: "2 hours ago",
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

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms-theme") as "light" | "dark";
      if (saved) {
        setTheme(saved);
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(saved);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms-theme", nextTheme);
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(nextTheme);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "RECEPTIONIST":
        return "Receptionist Operations Desk";
      case "NURSE":
        return "Nursing Care Desk";
      case "DEPT_ADMIN":
        return "Department Administration Desk";
      case "HOSPITAL_ADMIN":
        return "Hospital Administration Panel";
      case "SUPER_ADMIN":
        return "Super Admin Portal";
      case "TENANT_ADMIN":
        return "Tenant Governance Portal";
      default:
        return "Hospital Operations Portal";
    }
  };

  const getFilteredNavLinks = (role?: string) => {
    if (role === "RECEPTIONIST") {
      return [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/patients", label: "Patients & Admissions", icon: UserIcon },
        { href: "/appointments", label: "Appointments Queue", icon: Calendar },
        { href: "/beds", label: "Bed Allocation", icon: Bed },
        { href: "/rosters", label: "Shift Roster", icon: Clock },
      ];
    }
    if (role === "NURSE") {
      return [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/patients", label: "Assigned Patients & Vitals", icon: UserIcon },
      ];
    }
    if (role === "DEPT_ADMIN") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/departments", label: "My Department", icon: Building2 },
        { href: "/staff", label: "Department Staff", icon: Users2 },
        { href: "/patients", label: "Department Patients", icon: UserIcon },
        { href: "/rosters", label: "Shift Roster", icon: Clock },
        { href: "/reports", label: "Department Reports", icon: FileBarChart2 },
      ];
    }
    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/departments", label: "Departments", icon: Building2 },
      { href: "/wards", label: "Ward Management", icon: Building2 },
      { href: "/staff", label: "Staff Directory", icon: Users2 },
      { href: "/patients", label: "Patients EMR", icon: UserIcon },
      { href: "/appointments", label: "Appointments", icon: Calendar },
      { href: "/rosters", label: "Shift Roster", icon: Clock },
      { href: "/billing", label: "Billing Checkout", icon: Receipt },
      { href: "/beds", label: "Bed Management", icon: Bed },
      { href: "/reports", label: "Reports & Analytics", icon: FileBarChart2 },
      { href: "/settings", label: "Settings", icon: Settings },
    ];
  };

  const navLinks = getFilteredNavLinks(user?.role);

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
                A
              </div>
              {isSidebarOpen && (
                <span className="font-extrabold tracking-tight text-foreground text-sm">
                  {user?.role ? user.role.replace("_", " ") : "HMS Admin"}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
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
            {isSidebarOpen ? "HMS Administration Portal v1.0" : "v1.0"}
          </p>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header */}
        <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-foreground capitalize">
              {pathname === "/dashboard"
                ? "Overview Dashboard"
                : pathname.replace("/", "").replace("-", " ")}
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold tracking-wide uppercase border border-primary/20">
              {getRoleBadge(user?.role)}
            </span>
          </div>

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
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email || "admin@hospital.com"}</p>
                      <div className="mt-2 space-y-1">
                        <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary mr-1">
                          {user.role}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-semibold">
                          <span>Scope:</span>
                          <span className="bg-muted px-1.5 py-0.5 rounded text-foreground uppercase tracking-wider font-bold text-[9px] truncate max-w-[120px]" title={user.tenantId || "Platform"}>
                            {user.tenantId && typeof user.tenantId === 'string'
                              ? `${user.tenantId.substring(0, 8)}...${user.tenantId.substring(user.tenantId.length - 4)}`
                              : (user.tenantId || "Platform")}
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

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
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
                placeholder="Search pages, patients, staff, departments..."
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
                { label: "Dashboard Overview", href: "/dashboard" },
                { label: "Departments", href: "/departments" },
                { label: "Staff Directory", href: "/staff" },
                { label: "Patients EMR", href: "/patients" },
                { label: "Appointments", href: "/appointments" },
                { label: "Bed Management", href: "/beds" },
                { label: "Reports & Analytics", href: "/reports" },
                { label: "Settings", href: "/settings" },
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
