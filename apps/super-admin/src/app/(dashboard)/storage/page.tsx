"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StorageUsageCard } from "@/features/integrations/components/StorageUsageCard";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useStorageProviders, useUpdateStorageProviders } from "@/features/integrations/hooks/use-integrations";
import { toast } from "sonner";

export default function StoragePage() {
  const { data: providers = [], isLoading } = useStorageProviders();
  const updateStorageProviders = useUpdateStorageProviders();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const provider = formData.get("provider") as string;
    const limit = Number(formData.get("limit") || "100");

    const newProvider = {
      id: `str-${Date.now()}`,
      provider,
      status: "active" as const,
      totalFiles: 0,
      storageUsedGB: 0,
      storageLimitGB: limit,
      documents: 0,
      images: 0,
      createdAt: new Date().toISOString(),
    };

    updateStorageProviders.mutate([...providers, newProvider], {
      onSuccess: () => {
        toast.success("Storage provider integrated successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Storage Providers"
        description="Monitor cloud and local storage usage across connected providers"
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Provider</Button>}
      />
      <div className="mt-6">
        <StorageUsageCard />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Integrate Storage Provider</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Storage Service</label>
                <select name="provider" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="aws-s3">Amazon S3 Bucket</option>
                  <option value="cloudinary">Cloudinary Media CDN</option>
                  <option value="local">Local Host Filesystem</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Storage Limit (GB)</label>
                <input required type="number" min="10" name="limit" defaultValue="500" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Provider</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
