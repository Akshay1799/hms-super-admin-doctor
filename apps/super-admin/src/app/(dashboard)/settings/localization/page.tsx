"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LocalizationSettingsPage() {
  const [lang, setLang] = useState("en");
  const [tz, setTz] = useState("Asia/Kolkata (IST)");
  const [dateFmt, setDateFmt] = useState("DD/MM/YYYY");
  const [timeFmt, setTimeFmt] = useState("12-Hour (AM/PM)");
  const [currency, setCurrency] = useState("INR (₹)");
  const [startDay, setStartDay] = useState("Monday");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("hms_local_lang") || "en");
      setTz(localStorage.getItem("hms_local_tz") || "Asia/Kolkata (IST)");
      setDateFmt(localStorage.getItem("hms_local_date_fmt") || "DD/MM/YYYY");
      setTimeFmt(localStorage.getItem("hms_local_time_fmt") || "12-Hour (AM/PM)");
      setCurrency(localStorage.getItem("hms_local_currency") || "INR (₹)");
      setStartDay(localStorage.getItem("hms_local_start_day") || "Monday");
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("hms_local_lang", lang);
      localStorage.setItem("hms_local_tz", tz);
      localStorage.setItem("hms_local_date_fmt", dateFmt);
      localStorage.setItem("hms_local_time_fmt", timeFmt);
      localStorage.setItem("hms_local_currency", currency);
      localStorage.setItem("hms_local_start_day", startDay);
      setSaving(false);
      toast.success("Localization settings updated successfully.");
    }, 300);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Localization"
        description="Configure default regional preferences, language, and date/time formats"
      />
      <div className="mt-6">
        <SettingsCard title="Regional Preferences">
          <form className="space-y-6 max-w-2xl" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Default Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <select value={tz} onChange={(e) => setTz(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date Format</label>
                <select value={dateFmt} onChange={(e) => setDateFmt(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time Format</label>
                <select value={timeFmt} onChange={(e) => setTimeFmt(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="12-Hour (AM/PM)">12-Hour (AM/PM)</option>
                  <option value="24-Hour">24-Hour</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Day of Week</label>
                <select value={startDay} onChange={(e) => setStartDay(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Localization"}
              </Button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
