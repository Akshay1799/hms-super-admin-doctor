"use client";

import React from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { useUptimeTrend } from "../hooks/use-monitoring";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function UptimeChart() {
  const { data: trend = [], isLoading } = useUptimeTrend();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Availability Trend" description="Platform uptime over the last 7 days">
        <div className="h-[280px] w-full">
          {isLoading ? (
            <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUptime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 1', 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} formatter={(value: any) => [`${value}%`, 'Uptime']} />
                <Area type="monotone" dataKey="uptime" name="Uptime %" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#gUptime)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <ChartCard title="Response Time" description="Average system response time">
        <div className="h-[280px] w-full">
          {isLoading ? (
            <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} formatter={(value: any) => [`${value}ms`, 'Response Time']} />
                <Line type="monotone" dataKey="responseTime" name="Latency (ms)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
