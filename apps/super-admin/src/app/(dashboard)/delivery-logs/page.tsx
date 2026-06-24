import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { DeliveryLogsTable } from "@/features/notifications/components/DeliveryLogsTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DeliveryLogsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Delivery Logs"
        description="Track notification delivery status across all channels and recipients"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        }
      />
      <div className="mt-6">
        <DeliveryLogsTable />
      </div>
    </PageContainer>
  );
}
