import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  icon?: React.ReactNode;
  type?: "info" | "success" | "warning" | "destructive";
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const badgeStyles = {
    info: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className={cn("flow-root", className)}>
      <ul role="list" className="-mb-8">
        {events.map((event, index) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {index !== events.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={cn(
                      "h-8 w-8 rounded-full border flex items-center justify-center ring-8 ring-card",
                      event.type ? badgeStyles[event.type] : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {event.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.description}
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-muted-foreground">
                    <time dateTime={event.time}>{event.time}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
