"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePatient } from "@/features/clinical/hooks/useClinical";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { AppointmentTable } from "@/features/clinical/components/AppointmentTable";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import {
  ArrowLeft,
  Calendar,
  Activity,
  Heart,
  CalendarRange,
  ClipboardList,
  FileCheck,
  User,
} from "lucide-react";
import { ActivityTimeline } from "@/components/ui/activity-timeline";

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: details, isLoading, error } = usePatient(id as string);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "admissions">("overview");

  if (isLoading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-28 bg-card border border-border rounded-xl p-6 flex gap-4" />
          <div className="h-10 bg-muted rounded w-96" />
          <div className="h-64 bg-card border border-border rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !details) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-destructive font-semibold">Patient profile not found or failed to load.</p>
          <button
            onClick={() => router.push("/patients")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Supervision List
          </button>
        </div>
      </PageContainer>
    );
  }

  const { patient, appointments, admissions, doctors, timeline } = details;
  const hospitalName = MOCK_HOSPITALS.find((h) => h.id === patient.hospitalId)?.name || `Hospital #${patient.hospitalId}`;
  const primaryPhysician = doctors[0]?.name || "Unassigned";

  const tabs = [
    { id: "overview", label: "Supervision Overview", icon: Activity },
    { id: "appointments", label: "Appointments History", icon: Calendar, badge: appointments.length.toString() },
    { id: "admissions", label: "Admissions Timeline", icon: ClipboardList, badge: admissions.length.toString() },
  ] as const;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Clinical Oversight" },
          { label: "Patients", href: "/patients" },
          { label: patient.name },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="relative bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute top-0 right-0 p-4">
            <StatusBadge status={patient.status} />
          </div>
          <Avatar fallback={patient.name} size="lg" className="h-20 w-20 text-xl font-bold bg-primary/10 text-primary border border-primary/20" />
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
              <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border">
                Blood Group: {patient.bloodGroup}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{hospitalName}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground pt-1">
              <span>Age: <strong className="text-foreground">{patient.age} Yrs</strong></span>
              <span>•</span>
              <span>Gender: <strong className="text-foreground">{patient.gender}</strong></span>
              <span>•</span>
              <span>Primary Doctor: <strong className="text-primary">{primaryPhysician}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-border overflow-x-auto gap-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {"badge" in tab && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-primary/25 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="flex flex-col gap-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-base font-bold text-foreground mb-4">Patient Journey Timeline</h3>
                  <ActivityTimeline
                    events={timeline.map((item) => ({
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      time: item.date,
                    }))}
                  />
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4 h-fit">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-destructive" />
                  Clinical Metrics
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Blood Type</span>
                    <span className="font-semibold text-foreground">{patient.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Last Visit</span>
                    <span className="font-mono font-semibold text-foreground">{patient.lastVisit}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Physician ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{patient.doctorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access Scope</span>
                    <span className="font-semibold text-success flex items-center gap-1">
                      <FileCheck className="h-4 w-4" /> READ-ONLY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Appointments History</h3>
              <AppointmentTable data={appointments} isLoading={false} />
            </div>
          )}

          {activeTab === "admissions" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-foreground">Clinical Admissions Log</h3>
              <div className="grid grid-cols-1 gap-4">
                {admissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No admissions logs recorded.</p>
                ) : (
                  admissions.map((adm) => (
                    <div key={adm.id} className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">Admission ID: {adm.id}</span>
                          <span className="inline-flex items-center rounded-md bg-info/10 px-2 py-0.5 text-xs font-semibold text-info">
                            {adm.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Location: {adm.hospitalName}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <span className="text-xs text-muted-foreground">Admitted: <strong className="font-mono text-foreground">{adm.admissionDate}</strong></span>
                        {adm.dischargeDate ? (
                          <span className="text-xs text-muted-foreground">Discharged: <strong className="font-mono text-foreground">{adm.dischargeDate}</strong></span>
                        ) : (
                          <span className="text-xs text-success font-semibold">Active In-patient</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
