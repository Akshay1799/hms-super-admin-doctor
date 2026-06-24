import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TemplateTable } from "@/features/notifications/components/TemplateTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TemplatesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notification Templates"
        description="Manage reusable email, SMS, WhatsApp, and in-app message templates"
        actions={
          <Link href="/templates/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </Link>
        }
      />
      <div className="mt-6">
        <TemplateTable />
      </div>
    </PageContainer>
  );
}
