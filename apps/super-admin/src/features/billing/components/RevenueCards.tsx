"use client";

import React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { DollarSign, TrendingUp, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useRevenueMetrics } from "../hooks/use-billing";

export function RevenueCards() {
  const { data: metrics = [], isLoading } = useRevenueMetrics();

  const getIcon = (metricName: string) => {
    switch (metricName) {
      case "Monthly Revenue": return DollarSign;
      case "MRR": return TrendingUp;
      case "ARR": return Activity;
      case "Collections": return CreditCard;
      case "Outstanding Amount": return ArrowUpRight;
      case "Refunds": return ArrowDownRight;
      default: return DollarSign;
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <StatsCard
          key={metric.id}
          title={metric.metric}
          value={formatCurrency(metric.value, metric.currency)}
          icon={getIcon(metric.metric)}
          description="vs last month"
          trend={{
            value: `${metric.percentageChange}%`,
            type: metric.trend,
          }}
        />
      ))}
    </div>
  );
}
