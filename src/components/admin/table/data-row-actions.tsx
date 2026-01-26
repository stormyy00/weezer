import { type Row } from "@tanstack/react-table";
import {
	ActivitySquare,
	Hammer,
	Hand,
	MoreHorizontal,
	StopCircle,
	Trash2,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const labels = [
	{ label: "Active", value: "active", icon: ActivitySquare },
	{ label: "Warn", value: "warn", icon: StopCircle },
	{ label: "Suspend", value: "suspend", icon: Hand },
	{ label: "Ban", value: "ban", icon: Hammer },
];
type DataTableRowActionsProps<TData> = {
	row: Row<TData>;
	entityType: "event" | "organization";
	detailRoute: string;
};

export function DataTableRowActions<TData>({
	row,
	entityType,
	detailRoute,
}: DataTableRowActionsProps<TData>) {
	const navigate = useNavigate();
	const data = row.original as any;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem
					onClick={() => {
						navigate({
							to: detailRoute,
							params: { id: data.id },
							search: { edit: true },
						});
					}}
				>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						navigate({
							to: detailRoute,
							params: { id: data.id },
						});
					}}
				>
					View
				</DropdownMenuItem>
				<DropdownMenuItem disabled>Check Insta</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					disabled
					onClick={() => {
						// Delete functionality to be implemented
					}}
				>
					Delete
					<DropdownMenuShortcut>
						<Trash2 size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
