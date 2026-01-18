import { CellContext, Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "@/components/admin/table/data-row-actions";

export type Events = {
  id: string;
  title: string;
  instagramHandle: string;
  startAt: Date | null;
  endAt: Date | null;
  location: string | null;
  organization: string;
  createdAt: Date | null;
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

export const eventsColumns: ColumnDef<Events, keyof Events>[] = [

  generateSelect(),
  {
    accessorKey: "title",
    header: "Title",
    filterFn: "includesString",
    enableColumnFilter: true,
    cell: (props: CellContext<Events, Events["title"]>) => (
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
accessorKey: "organization",
header: "Organization",
filterFn: "includesString",
enableColumnFilter: true,
cell: (props: CellContext<Events, Events["organization"]>) => (
  <div className="hover:cursor-pointer">{props.getValue()}</div>
),
enableSorting: true,
},
    {
    accessorKey: "startAt",
    header: "Start At",
    filterFn: "includesString",
    enableColumnFilter: true,
    cell: (props: CellContext<Events, Events["startAt"]>) => (
      <div className="hover:cursor-pointer">{props.getValue()?.toLocaleString()}</div>
    ),
    enableSorting: true,
  },
    {
    accessorKey: "endAt",
    header: "End At",
    filterFn: "includesString",
    enableColumnFilter: true,
    cell: (props: CellContext<Events, Events["endAt"]>) => (
      <div className="hover:cursor-pointer">{props.getValue()?.toLocaleString()}</div>
    ),
    enableSorting: true,
  },
    {
    accessorKey: "location",
    header: "Location",
    filterFn: "includesString",
    enableColumnFilter: true,
    cell: (props: CellContext<Events, Events["location"]>) => (
      <div className="hover:cursor-pointer">{props.getValue() || "N/A"}</div>
    ),
    enableSorting: true,
  },
    {
    accessorKey: "createdAt",
    header: "Created At",
    filterFn: "includesString",
    enableColumnFilter: true,
    cell: (props: CellContext<Events, Events["createdAt"]>) => (
      <div className="hover:cursor-pointer">{props.getValue()?.toLocaleString()}</div>
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
