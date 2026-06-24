import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { AuditStatsCards } from "@/features/audit/components/AuditStatsCards";
import { AuditTable } from "@/features/audit/components/AuditTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

export default function AuditDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Audit Center"
        description="Centralized view of all platform activities, security events, and compliance metrics"
        actions={
          <Link href="/audit/export">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Audit Data
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 mt-6">
        <AuditStatsCards />
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Audit Logs</h3>
          <AuditTable />
        </div>
      </div>
    </PageContainer>
  );
}
