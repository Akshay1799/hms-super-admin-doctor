import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ApiKeyTable } from "@/features/integrations/components/ApiKeyTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <PageContainer>
      <PageHeader
        title="API Keys"
        description="Manage and rotate API credentials for all third-party integrations"
        actions={<Button><Plus className="mr-2 h-4 w-4" />Add API Key</Button>}
      />
      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <span className="text-warning">⚠</span>
          Sensitive values are masked. Click the eye icon to reveal a key temporarily.
        </p>
        <ApiKeyTable />
      </div>
    </PageContainer>
  );
}
