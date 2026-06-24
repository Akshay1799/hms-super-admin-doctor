"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApiEndpoints } from "../hooks/use-monitoring";
import { ApiEndpointHealth } from "../types/monitoring.types";

export function ApiLatencyTable() {
  const { data: endpoints = [], isLoading } = useApiEndpoints();

  function LatencyPill({ ms, threshold = 200 }: { ms: number; threshold?: number }) {
    const color = ms < threshold ? "text-success" : ms < threshold * 3 ? "text-warning" : "text-destructive";
    return <span className={`font-mono text-sm font-medium ${color}`}>{ms}ms</span>;
  }

  const columns = [
    { header: "Endpoint", accessor: (row: ApiEndpointHealth) => (
      <code className="text-sm font-mono text-foreground">{row.endpoint}</code>
    )},
    { header: "Method", accessor: (row: ApiEndpointHealth) => (
      <span className="text-xs font-bold text-primary">{row.method}</span>
    )},
    { header: "Avg Latency", accessor: (row: ApiEndpointHealth) => <LatencyPill ms={row.avgLatencyMs} /> },
    { header: "P95 Latency", accessor: (row: ApiEndpointHealth) => <LatencyPill ms={row.p95LatencyMs} threshold={400} /> },
    { header: "Req/Min", accessor: (row: ApiEndpointHealth) => row.requestsPerMinute.toLocaleString() },
    {
      header: "Error %",
      accessor: (row: ApiEndpointHealth) => (
        <span className={`font-mono text-sm ${row.errorRate > 2 ? "text-destructive font-bold" : row.errorRate > 0.5 ? "text-warning" : "text-success"}`}>
          {row.errorRate.toFixed(1)}%
        </span>
      ),
    },
    {
      header: "Success %",
      accessor: (row: ApiEndpointHealth) => (
        <span className={`font-mono text-sm font-medium ${row.successRate >= 99 ? "text-success" : row.successRate >= 97 ? "text-warning" : "text-destructive"}`}>
          {row.successRate.toFixed(1)}%
        </span>
      ),
    },
    { header: "Status", accessor: (row: ApiEndpointHealth) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={endpoints} isLoading={isLoading} />;
}
