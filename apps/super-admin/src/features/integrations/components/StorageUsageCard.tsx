"use client";

import React from "react";
import { useStorageProviders } from "../hooks/use-integrations";
import { StorageProvider } from "../types/integrations.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { HardDrive, FileText, Image } from "lucide-react";

function StorageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct > 85 ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-success";
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{used.toFixed(1)} GB used</span>
        <span>{limit} GB total</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% used</p>
    </div>
  );
}

export function StorageUsageCard() {
  const { data: providers = [], isLoading } = useStorageProviders();

  const providerLabels: Record<string, string> = {
    "aws-s3": "AWS S3",
    "cloudinary": "Cloudinary",
    "local": "Local Storage",
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-muted/40 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map((p: StorageProvider) => (
        <div key={p.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">{providerLabels[p.provider] || p.provider}</h3>
            </div>
            <StatusBadge status={p.status} />
          </div>

          <StorageBar used={p.storageUsedGB} limit={p.storageLimitGB} />

          <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{p.totalFiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Files</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-lg font-bold text-foreground">{p.documents.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Image className="h-3.5 w-3.5 text-purple-500" />
                <p className="text-lg font-bold text-foreground">{p.images.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground">Images</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
