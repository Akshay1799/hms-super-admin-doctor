"use client";

import React from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ClinicalAnalyticsChartProps {
  data?: { name: string; occupancy: number }[];
  isLoading: boolean;
}

export function ClinicalAnalyticsChart({ data, isLoading }: ClinicalAnalyticsChartProps) {
  if (isLoading) {
    return (
      <div className="h-[350px] rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm animate-pulse flex flex-col justify-between">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-60 bg-muted rounded w-full" />
      </div>
    );
  }

  return (
    <ChartCard
      title="Bed Occupancy Trend"
      description="Platform occupancy percentage trends over the last 6 months."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} domain={[50, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius-card)",
            }}
          />
          <Line
            type="monotone"
            dataKey="occupancy"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
