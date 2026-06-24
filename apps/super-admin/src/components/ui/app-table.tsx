import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface AppTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function AppTable<TData>({
  columns,
  data,
  isLoading,
  emptyState,
}: AppTableProps<TData>) {
  
  // Patch custom 'accessor' to TanStack's expected 'cell'
  const patchedColumns = React.useMemo(() => {
    return columns.map((col: any, index: number) => {
      if (col.accessor && !col.cell && !col.accessorKey && !col.accessorFn) {
        return {
          ...col,
          id: typeof col.header === 'string' ? col.header : `col-${index}`,
          cell: (info: any) => col.accessor(info.row.original),
        };
      }
      return col;
    });
  }, [columns]);

  const table = useReactTable({
    data,
    columns: patchedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto rounded-t-[var(--radius-card)] border border-border bg-card">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4 font-semibold select-none">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col, index) => (
                  <td key={index} className="px-6 py-4.5">
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                {emptyState || (
                  <div className="text-muted-foreground text-sm">No items found</div>
                )}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-foreground font-medium align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
