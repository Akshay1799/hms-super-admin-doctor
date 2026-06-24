"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AppointmentTable } from "@/features/clinical/components/AppointmentTable";
import { useAppointments } from "@/features/clinical/hooks/useClinical";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { StatsCard } from "@/components/ui/stats-card";
import { Calendar, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function AppointmentsPage() {
  const [hospitalId, setHospitalId] = useState("");
  const [status, setStatus] = useState("");

  const { data: appointments = [], isLoading } = useAppointments({
    hospitalId: hospitalId || undefined,
    status: status || undefined,
  });

  // Calculate quick stats based on full list (before status filters)
  const { data: allAppointments = [] } = useAppointments({
    hospitalId: hospitalId || undefined,
  });

  const completed = allAppointments.filter((a) => a.status === "Completed").length;
  const pending = allAppointments.filter((a) => a.status === "Pending").length;
  const rescheduled = allAppointments.filter((a) => a.status === "Rescheduled").length;
  const cancelled = allAppointments.filter((a) => a.status === "Cancelled").length;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Appointments" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Clinical Consultations & Appointments"
          description="Platform-wide clinical scheduler monitoring patient visits and booking completions."
        />

        {/* Quick KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Completed"
            value={completed}
            icon={CheckCircle2}
            description="Visits fulfilled successfully"
            className="border-success/30"
          />
          <StatsCard
            title="Pending Approval"
            value={pending}
            icon={Calendar}
            description="Upcoming appointments"
            className="border-primary/30"
          />
          <StatsCard
            title="Rescheduled"
            value={rescheduled}
            icon={AlertCircle}
            description="Adjusted consultation slots"
            className="border-warning/30"
          />
          <StatsCard
            title="Cancelled"
            value={cancelled}
            icon={XCircle}
            description="Cancelled sessions"
            className="border-destructive/30"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border rounded-xl p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Hospital Location</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Locations</option>
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Appointment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <AppointmentTable data={appointments} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
