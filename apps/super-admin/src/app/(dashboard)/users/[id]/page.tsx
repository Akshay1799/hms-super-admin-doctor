"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusBadge } from "@/components/ui/status-badge";
import { SessionTable } from "@/features/iam/components/SessionTable";
import { LoginHistoryTable } from "@/features/iam/components/LoginHistoryTable";
import { useUser, useEnableMfa, useDisableMfa, useForceLogoutAll } from "@/features/iam/hooks/useIam";
import { ShieldCheck, ShieldAlert, KeyRound, Monitor, Shield, Calendar, Mail, Phone, Globe, Building } from "lucide-react";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { FormField } from "@/components/ui/form-field";

type ActiveTab = "overview" | "sessions" | "history" | "mfa" | "audits";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [mfaMethod, setMfaMethod] = useState<"Email OTP" | "Authenticator App" | "SMS OTP">("Email OTP");

  const { data: details, isLoading, isError } = useUser(id);
  const enableMfaMutation = useEnableMfa(id);
  const disableMfaMutation = useDisableMfa(id);
  const forceLogoutMutation = useForceLogoutAll(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading user profile...</span>
        </div>
      </PageContainer>
    );
  }

  if (isError || !details) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">User Profile Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The user account you are trying to view does not exist or has been deleted.
          </p>
        </div>
      </PageContainer>
    );
  }

  const { user, sessions, loginHistory, mfa, auditLogs } = details;
  const fullName = `${user.firstName} ${user.lastName}`;

  const getTenantName = (tId: string) => MOCK_TENANTS.find((t) => t.id === tId)?.name || `Tenant #${tId}`;
  const getHospitalName = (hId: string) => MOCK_HOSPITALS.find((h) => h.id === hId)?.name || "All Unit Access";

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "sessions", label: "Active Sessions" },
    { id: "history", label: "Login History" },
    { id: "mfa", label: "MFA Settings" },
    { id: "audits", label: "Audit Logs" },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Users", href: "/users" },
          { label: fullName },
        ]}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title={fullName}
            description={`Role: ${user.role} | Email: ${user.email}`}
          />
          <div className="flex gap-2">
            <StatusBadge status={user.status === "Pending" ? "pending" : user.status} />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-2 min-h-[400px]">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-foreground">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {[
                      { label: "Role", value: user.role, icon: Shield },
                      { label: "Tenant Account", value: getTenantName(user.tenantId), icon: Globe },
                      { label: "Hospital Scope", value: getHospitalName(user.hospitalId), icon: Building },
                      { label: "Phone", value: user.phone, icon: Phone },
                      { label: "Registered At", value: user.createdAt, icon: Calendar },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-muted/50 border border-border text-muted-foreground">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4 h-fit">
                <h3 className="text-base font-bold text-foreground">Security Summary</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">MFA Enabled</span>
                    <span className={`font-semibold ${mfa.mfaEnabled ? "text-success" : "text-muted-foreground"}`}>
                      {mfa.mfaEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Active Sessions</span>
                    <span className="font-semibold text-foreground">{sessions.length} devices</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === "sessions" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-foreground">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground">Force session terminations or terminate all devices.</p>
                </div>
                {sessions.length > 0 && (
                  <button
                    onClick={() => forceLogoutMutation.mutate()}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-destructive px-4 text-xs font-semibold text-white shadow hover:bg-destructive/90 transition-colors cursor-pointer"
                  >
                    Force Logout All
                  </button>
                )}
              </div>
              <SessionTable data={sessions} isLoading={false} />
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-foreground">Login History Logs</h3>
                <p className="text-sm text-muted-foreground">History of logins, devices, and countries.</p>
              </div>
              <LoginHistoryTable data={loginHistory} isLoading={false} />
            </div>
          )}

          {/* MFA TAB */}
          {activeTab === "mfa" && (
            <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-foreground">Multi-Factor Authentication (MFA)</h3>
                <p className="text-sm text-muted-foreground">Enable extra verification steps on account authentication logins.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-border rounded-xl bg-card space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">MFA STATUS</span>
                    <div className="flex items-center gap-2">
                      {mfa.mfaEnabled ? (
                        <ShieldCheck className="h-6 w-6 text-success" />
                      ) : (
                        <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                      )}
                      <h4 className="text-lg font-bold text-foreground">{mfa.mfaEnabled ? "MFA Active" : "MFA Inactive"}</h4>
                    </div>
                    {mfa.mfaEnabled && <p className="text-xs text-muted-foreground">Using {mfa.method} verification.</p>}
                  </div>

                  {mfa.mfaEnabled ? (
                    <button
                      onClick={() => disableMfaMutation.mutate()}
                      className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button)] border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/5 transition-colors cursor-pointer w-full"
                    >
                      Disable MFA
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <FormField
                        label="Verification Method"
                        as="select"
                        value={mfaMethod}
                        onChange={(e) => setMfaMethod(e.target.value as any)}
                      >
                        <option value="Email OTP">Email OTP</option>
                        <option value="Authenticator App">Authenticator App (TOTP)</option>
                        <option value="SMS OTP">SMS OTP</option>
                      </FormField>
                      <button
                        onClick={() => enableMfaMutation.mutate(mfaMethod)}
                        className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button)] bg-primary text-xs font-semibold text-white hover:bg-primary/95 transition-colors cursor-pointer w-full"
                      >
                        Enable MFA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === "audits" && (
            <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-foreground">Audit Timeline</h3>
                <p className="text-sm text-muted-foreground">Historical configuration audit events related to this user profile.</p>
              </div>

              <div className="pl-2">
                <ActivityTimeline
                  events={auditLogs.map((log) => ({
                    id: log.id,
                    title: log.action,
                    description: log.description,
                    time: log.timestamp,
                    type: "info" as const,
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
