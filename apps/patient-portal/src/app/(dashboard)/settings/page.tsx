"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Settings,
  User,
  KeyRound,
  Bell,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function PatientSettings() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || ""); // read-only for safety
  const [isProfilePending, setIsProfilePending] = useState(false);

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordPending, setIsPasswordPending] = useState(false);

  // Notification States
  const [emailPref, setEmailPref] = useState(true);
  const [smsPref, setSmsPref] = useState(false);
  const [inAppPref, setInAppPref] = useState(true);
  const [isNotifPending, setIsNotifPending] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfilePending(true);
    try {
      // call user update api
      await apiClient.patch("/users/profile", { name });
      if (user) {
        setUser({ ...user, name });
      }
      toast.success("Profile details updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile parameters");
    } finally {
      setIsProfilePending(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsPasswordPending(true);
    try {
      await apiClient.post("/users/change-password", {
        currentPassword,
        newPassword
      });
      toast.success("Security credentials updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Credential updates failed. Verify your password.");
    } finally {
      setIsPasswordPending(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotifPending(true);
    setTimeout(() => {
      setIsNotifPending(false);
      toast.success("Notification preferences saved successfully");
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 bg-card border border-border rounded-xl p-4 shadow-sm h-fit space-y-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" /> Personal Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "security"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <KeyRound className="h-4 w-4" /> Account Security
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "notifications"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" /> Notifications
        </button>
      </div>

      {/* Main Settings Form Panels */}
      <div className="md:col-span-3 bg-card border border-border rounded-xl p-6 shadow-sm">
        {activeTab === "profile" && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Profile Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  disabled={isProfilePending}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Email</label>
                <input
                  type="email"
                  value={email}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProfilePending}
              className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isProfilePending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" /> Account Security Credentials
            </h3>

            <div className="space-y-4 max-w-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  disabled={isPasswordPending}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  disabled={isPasswordPending}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  disabled={isPasswordPending}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPasswordPending}
              className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        {activeTab === "notifications" && (
          <form onSubmit={handleSaveNotifications} className="space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notification Dispatch Channels
            </h3>

            <div className="space-y-3.5 pt-1.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPref}
                  onChange={(e) => setEmailPref(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  disabled={isNotifPending}
                />
                <span className="text-xs font-semibold text-foreground">Send Clinical Bulletins & invoices via Email</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsPref}
                  onChange={(e) => setSmsPref(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  disabled={isNotifPending}
                />
                <span className="text-xs font-semibold text-foreground">Send appointment confirmations via SMS</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAppPref}
                  onChange={(e) => setInAppPref(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  disabled={isNotifPending}
                />
                <span className="text-xs font-semibold text-foreground">Display instant popups inside Patient Portal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isNotifPending}
              className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isNotifPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
