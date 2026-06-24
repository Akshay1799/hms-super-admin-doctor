"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTemplates } from "../hooks/useNotifications";
import { Template } from "../types/notifications.types";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Trash2, Pencil } from "lucide-react";

export function TemplateTable() {
  const { data: templates = [], isLoading } = useTemplates();

  const columns = [
    {
      header: "Template Name",
      accessor: (row: Template) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    { header: "Channel", accessor: (row: Template) => <StatusBadge status={row.channel} /> },
    { header: "Category", accessor: (row: Template) => <span className="capitalize">{row.category.replace("-", " ")}</span> },
    { header: "Variables", accessor: (row: Template) => (
      <span className="text-sm font-medium text-foreground">{row.variables.length}</span>
    )},
    { header: "Status", accessor: (row: Template) => <StatusBadge status={row.status} /> },
    { header: "Updated At", accessor: (row: Template) => new Date(row.updatedAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: Template) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="Edit"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="Duplicate"><Copy className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={templates} isLoading={isLoading} />;
}
