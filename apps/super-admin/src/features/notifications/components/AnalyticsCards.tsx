"use client";

import React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { useNotificationAnalytics } from "../hooks/useNotifications";
import { Send, CheckCircle, XCircle, Eye, MousePointerClick, BookOpen } from "lucide-react";

export function AnalyticsCards() {
  const { data: analytics, isLoading } = useNotificationAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const cards = [
    { title: "Total Sent", value: analytics.totalSent.toLocaleString(), icon: Send, trendValue: "", trendType: "neutral" as const },
    { title: "Delivered", value: analytics.delivered.toLocaleString(), icon: CheckCircle, trendValue: `${((analytics.delivered / analytics.totalSent) * 100).toFixed(1)}%`, trendType: "up" as const },
    { title: "Failed", value: analytics.failed.toLocaleString(), icon: XCircle, trendValue: `${((analytics.failed / analytics.totalSent) * 100).toFixed(1)}%`, trendType: "down" as const },
    { title: "Read Rate", value: `${analytics.readRate}%`, icon: BookOpen, trendValue: "", trendType: "neutral" as const },
    { title: "Open Rate", value: `${analytics.openRate}%`, icon: Eye, trendValue: "", trendType: "neutral" as const },
    { title: "Click-Through Rate", value: `${analytics.ctr}%`, icon: MousePointerClick, trendValue: "", trendType: "neutral" as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          trend={card.trendValue ? { value: card.trendValue, type: card.trendType } : undefined}
        />
      ))}
    </div>
  );
}
