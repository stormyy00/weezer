

import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import DataTableToolbar from "@/components/admin/table/toolbar";
import { organizationColumns, type Organization } from "@/data/table/organization";
import { useState } from "react";
import DataTable from "@/components/admin/table/data-table";
import DataTablePagination from "@/components/admin/table/pagination";
import DataTableBulkActions from "@/components/admin/table//actions"
import { useQuery } from "@tanstack/react-query";
import { FILTERS } from "@/data/table/filters";
import { getOrganizationsAdmin } from "@/fn/organization";

const Dashboard = () => {
  // Always call the hook (React rules), but may not use the data
  // Comment out the line below when testing with mock data to avoid API calls
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data,
    isLoading,
    error,
  } = useQuery<Organization[]>({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<Organization[]> => {
      return await getOrganizationsAdmin()
    },

  });

  const table = useReactTable({
    data: data || [],
    columns: organizationColumns,
    enableRowSelection: true,
    enableFilters: true,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        "flex flex-1 flex-col gap-4 p-4",
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter by name..."
        searchKey="name"
        filters={FILTERS}
      />
      <div className="overflow-hidden rounded-md border">
        <DataTable table={table} isLoading={isLoading} isError={error} />
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} />
    </div>
  );
};

export default Dashboard;
