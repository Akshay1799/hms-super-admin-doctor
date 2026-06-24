"use client";

import React from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { useDeliveryTrend, useChannelDistribution } from "../hooks/useNotifications";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";

export function AnalyticsCharts() {
  const { data: trend = [], isLoading: trendLoading } = useDeliveryTrend();
  const { data: channels = [], isLoading: channelsLoading } = useChannelDistribution();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <ChartCard title="Delivery Trend" description="Sent, Delivered, and Failed over last 7 days">
        <div className="h-[280px] w-full">
          {trendLoading ? (
            <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="sent" name="Sent" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#gSent)" />
                <Area type="monotone" dataKey="delivered" name="Delivered" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#gDelivered)" />
                <Area type="monotone" dataKey="failed" name="Failed" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#gFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <ChartCard title="Channel Usage" description="Notifications sent per channel">
        <div className="h-[280px] w-full">
          {channelsLoading ? (
            <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="channel" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="sent" name="Sent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="delivered" name="Delivered" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="failed" name="Failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
