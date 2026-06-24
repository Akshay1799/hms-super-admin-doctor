import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorTable } from "@/features/monitoring/components/ErrorTable";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function ErrorTrackerPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Error Tracker"
        description="Centralized log of application exceptions and unhandled errors"
        actions={<Button variant="outline"><CheckCircle2 className="mr-2 h-4 w-4" />Resolve All Issues</Button>}
      />
      <div className="mt-6">
        <ErrorTable />
      </div>
    </PageContainer>
  );
}
