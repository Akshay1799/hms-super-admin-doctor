"use client";

import React, { useState } from "react";
import { useApiKeys, useUpdateApiKeys } from "../hooks/use-integrations";
import { ApiKey } from "../types/integrations.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCw, Power, Trash2 } from "lucide-react";
import { AppTable } from "@/components/ui/app-table";
import { toast } from "sonner";

export function ApiKeyTable() {
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const updateApiKeys = useUpdateApiKeys();
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleRotate = (id: string) => {
    const updated = apiKeys.map((k: any) => {
      if (k.id === id) {
        const rand = Math.random().toString(36).substring(7).toUpperCase();
        const prefix = k.keyMasked.split("••••")[0] || "key_";
        const keyMasked = `${prefix}••••••••••••••••••••••••${rand}`;
        toast.success(`Key rotated successfully for ${k.service}.`);
        return { ...k, keyMasked, lastUsed: new Date().toISOString() };
      }
      return k;
    });
    updateApiKeys.mutate(updated);
  };

  const handleToggle = (id: string) => {
    const updated = apiKeys.map((k: any) => {
      if (k.id === id) {
        const nextStatus = k.status === "active" ? "inactive" : "active";
        toast.success(`Key status set to ${nextStatus}.`);
        return { ...k, status: nextStatus };
      }
      return k;
    });
    updateApiKeys.mutate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = apiKeys.filter((k: any) => k.id !== id);
    updateApiKeys.mutate(updated, {
      onSuccess: () => {
        toast.success("API key deleted.");
      }
    });
  };

  const columns = [
    { header: "Service", accessor: (row: ApiKey) => <span className="font-semibold text-foreground">{row.service}</span> },
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
    { header: "Last Used", accessor: (row: ApiKey) => row.lastUsed ? new Date(row.lastUsed).toLocaleString() : "Never" },
    {
      header: "Actions",
      accessor: (row: ApiKey) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleRotate(row.id)} title="Rotate Key"><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleToggle(row.id)} title="Enable/Disable"><Power className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={apiKeys} isLoading={isLoading} />;
}
