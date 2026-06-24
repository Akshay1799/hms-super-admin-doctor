"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { useDataAccess } from "../hooks/use-audit";
import { DataAccess } from "../types/audit.types";

export function DataAccessTable() {
  const { data: records = [], isLoading } = useDataAccess();

  const columns = [
    { header: "User", accessor: (row: DataAccess) => <span className="font-semibold text-sm text-foreground">{row.user}</span> },
    { header: "Module", accessor: (row: DataAccess) => <span className="text-sm bg-muted px-2 py-1 rounded">{row.module}</span> },
    { header: "Entity", accessor: (row: DataAccess) => <span className="text-sm text-primary font-medium">{row.entity}</span> },
    { header: "Action", accessor: (row: DataAccess) => <span className="text-sm font-semibold">{row.action}</span> },
    { header: "Reason", accessor: (row: DataAccess) => <span className="text-sm text-muted-foreground italic">{row.reason}</span> },
    { header: "Timestamp", accessor: (row: DataAccess) => new Date(row.createdAt).toLocaleString() },
  ];

  return <AppTable columns={columns} data={records} isLoading={isLoading} />;
}
