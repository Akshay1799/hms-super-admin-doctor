import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { IntegrationStatsCards } from "@/features/integrations/components/IntegrationStatsCards";
import { IntegrationTable } from "@/features/integrations/components/IntegrationTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Integrations"
        description="Manage all third-party services and external system connections"
        actions={
          <Link href="/integrations/health">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Health Monitor
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 mt-6">
        <IntegrationStatsCards />
        <IntegrationTable />
      </div>
    </PageContainer>
  );
}
