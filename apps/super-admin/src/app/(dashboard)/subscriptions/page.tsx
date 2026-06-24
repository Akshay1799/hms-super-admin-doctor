import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SubscriptionTable } from "@/features/billing/components/SubscriptionTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        description="Monitor tenant subscriptions and billing cycles"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        }
      />
      
      <div className="mt-6">
        <SubscriptionTable />
      </div>
    </PageContainer>
  );
}
