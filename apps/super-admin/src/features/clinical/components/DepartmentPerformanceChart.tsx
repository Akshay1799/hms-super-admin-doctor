"use client";

import React from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DepartmentPerformanceProps {
  data?: { name: string; appointments: number; rating: number }[];
  isLoading: boolean;
}

export function DepartmentPerformanceChart({ data, isLoading }: DepartmentPerformanceProps) {
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
      title="Department Appointments & Ratings"
      description="Comparison of monthly consultation loads and patient satisfaction ratings."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius-card)",
            }}
            formatter={(value: any, name: any) => {
              if (name === "rating") return [`${value} ★`, "Satisfaction Rating"];
              return [value, "Appointments"];
            }}
          />
          <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
