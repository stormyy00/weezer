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
import { eventsColumns, type Events } from "@/data/table/events";
import { useState, useMemo } from "react";
import DataTable from "@/components/admin/table/data-table";
import DataTablePagination from "@/components/admin/table/pagination";
import DataTableBulkActions from "@/components/admin/table//actions";
import { useQuery } from "@tanstack/react-query";
import { FILTERS } from "@/data/table/filters";
import { getEventsAdmin } from "@/fn/events";
import type { RawEvent } from "@/types/events";

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
		data: rawData,
		isLoading,
		error,
	} = useQuery<RawEvent[]>({
		queryKey: ["admin-events"],
		queryFn: async (): Promise<RawEvent[]> => {
			return await getEventsAdmin();
		},
	});

	// Memoize the data transformation to prevent re-computation on every render
	const data: Events[] = useMemo(() => {
		if (!rawData) return [];

		return rawData.map((event) => ({
			id: event.id,
			title: event.title,
			instagramHandle: event.organization,
			startAt: event.start_time ? new Date(event.start_time) : null,
			endAt: event.end_time ? new Date(event.end_time) : null,
			location: event.location?.name || null,
			organization: event.organization,
			createdAt: event.created_at ? new Date(event.created_at) : null,
		}));
	}, [rawData]);

	const table = useReactTable({
		data: data,
		columns: eventsColumns,
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
				searchPlaceholder="Filter by title..."
				searchKey="title"
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
