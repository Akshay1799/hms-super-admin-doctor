"use client";

import React from "react";
import { useStorageSettings } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function StorageSettingsForm() {
  const { data: storage, isLoading } = useStorageSettings();

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!storage) return null;

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Storage Provider</label>
        <select defaultValue={storage.provider} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="s3">Amazon S3</option>
          <option value="cloudinary">Cloudinary</option>
          <option value="local">Local Filesystem</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bucket Name</label>
        <input type="text" defaultValue={storage.bucketName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Default Retention (Days)</label>
          <input type="number" defaultValue={storage.retentionDays} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Max File Size (MB)</label>
          <input type="number" defaultValue={storage.maxFileSizeMB} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>
      <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
        <div>
          <p className="text-sm font-medium text-foreground">Enable Automated Backups</p>
          <p className="text-xs text-muted-foreground">Perform daily snapshots of all storage buckets</p>
        </div>
        <Switch defaultChecked={storage.backupEnabled} />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit">Save Storage Configuration</Button>
      </div>
    </form>
  );
}
