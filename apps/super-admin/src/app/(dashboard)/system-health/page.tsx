import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { HealthCard } from "@/features/monitoring/components/HealthCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

export default function SystemHealthPage() {
  return (
    <PageContainer>
      <PageHeader
        title="System Health"
        description="Monitor status, uptime, and latency of all core platform services"
        actions={
          <>
            <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Log</Button>
          </>
        }
      />
      <div className="mt-6 max-w-4xl">
        <HealthCard />
      </div>
    </PageContainer>
  );
}
