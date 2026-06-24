"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Download,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ReportsPage() {
  // Mock metrics
  const stats = {
    patientsServed: 142,
    appointmentsCompleted: 185,
    prescriptionsWritten: 96,
    followUpsCount: 52,
  };

  // Mock department trend
  const departmentData = [
    { name: "Cardiology", visits: 85 },
    { name: "Triage", visits: 42 },
    { name: "Emergency Room", visits: 25 },
    { name: "General Checkup", visits: 60 },
  ];

  // Mock monthly trends
  const monthlyData = [
    { name: "Jan", visits: 30 },
    { name: "Feb", visits: 38 },
    { name: "Mar", visits: 45 },
    { name: "Apr", visits: 52 },
    { name: "May", visits: 60 },
    { name: "Jun", visits: 72 },
  ];

  const handleExport = (type: "CSV" | "PDF") => {
    toast.success(`Report exported successfully as ${type}.`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Practice Reports</h1>
          <p className="text-sm text-muted-foreground">Analyze your clinical analytics and print summary logs.</p>
        </div>

        {/* Exports */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("CSV")}
            className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Patients Served"
          value={stats.patientsServed}
          icon={Users}
          description="Unique clinical cases"
        />
        <StatsCard
          title="Appointments Completed"
          value={stats.appointmentsCompleted}
          icon={CalendarCheck}
          description="Successful checkups"
        />
        <StatsCard
          title="Prescriptions Authorized"
          value={stats.prescriptionsWritten}
          icon={FileSpreadsheet}
          description="Digital Rx signed"
        />
        <StatsCard
          title="Follow-ups Logged"
          value={stats.followUpsCount}
          icon={Award}
          description="Scheduled this quarter"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Clinical Load" description="Visits count trend over last 6 months">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip 
                formatter={(value: any) => [`${value} patient visits`, "Visits"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Consultations by Department" description="Comparative visits volume per specialized unit">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip 
                formatter={(value: any) => [`${value} consults`, "Consultations"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="visits" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
