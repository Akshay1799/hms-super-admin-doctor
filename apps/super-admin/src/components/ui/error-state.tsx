import React from "react";
import { AlertCircle, Lock, ShieldAlert, WifiOff, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorType = "network" | "server" | "unauthorized" | "forbidden" | "notfound";

interface ErrorStateProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ type = "server", message, onRetry, className }: ErrorStateProps) {
  const configs = {
    network: {
      title: "Network Connection Failed",
      desc: message || "We couldn't connect to the server. Please check your internet connection.",
      icon: <WifiOff className="h-10 w-10 text-destructive" />,
    },
    server: {
      title: "Internal Server Error",
      desc: message || "An unexpected error occurred on the server. Please try again later.",
      icon: <AlertCircle className="h-10 w-10 text-destructive" />,
    },
    unauthorized: {
      title: "Unauthorized Access",
      desc: message || "You must login to view this content.",
      icon: <Lock className="h-10 w-10 text-destructive" />,
    },
    forbidden: {
      title: "Access Forbidden",
      desc: message || "You do not have the required permissions to access this page.",
      icon: <ShieldAlert className="h-10 w-10 text-destructive" />,
    },
    notfound: {
      title: "Resource Not Found",
      desc: message || "The resource you are looking for does not exist or has been moved.",
      icon: <FileSearch className="h-10 w-10 text-destructive" />,
    },
  };

  const current = configs[type] || configs.server;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-[var(--radius-card)] border border-destructive/20 bg-destructive/5 min-h-[320px] max-w-md mx-auto space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
        {current.icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground">{current.title}</h3>
        <p className="text-xs text-muted-foreground max-w-xs">{current.desc}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="h-10 px-4 rounded-[var(--radius-button)] bg-destructive hover:bg-destructive/90 text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}
