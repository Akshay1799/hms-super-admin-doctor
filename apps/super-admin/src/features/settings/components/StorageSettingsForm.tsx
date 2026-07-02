"use client";

import React, { useState, useEffect } from "react";
import { useStorageSettings, useUpdateStorageSettings } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function StorageSettingsForm() {
  const { data: storage, isLoading } = useStorageSettings();
  const updateStorage = useUpdateStorageSettings();
  const [backupEnabled, setBackupEnabled] = useState(false);

  useEffect(() => {
    if (storage) {
      setBackupEnabled(storage.backupEnabled);
    }
  }, [storage]);

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!storage) return null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateStorage.mutate({
      provider: formData.get("provider") as string,
      bucketName: formData.get("bucketName") as string,
      retentionDays: Number(formData.get("retentionDays")),
      maxFileSizeMB: Number(formData.get("maxFileSizeMB")),
      backupEnabled,
    }, {
      onSuccess: () => {
        toast.success("Storage configurations saved successfully.");
      },
      onError: () => {
        toast.error("Failed to save storage settings.");
      }
    });
  };

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Storage Provider</label>
        <select name="provider" defaultValue={storage.provider} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="s3">Amazon S3</option>
          <option value="cloudinary">Cloudinary</option>
          <option value="local">Local Filesystem</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bucket Name</label>
        <input type="text" name="bucketName" defaultValue={storage.bucketName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Default Retention (Days)</label>
          <input type="number" name="retentionDays" defaultValue={storage.retentionDays} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Max File Size (MB)</label>
          <input type="number" name="maxFileSizeMB" defaultValue={storage.maxFileSizeMB} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>
      <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
        <div>
          <p className="text-sm font-medium text-foreground">Enable Automated Backups</p>
          <p className="text-xs text-muted-foreground">Perform daily snapshots of all storage buckets</p>
        </div>
        <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={updateStorage.isPending}>
          {updateStorage.isPending ? "Saving..." : "Save Storage Configuration"}
        </Button>
      </div>
    </form>
  );
}
