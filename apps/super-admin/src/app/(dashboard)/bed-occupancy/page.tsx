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
      </div>
    </PageContainer>
  );
}
