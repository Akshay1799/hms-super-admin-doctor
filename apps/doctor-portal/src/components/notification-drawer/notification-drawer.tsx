"use client";

import React, { useState } from "react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Check, Trash2, Info, CheckCircle2, AlertTriangle, XCircle, AlertOctagon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const {
    notifications,
    isLoading,
    isError,
    unreadCount,
    markRead,
    markAllRead,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4.5 w-4.5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-4.5 w-4.5 text-warning" />;
      case "error":
        return <XCircle className="h-4.5 w-4.5 text-destructive" />;
      case "critical":
        return <AlertOctagon className="h-4.5 w-4.5 text-destructive animate-bounce" />;
      default:
        return <Info className="h-4.5 w-4.5 text-primary" />;
    }
  };

  const getBorderColor = (type: string, isRead: boolean) => {
    if (isRead) return "border-border";
    switch (type) {
      case "critical":
        return "border-l-4 border-l-destructive";
      case "error":
        return "border-l-4 border-l-destructive/70";
      case "warning":
        return "border-l-4 border-l-warning";
      case "success":
        return "border-l-4 border-l-success";
      default:
        return "border-l-4 border-l-primary";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-[420px] h-full bg-card border-l border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex gap-1.5 border border-border p-0.5 rounded-lg bg-muted/40">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-semibold cursor-pointer",
                  filter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-semibold cursor-pointer",
                  filter === "unread" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                Unread
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => markAllRead()}
                className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" /> Mark all read
              </button>
              <button
                onClick={() => clearAll()}
                className="text-muted-foreground hover:text-destructive font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading alerts...</p>
            </div>
          ) : isError ? (
            <div className="p-4 text-center space-y-3 bg-destructive/5 rounded-lg border border-destructive/10">
              <p className="text-xs text-muted-foreground">Failed to synchronize alerts.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-destructive text-white rounded text-xs font-semibold"
              >
                Retry Loading
              </button>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No notifications logs found.
            </div>
          ) : (
            displayNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markRead(notif.id);
                }}
                className={cn(
                  "p-4 rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md flex items-start gap-3.5 cursor-pointer relative",
                  getBorderColor(notif.type, notif.isRead)
                )}
              >
                <div className="shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className={cn("text-xs font-bold truncate", notif.isRead ? "text-foreground/80" : "text-foreground")}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{notif.createdAt}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
