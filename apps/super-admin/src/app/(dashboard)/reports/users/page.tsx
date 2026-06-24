import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default function UserReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="User Reports"
        description="Analytics on user growth, role distribution, and system usage"
      />
      <div className="mt-6 flex items-center justify-center h-64 border border-dashed rounded-xl border-border bg-muted/20">
        <p className="text-muted-foreground text-sm font-medium">User report views are currently in preview mode.</p>
      </div>
    </PageContainer>
  );
}
