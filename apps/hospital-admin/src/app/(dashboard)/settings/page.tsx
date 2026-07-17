"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  Settings,
  ShieldAlert,
  User,
  Building,
  Bell,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "hospital" | "notifications">("profile");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+91 9988776655",
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Configure application preferences, update admin profile parameters, and check system security levels.
      </p>

      <div className="flex gap-4 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2.5 text-xs font-bold border-b-2 px-1 cursor-pointer transition-all ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600 font-extrabold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab("hospital")}
          className={`pb-2.5 text-xs font-bold border-b-2 px-1 cursor-pointer transition-all ${
            activeTab === "hospital"
              ? "border-blue-600 text-blue-600 font-extrabold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Hospital Settings
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-2.5 text-xs font-bold border-b-2 px-1 cursor-pointer transition-all ${
            activeTab === "notifications"
              ? "border-blue-600 text-blue-600 font-extrabold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          System Notifications
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-blue-600" />
            Administrator Credentials
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Full Name</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="w-full h-10 px-3 rounded-lg border border-border bg-muted/60 text-muted-foreground cursor-not-allowed"
                value={profileData.email}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Scope / Tenant ID (Read-only)</label>
              <input
                type="text"
                disabled
                className="w-full h-10 px-3 rounded-lg border border-border bg-muted/60 text-muted-foreground cursor-not-allowed font-mono text-[11px]"
                value={user?.tenantId || "Platform"}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Hospital ID (Read-only)</label>
              <input
                type="text"
                disabled
                className="w-full h-10 px-3 rounded-lg border border-border bg-muted/60 text-muted-foreground cursor-not-allowed font-mono text-[11px]"
                value={user?.hospitalId || "N/A"}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Phone Contact</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Update Profile
            </button>
          </form>
        </div>
      )}

      {activeTab === "hospital" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-blue-600" />
            Clinic Resource Operations
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-muted/30 rounded-lg space-y-2">
              <p className="font-bold text-foreground">Accreditation status</p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                  <CheckCircle className="h-3 w-3" />
                  ISO 9001 Approved
                </span>
                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                  <CheckCircle className="h-3 w-3" />
                  JCI Certified
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-foreground">Operational Boundaries</p>
              <p className="text-muted-foreground">
                Your hospital is configured in multi-tenant mode under tenant ID <span className="font-bold text-foreground">{user?.tenantId}</span>. Core feature parameters are set globally by your Super Admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-blue-600" />
            Alert Broadcast Preferences
          </h3>
          <div className="space-y-3.5 text-xs text-foreground">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span>Send SMS alerts on critical bed shortages</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span>Email daily financial reports to hospital billing admin</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span>In-app notifications for security events</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
