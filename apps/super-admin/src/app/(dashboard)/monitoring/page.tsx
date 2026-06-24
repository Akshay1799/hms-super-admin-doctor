import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { MonitoringStatsCards } from "@/features/monitoring/components/MonitoringStatsCards";
import { HealthCard } from "@/features/monitoring/components/HealthCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

export default function MonitoringDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Platform Monitoring"
        description="Real-time overview of the Hospital Management System health"
        actions={
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        }
      />
      <div className="space-y-6 mt-6">
        <MonitoringStatsCards />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Critical Services Status</h3>
            <Link href="/system-health" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          <HealthCard />
        </div>
      </div>
    </PageContainer>
  );
}
