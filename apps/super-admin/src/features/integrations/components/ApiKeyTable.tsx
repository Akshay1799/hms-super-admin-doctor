"use client";

import React, { useState } from "react";
import { useApiKeys } from "../hooks/use-integrations";
import { ApiKey } from "../types/integrations.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCw, Power, Trash2 } from "lucide-react";
import { AppTable } from "@/components/ui/app-table";

export function ApiKeyTable() {
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const columns = [
    { header: "Service", accessor: (row: ApiKey) => <span className="font-medium text-foreground">{row.service}</span> },
    { header: "Environment", accessor: (row: ApiKey) => <StatusBadge status={row.environment} /> },
    {
      header: "Key (Masked)",
      accessor: (row: ApiKey) => (
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            {revealedKeys.has(row.id) ? row.keyMasked : "••••••••••••••••••••••••••••"}
          </code>
          <button onClick={() => toggleReveal(row.id)} className="text-muted-foreground hover:text-foreground cursor-pointer">
            {revealedKeys.has(row.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      ),
    },
    { header: "Status", accessor: (row: ApiKey) => <StatusBadge status={row.status} /> },
    { header: "Last Used", accessor: (row: ApiKey) => new Date(row.lastUsed).toLocaleString() },
    {
      header: "Actions",
      accessor: (row: ApiKey) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Rotate Key"><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="Enable/Disable"><Power className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={apiKeys} isLoading={isLoading} />;
}
