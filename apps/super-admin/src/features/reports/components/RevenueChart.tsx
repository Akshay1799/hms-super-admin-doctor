"use client";

import React from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { useRevenueTrend } from "../hooks/use-reports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function RevenueChart() {
  const { data: trend = [], isLoading } = useRevenueTrend();

  return (
    <ChartCard title="Revenue vs Collections" description="Monthly breakdown of billed revenue vs actual collections">
      <div className="h-[320px] w-full">
        {isLoading ? (
          <div className="h-full bg-muted/30 animate-pulse rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 20, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} 
                itemStyle={{ color: "hsl(var(--foreground))" }} 
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, undefined]} 
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="revenue" name="Billed Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collections" name="Actual Collections" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
