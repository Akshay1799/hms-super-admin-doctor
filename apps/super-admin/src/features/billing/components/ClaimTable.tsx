"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useClaims } from "../hooks/use-billing";
import { Claim } from "../types/billing.types";

export function ClaimTable() {
  const { data: claims = [], isLoading } = useClaims();

  const columns = [
    { header: "Claim ID", accessor: (row: Claim) => <span className="font-medium text-foreground">{row.id}</span> },
    { header: "Invoice ID", accessor: (row: Claim) => row.invoiceId },
    { header: "Patient", accessor: (row: Claim) => row.patientName },
    { header: "Insurance", accessor: (row: Claim) => row.insuranceCompany },
    { header: "Claimed", accessor: (row: Claim) => new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency }).format(row.amountClaimed) },
    { header: "Approved", accessor: (row: Claim) => row.amountApproved ? new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency }).format(row.amountApproved) : "-" },
    { header: "Submitted", accessor: (row: Claim) => new Date(row.submissionDate).toLocaleDateString() },
    { header: "Status", accessor: (row: Claim) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={claims} isLoading={isLoading} />;
}
