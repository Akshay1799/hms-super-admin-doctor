"use client";

import React from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { useStorageTrend, useFileDistribution } from "../hooks/use-monitoring";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted-foreground))'];

export function StorageChart() {
  const { data: trend = [], isLoading: trendLoading } = useStorageTrend();
  const { data: dist = [], isLoading: distLoading } = useFileDistribution();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Storage Usage Trend" description="Storage consumption over the last 7 days">
        <div className="h-[280px] w-full">
          {trendLoading ? (
            <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gStorage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                <Area type="monotone" dataKey="usedGB" name="Used Storage (GB)" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#gStorage)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <ChartCard title="File Type Distribution" description="Breakdown of storage by file type">
        <div className="h-[280px] w-full">
          {distLoading ? (
            <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="sizeGB"
                  nameKey="type"
                >
                  {dist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} formatter={(value: any) => [`${value} GB`, 'Size']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
