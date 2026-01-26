import { CellContext, Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "@/components/admin/table/data-row-actions";

export type Organization = {
	id: string;
	name: string;
	bio: string;
	instagramHandle: string;
	profileUrl: string;
	status: number;
	totalPosts: number;
	totalEvents: number;
	createdAt: Date;
	lastScrapedAt: Date | null;
};

export const generateSelect = <TData extends object>() => ({
	id: "select",
	header: ({ table }: { table: Table<TData> }) => (
		<Checkbox
			checked={
				table.getIsAllPageRowsSelected() ||
				(table.getIsSomePageRowsSelected() && "indeterminate")
			}
			onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
			aria-label="Select all"
		/>
	),
	cell: ({ row }: { row: Row<TData> }) => (
		<Checkbox
			checked={row.getIsSelected()}
			onCheckedChange={(value) => row.toggleSelected(!!value)}
			aria-label="Select row"
		/>
	),
	enableSorting: false,
	enableHiding: false,
});

export const organizationColumns: ColumnDef<
	Organization,
	keyof Organization
>[] = [
	generateSelect(),
	{
		accessorKey: "name",
		header: "Name",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (props: CellContext<Organization, Organization["name"]>) => (
			<div className="hover:cursor-pointer">
				{props.getValue().length > 25
					? `${props.getValue().substring(0, 20)}..`
					: props.getValue()}
			</div>
		),
		meta: { className: "w-36" },
		enableSorting: true,
	},
	{
		accessorKey: "instagramHandle",
		header: "Instagram",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (
			props: CellContext<Organization, Organization["instagramHandle"]>,
		) => <div className="hover:cursor-pointer">{props.getValue()}</div>,
		enableSorting: true,
	},
	//     {
	//     accessorKey: "profileUrl",
	//     header: "Profile URL",
	//     filterFn: "includesString",
	//     enableColumnFilter: true,
	//     cell: (props: CellContext<Organization, Organization["profileUrl"]>) => (
	//       <div className="hover:cursor-pointer">{props.getValue()}</div>
	//     ),
	//     enableSorting: true,
	//   },
	{
		accessorKey: "status",
		header: "Status",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (props: CellContext<Organization, Organization["status"]>) => (
			<div className="hover:cursor-pointer">{props.getValue()}</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "totalPosts",
		header: "Total Posts",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (props: CellContext<Organization, Organization["totalPosts"]>) => (
			<div className="hover:cursor-pointer">{props.getValue()}</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "totalEvents",
		header: "Total Events",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (props: CellContext<Organization, Organization["totalEvents"]>) => (
			<div className="hover:cursor-pointer">{props.getValue()}</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (props: CellContext<Organization, Organization["createdAt"]>) => (
			<div className="hover:cursor-pointer">
				{props.getValue().toLocaleDateString()}
			</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "lastScrapedAt",
		header: "Last Scraped",
		filterFn: "includesString",
		enableColumnFilter: true,
		cell: (props: CellContext<Organization, Organization["lastScrapedAt"]>) => (
			<div className="hover:cursor-pointer">
				{props.getValue()?.toLocaleDateString() || (
					<span className="text-muted-foreground">N/A</span>
				)}
			</div>
		),
		enableSorting: true,
	},
	{
		id: "actions",
		cell: (props) => (
			<DataTableRowActions
				{...props}
				entityType="organization"
				detailRoute="/admin/organizations/$id"
			/>
		),
	},
];
