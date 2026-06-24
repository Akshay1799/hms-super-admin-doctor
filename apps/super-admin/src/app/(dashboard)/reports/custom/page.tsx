import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";

export default function CustomReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Custom Reports Builder"
        description="Design and schedule dynamic reports based on platform-wide filters and visualizations"
        actions={<Button><Save className="mr-2 h-4 w-4" />Save Configuration</Button>}
      />
      <div className="mt-6 flex flex-col items-center justify-center h-64 border border-dashed rounded-xl border-border bg-muted/20 space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Drag and drop fields to build your custom report.</p>
        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Add Data Source</Button>
      </div>
    </PageContainer>
  );
}
