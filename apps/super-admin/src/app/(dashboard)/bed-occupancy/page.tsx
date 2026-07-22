"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useOccupancy, useClinicalAnalytics } from "@/features/clinical/hooks/useClinical";
import { OccupancyCard } from "@/features/clinical/components/OccupancyCard";
import { ChartCard } from "@/components/ui/chart-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function BedOccupancyPage() {
  const { data: occupancy, isLoading: isOccupancyLoading } = useOccupancy();
  const { data: analytics, isLoading: isAnalyticsLoading } = useClinicalAnalytics();

  const hospitalDistribution = analytics?.hospitalDistribution || [];

  const pieData = hospitalDistribution.map((h, i) => ({
    name: h.name,
    value: h.occupied,
    color: `hsl(var(--primary) / ${100 - i * 20}%)`,
  }));

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Bed Occupancy" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Bed Occupancy Supervision"
          description="Live capacity distribution, occupied vs available ICU/Emergency beds."
        />

        <OccupancyCard occupancy={occupancy} isLoading={isOccupancyLoading} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard
            title="Active Bed Allocations"
            description="Patient occupancy distribution across hospitals."
          >
            <div className="h-[300px]">
              {isAnalyticsLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius-card)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard
            title="Hospital Bed Capacities"
            description="Total physical capacity limit configured per node."
          >
            <div className="space-y-4 pt-2">
              {hospitalDistribution.map((h) => {
                const percentage = Math.round((h.occupied / h.beds) * 100);
                return (
                  <div key={h.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-foreground">{h.name}</span>
                      <span className="text-muted-foreground">{h.occupied} / {h.beds} Beds ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Master Hospital & Tenant Bed Occupancy Table */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground">Multi-Hospital & Tenant Bed Directory</h3>
            <p className="text-sm text-muted-foreground">Complete capacity distribution across all supervised healthcare facilities.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Hospital / Facility</th>
                  <th className="px-4 py-3">Total Beds</th>
                  <th className="px-4 py-3">Occupied</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">ICU Beds</th>
                  <th className="px-4 py-3">Emergency Beds</th>
                  <th className="px-4 py-3 text-right">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hospitalDistribution.map((h: any) => {
                  const rate = Math.round((h.occupied / h.beds) * 100);
                  const available = h.beds - h.occupied;
                  return (
                    <tr key={h.name} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{h.name}</td>
                      <td className="px-4 py-3 font-mono">{h.beds}</td>
                      <td className="px-4 py-3 font-mono text-amber-600 font-semibold">{h.occupied}</td>
                      <td className="px-4 py-3 font-mono text-emerald-600 font-semibold">{available}</td>
                      <td className="px-4 py-3 font-mono text-sky-600">{h.icuBeds || Math.round(h.beds * 0.15)}</td>
                      <td className="px-4 py-3 font-mono text-rose-600">{h.emergencyBeds || Math.round(h.beds * 0.05)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          rate > 85 ? "bg-rose-500/15 text-rose-600" : rate > 75 ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
