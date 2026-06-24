import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StorageUsageCard } from "@/features/integrations/components/StorageUsageCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StoragePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Storage Providers"
        description="Monitor cloud and local storage usage across connected providers"
        actions={<Button><Plus className="mr-2 h-4 w-4" />Add Provider</Button>}
      />
      <div className="mt-6">
        <StorageUsageCard />
      </div>
    </PageContainer>
  );
}
