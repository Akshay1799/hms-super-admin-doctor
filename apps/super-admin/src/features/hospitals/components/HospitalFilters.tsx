import React from "react";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";

interface HospitalFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  tenantId: string;
  onTenantChange: (val: string) => void;
  type: string;
  onTypeChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

export function HospitalFilters({
  search,
  onSearchChange,
  tenantId,
  onTenantChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
}: HospitalFiltersProps) {
  const dropdowns = [
    {
      name: "tenantId",
      placeholder: "All Tenants",
      selectedValue: tenantId,
      onChange: onTenantChange,
      options: MOCK_TENANTS.map((t) => ({ label: t.name, value: t.id })),
    },
    {
      name: "type",
      placeholder: "All Types",
      selectedValue: type,
      onChange: onTypeChange,
      options: [
        { label: "General Hospital", value: "General Hospital" },
        { label: "Specialty Hospital", value: "Specialty Hospital" },
        { label: "Clinic", value: "Clinic" },
        { label: "Diagnostic Center", value: "Diagnostic Center" },
        { label: "Teaching Hospital", value: "Teaching Hospital" },
      ],
    },
    {
      name: "status",
      placeholder: "All Statuses",
      selectedValue: status,
      onChange: onStatusChange,
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Suspended", value: "Suspended" },
        { label: "Under Review", value: "Under Review" },
      ],
    },
  ];

  return (
    <FilterBar
      dropdowns={dropdowns}
      searchSlot={
        <SearchInput
          placeholder="Search hospital by name, code or city..."
          value={search}
          onSearch={onSearchChange}
        />
      }
      actionSlot={
        <Link
          href="/hospitals/create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Hospital
        </Link>
      }
    />
  );
}
