"use client";

import React from "react";
import { useDashboard, useWeeklyAppointmentTrend, useAdmissionTrend } from "@/features/dashboard/hooks/useDashboard";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Plus, 
  FilePlus, 
  CalendarPlus, 
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  FileText
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  const { data: appointmentsTrend, isLoading: isAppointmentsLoading, error: appointmentsError } = useWeeklyAppointmentTrend();
  const { data: patientsTrend, isLoading: isPatientsLoading, error: patientsError } = useAdmissionTrend();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = isDashboardLoading || isAppointmentsLoading || isPatientsLoading || !mounted;
  const error = dashboardError || appointmentsError || patientsError;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[380px] bg-muted animate-pulse rounded-xl" />
          <div className="h-[380px] bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboardData || !appointmentsTrend || !patientsTrend) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Failed to load dashboard metrics</h2>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const { metrics, alerts, prescriptions } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Clinical Dashboard</h1>
        <p className="text-sm text-muted-foreground">Practice metrics overview, alerts, and patient logs.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Appointments"
          value={metrics.todaysAppointments}
          icon={Calendar}
          description="Scheduled consultations"
          trend={{ value: "15%", type: "up" }}
        />
        <StatsCard
          title="Waiting Patients"
          value={metrics.waitingPatients}
          icon={Clock}
          description="Awaiting in triage"
          trend={{ value: "2", type: "down" }}
        />
        <StatsCard
          title="Critical Patients"
          value={metrics.criticalPatients}
          icon={AlertOctagon}
          description="Requires immediate oversight"
          className="border-l-4 border-l-destructive"
        />
        <StatsCard
          title="Follow-ups Scheduled"
          value={metrics.followUpsCount}
          icon={UserCheck}
          description="For this week"
          trend={{ value: "4%", type: "up" }}
        />
      </div>

      {/* Main Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="Weekly Appointments Trend"
            description="Daily consultation workloads for this week"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentsTrend} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip 
                  formatter={(value: any) => [`${value} appointments`, "Appointments"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Admissions Trend"
            description="Monthly patient admissions count"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientsTrend} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip 
                  formatter={(value: any) => [`${value} admitted`, "Patients"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="admitted" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right Sidebar: Critical Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4.5 w-4.5" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs font-semibold ${
                    alert.severity === "critical" 
                      ? "bg-destructive/10 border-destructive/20 text-destructive" 
                      : "bg-warning/10 border-warning/20 text-warning"
                  }`}
                >
                  <AlertOctagon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{alert.patientName}</p>
                    <p className="opacity-90 font-medium text-[11px] mt-0.5">{alert.alertText}</p>
                  </div>
                  <Link 
                    href={ROUTES.patient360(alert.patientId)}
                    className="hover:underline shrink-0 text-xxs font-bold uppercase tracking-wider text-right flex items-center gap-0.5 mt-0.5"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link 
                href={ROUTES.patients}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Search Patient Directory
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link 
                href={ROUTES.appointments}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4 text-primary" />
                  Schedule Follow-up
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Prescriptions Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Prescriptions
          </CardTitle>
          <Link href={ROUTES.patients} className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
            New Prescription <Plus className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Patient</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Medication</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Dosage Instruction</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Prescribed On</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {prescriptions.map((pres) => (
                  <tr key={pres.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-bold text-foreground">{pres.patientName}</td>
                    <td className="p-4 text-muted-foreground font-semibold">{pres.medication}</td>
                    <td className="p-4 text-muted-foreground">{pres.dosage}</td>
                    <td className="p-4 text-muted-foreground">{pres.date}</td>
                    <td className="p-4 text-right">
                      <Link 
                        href={ROUTES.patient360(pres.patientId)}
                        className="text-primary font-bold hover:underline"
                      >
                        Patient Chart
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
