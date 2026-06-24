import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsCards } from "@/features/notifications/components/AnalyticsCards";
import { AnalyticsCharts } from "@/features/notifications/components/AnalyticsCharts";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";

export default function NotificationAnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notification Analytics"
        description="Insights into notification delivery, engagement, and channel performance"
        actions={
          <>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Last 7 Days
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      />
      <div className="space-y-6 mt-6">
        <AnalyticsCards />
        <AnalyticsCharts />
      </div>
    </PageContainer>
  );
}
