"use client";

import React from "react";
import { useDatabaseHealth } from "../hooks/use-monitoring";
import { DatabaseHealth } from "../types/monitoring.types";
import { Database, Activity, HardDrive, Cpu, MemoryStick, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export function DatabaseHealthCard() {
  const { data: databases = [], isLoading } = useDatabaseHealth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-muted/40 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {databases.map((db: DatabaseHealth) => (
        <div key={db.id} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{db.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{db.type}</p>
              </div>
            </div>
            <StatusBadge status={db.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Connections</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {db.connections} <span className="text-sm font-normal text-muted-foreground">/ {db.maxConnections}</span>
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Queries / sec</span>
              </div>
              <p className="text-lg font-bold text-foreground">{db.queriesPerSecond.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <HardDrive className="h-4 w-4" />
                <span className="text-xs font-medium">Storage</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {db.storageUsedGB} <span className="text-sm font-normal text-muted-foreground">/ {db.storageLimitGB} GB</span>
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Cpu className="h-4 w-4" />
                <span className="text-xs font-medium">CPU</span>
              </div>
              <p className={`text-lg font-bold ${db.cpuUsage > 80 ? "text-destructive" : db.cpuUsage > 60 ? "text-warning" : "text-success"}`}>
                {db.cpuUsage}%
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <MemoryStick className="h-4 w-4" />
                <span className="text-xs font-medium">Memory</span>
              </div>
              <p className={`text-lg font-bold ${db.memoryUsage > 80 ? "text-destructive" : db.memoryUsage > 60 ? "text-warning" : "text-success"}`}>
                {db.memoryUsage}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
