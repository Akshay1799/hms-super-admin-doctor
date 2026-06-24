"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useDoctor } from "@/features/clinical/hooks/useClinical";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { AppointmentTable } from "@/features/clinical/components/AppointmentTable";
import { PatientTable } from "@/features/clinical/components/PatientTable";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import {
  ArrowLeft,
  Calendar,
  Users,
  Award,
  Clock,
  ThumbsUp,
  FileText,
  Activity,
  Heart,
  TrendingUp,
} from "lucide-react";
import { ActivityTimeline } from "@/components/ui/activity-timeline";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: details, isLoading, error } = useDoctor(id as string);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "patients" | "schedule">("overview");

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
          <p className="text-destructive font-semibold">Doctor profile not found or failed to load.</p>
          <button
            onClick={() => router.push("/doctors")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Registry
          </button>
        </div>
      </PageContainer>
    );
  }

  const { doctor, appointments, patients, auditLogs } = details;
  const hospitalName = MOCK_HOSPITALS.find((h) => h.id === doctor.hospitalId)?.name || `Hospital #${doctor.hospitalId}`;

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "appointments", label: "Appointments", icon: Calendar, badge: appointments.length.toString() },
    { id: "patients", label: "Patients", icon: Users, badge: patients.length.toString() },
    { id: "schedule", label: "Schedule & Slots", icon: Clock },
  ] as const;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Clinical Oversight" },
          { label: "Doctors", href: "/doctors" },
          { label: doctor.name },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* Header Profile Card */}
        <div className="relative bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute top-0 right-0 p-4">
            <StatusBadge status={doctor.status === "On Leave" ? "pending" : doctor.status} />
          </div>
          <Avatar fallback={doctor.name} size="lg" className="h-20 w-20 text-xl font-bold bg-primary/10 text-primary border border-primary/20" />
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold text-foreground">{doctor.name}</h1>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {doctor.specialization}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{hospitalName}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground pt-1">
              <span>Experience: <strong className="text-foreground">{doctor.experience} Yrs</strong></span>
              <span>•</span>
              <span>Rating: <strong className="text-foreground">{doctor.rating} ★</strong></span>
              <span>•</span>
              <span>Success Rate: <strong className="text-success">{doctor.successRate}%</strong></span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
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

        {/* Tab Contents */}
        <div className="flex flex-col gap-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-foreground">Clinical Performance Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-border rounded-lg p-4 bg-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">Consultation Time</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{doctor.consultationTime} mins</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Average slot length</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <ThumbsUp className="h-4 w-4 text-success" />
                        <span className="text-xs font-semibold">Overall Satisfaction</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{doctor.successRate}%</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Based on ratings</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4 text-info" />
                        <span className="text-xs font-semibold">Total Patients</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{doctor.patientsCount}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Assigned lifetime patients</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-base font-bold text-foreground mb-4">Verification Audit Trails</h3>
                  <ActivityTimeline
                    events={auditLogs.map((log) => ({
                      id: log.id,
                      title: log.action,
                      description: log.description,
                      time: log.timestamp,
                    }))}
                  />
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4 h-fit">
                <h3 className="text-base font-bold text-foreground">Governance Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">License Validation</span>
                    <span className="font-semibold text-success flex items-center gap-1">
                      <Award className="h-4 w-4" /> Active
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Department Node</span>
                    <span className="font-semibold text-foreground">dep-1</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Physical Branch</span>
                    <span className="font-semibold text-foreground">b-1</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Credential Verification</span>
                    <span className="font-mono text-xs text-muted-foreground">AUTO-VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Schedules & Wait Lists</h3>
              <AppointmentTable data={appointments} isLoading={false} />
            </div>
          )}

          {activeTab === "patients" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Active & Supervising Patients</h3>
              <PatientTable data={patients} isLoading={false} />
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-foreground mb-1">Standard Operating Hours</h3>
              <p className="text-sm text-muted-foreground mb-6">Default consultation hours mapped for patient portals.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <div key={day} className="border border-border rounded-lg p-4 bg-muted/30 text-center">
                    <span className="text-xs font-bold text-foreground block mb-2">{day}</span>
                    <span className="text-xs font-mono text-muted-foreground">09:00 - 17:00</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
