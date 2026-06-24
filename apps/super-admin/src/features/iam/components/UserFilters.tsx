import React from "react";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MOCK_ROLES } from "../mocks/iam.mocks";

interface UserFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  role: string;
  onRoleChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

export function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: UserFiltersProps) {
  const dropdowns = [
    {
      name: "role",
      placeholder: "All Roles",
      selectedValue: role,
      onChange: onRoleChange,
      options: MOCK_ROLES.map((r) => ({ label: r.name, value: r.name })),
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
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  return (
    <FilterBar
      dropdowns={dropdowns}
      searchSlot={
        <SearchInput
          placeholder="Search users by name, email or phone..."
          value={search}
          onSearch={onSearchChange}
        />
      }
      actionSlot={
        <Link
          href="/users/create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create User
        </Link>
      }
    />
  );
}
