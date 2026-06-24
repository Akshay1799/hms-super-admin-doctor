import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { BroadcastTable } from "@/features/notifications/components/BroadcastTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function BroadcastsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Broadcasts"
        description="Send bulk messages to tenants, hospitals, doctors, and staff"
        actions={
          <Link href="/broadcasts/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Broadcast
            </Button>
          </Link>
        }
      />
      <div className="mt-6">
        <BroadcastTable />
      </div>
    </PageContainer>
  );
}
