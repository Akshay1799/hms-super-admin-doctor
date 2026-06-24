"use client";

import React, { useState, useEffect } from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Cardiology", revenue: 450000 },
  { name: "Neurology", revenue: 380000 },
  { name: "Orthopedics", revenue: 320000 },
  { name: "Radiology", revenue: 290000 },
];

export function DepartmentRevenueChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ChartCard
        title="Department Revenues"
        description="Comparative analysis of major clinical departments monthly contribution."
      >
        <div className="h-full w-full bg-muted/10 animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">
          Loading Department revenues...
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Department Revenues"
      description="Comparative analysis of major clinical departments monthly contribution."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius-card)",
            }}
          />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
