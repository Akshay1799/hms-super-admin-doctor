import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { IntegrationHealthCard } from "@/features/integrations/components/IntegrationHealthCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function IntegrationHealthPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Integration Health"
        description="Real-time status, latency, and uptime for all connected services"
        actions={
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />
      <div className="mt-6">
        <IntegrationHealthCard />
      </div>
    </PageContainer>
  );
}
