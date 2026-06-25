"use client";

import React, { useState } from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data?: any[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function RevenueChart({ data, isLoading, isError, onRetry }: RevenueChartProps) {
  const [metric, setMetric] = useState<"all" | "revenue" | "expenses">("all");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return <LoadingSkeleton type="chart" />;
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-[var(--radius-card)] p-12 text-center space-y-3 min-h-[300px] flex flex-col justify-center items-center">
        <p className="text-sm text-destructive font-semibold">Failed to load revenue analytics.</p>
        <button
          onClick={onRetry}
          className="h-10 px-4 bg-destructive text-white rounded-[var(--radius-button)] font-semibold cursor-pointer text-xs"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <ChartCard
      title="Revenue Trend"
      description="Comparative analysis of subscription revenues, collection rates, and operating expenses."
      actions={
        <div className="flex gap-1.5 border border-border p-0.5 rounded-lg bg-muted/40 text-xs">
          <button
            onClick={() => setMetric("all")}
            className={`px-2 py-1 rounded-md font-semibold cursor-pointer ${metric === "all" ? "bg-card text-foreground" : "text-muted-foreground"}`}
          >
            All
          </button>
          <button
            onClick={() => setMetric("revenue")}
            className={`px-2 py-1 rounded-md font-semibold cursor-pointer ${metric === "revenue" ? "bg-card text-foreground" : "text-muted-foreground"}`}
          >
            Revenue
          </button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius-card)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          
          {(metric === "all" || metric === "revenue") && (
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          )}
          {metric === "all" && (
            <Line type="monotone" dataKey="collections" name="Collections" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
          )}
          {(metric === "all" || metric === "expenses") && (
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
