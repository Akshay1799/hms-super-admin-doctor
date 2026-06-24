"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { 
  User, 
  Clock, 
  Lock, 
  Bell, 
  Palette,
  Loader2,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Profile forms
  const [profileName, setProfileName] = useState(user?.name || "Dr. Alexander Fleming");
  const [profileSpecialty, setProfileSpecialty] = useState(user?.specialty || "Cardiology");
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Availability forms
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [isAvailSaving, setIsAvailSaving] = useState(false);

  // Password forms
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPassSaving, setIsPassSaving] = useState(false);

  // Notifications toggles
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          name: profileName,
          specialty: profileSpecialty,
        });
      }
      setIsProfileSaving(false);
      toast.success("Physician profile updated successfully.");
    }, 400);
  };

  const handleAvailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAvailSaving(true);
    setTimeout(() => {
      setIsAvailSaving(false);
      toast.success("Availability schedules saved.");
    }, 400);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsPassSaving(true);
    setTimeout(() => {
      setIsPassSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Credential password updated.");
    }, 400);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Practice Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your profile, clinic hours, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Profile & Availability */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" /> Edit Physician Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <FormField
                  id="profileName"
                  label="Physician Display Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={isProfileSaving}
                />
                <FormField
                  id="profileSpecialty"
                  label="Clinical Specialty / Department"
                  value={profileSpecialty}
                  onChange={(e) => setProfileSpecialty(e.target.value)}
                  disabled={isProfileSaving}
                />
                <button
                  type="submit"
                  disabled={isProfileSaving}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isProfileSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Profile Details"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary" /> Clinical Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAvailSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    id="startTime"
                    label="Shift Starts At"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isAvailSaving}
                  />
                  <FormField
                    id="endTime"
                    label="Shift Ends At"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isAvailSaving}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAvailSaving}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isAvailSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Shifting Schedule"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Security, Preferences & Appearance */}
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-primary" /> Update Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <FormField
                  id="currentPassword"
                  type="password"
                  label="Current Password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isPassSaving}
                />
                <FormField
                  id="newPassword"
                  type="password"
                  label="Choose New Password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPassSaving}
                />
                <FormField
                  id="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPassSaving}
                />
                <button
                  type="submit"
                  disabled={isPassSaving}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPassSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Credentials"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Preferences & Appearance */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Palette className="h-4.5 w-4.5 text-primary" /> Preferences & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Theme Selector */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Theme Mode</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Toggle clinic interface color scheme.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="h-9 px-4 border border-border bg-muted/40 hover:bg-muted text-xs font-extrabold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Current: {theme}
                </button>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3.5 pt-1.5 text-xs font-semibold">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-primary" /> Notification Preferences
                </h4>
                <div className="flex items-center justify-between">
                  <label htmlFor="notifEmail" className="text-muted-foreground select-none cursor-pointer">
                    Email Alerts (Lab reports & critical updates)
                  </label>
                  <input
                    id="notifEmail"
                    type="checkbox"
                    checked={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="notifSms" className="text-muted-foreground select-none cursor-pointer">
                    SMS Direct Alerts (Emergency admissions callouts)
                  </label>
                  <input
                    id="notifSms"
                    type="checkbox"
                    checked={notifSms}
                    onChange={(e) => setNotifSms(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
