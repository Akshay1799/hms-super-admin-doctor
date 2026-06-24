"use client";

import React from "react";
import { useActivityTimeline } from "../hooks/use-audit";
import { ActivityEvent } from "../types/audit.types";
import { Circle } from "lucide-react";

export function ActivityTimeline() {
  const { data: events = [], isLoading } = useActivityTimeline();

  if (isLoading) {
    return (
      <div className="space-y-6 pl-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-border space-y-8 py-4">
      {events.map((event: ActivityEvent) => (
        <div key={event.id} className="relative">
          <div className="absolute -left-[31px] top-1 bg-card rounded-full p-1 border border-border">
            <Circle className="h-3 w-3 fill-primary text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-foreground">{event.action}</p>
              <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-sm text-foreground">{event.description}</p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Actor: {event.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
