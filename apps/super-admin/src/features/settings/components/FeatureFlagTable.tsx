"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { useFeatureFlags, useToggleFeatureFlag } from "../hooks/use-settings";
import { FeatureFlag } from "../types/settings.types";
import { Switch } from "@/components/ui/switch";

export function FeatureFlagTable() {
  const { data: flags = [], isLoading } = useFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  const columns = [
    { header: "Feature Name", accessor: (row: FeatureFlag) => <span className="font-semibold text-sm text-foreground">{row.name}</span> },
    { header: "Description", accessor: (row: FeatureFlag) => <span className="text-sm text-muted-foreground">{row.description}</span> },
    { header: "Last Updated", accessor: (row: FeatureFlag) => new Date(row.updatedAt).toLocaleDateString() },
    { header: "Status", accessor: (row: FeatureFlag) => (
      <Switch 
        checked={row.enabled} 
        onCheckedChange={(checked) => toggleMutation.mutate({ id: row.id, enabled: checked })}
        disabled={toggleMutation.isPending}
      />
    )},
  ];

  return <AppTable columns={columns} data={flags} isLoading={isLoading} />;
}
