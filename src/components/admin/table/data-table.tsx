import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender, Table as TableType } from "@tanstack/react-table";
import {
	ArrowDownIcon,
	ArrowRightLeft,
	ArrowUpIcon,
	EyeClosed,
} from "lucide-react";

interface TableProps<TData> {
	table: TableType<TData>;
	isLoading?: boolean;
	isError?: Error | null | boolean;
}

const DataTable = <TData,>({
	table,
	isLoading,
	isError,
}: TableProps<TData>) => {
	const columns = table.getAllColumns().length;
	const { rows } = table.getRowModel();

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map(({ id, headers }) => (
					<TableRow key={id} className="group/row">
						{headers.map(({ id, colSpan, column, getContext }) => {
							return (
								<TableHead
									key={id}
									colSpan={colSpan}
									className={cn(
										"bg-ucr-blue dark:bg-ucr-gold  text-white dark:text-black group-hover/row:bg-ucr-blue group-data-[state=selected]/row:bg-muted",
										(column.columnDef.meta as any)?.className,
										(column.columnDef.meta as any)?.thClassName,
									)}
								>
									{column.id === "select" ? (
										flexRender(column.columnDef.header, getContext())
									) : (
										<>
											<div className={"flex items-center space-x-2"}>
												{flexRender(column.columnDef.header, getContext())}
												{column.getCanSort() && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																size="sm"
																className="h-8 data-[state=open]:bg-ucr-blue dark:data-[state=open]:bg-ucr-gold bg-ucr-blue dark:bg-ucr-gold text-white dark:text-black hover:bg-ucr-blue/90 dark:hover:bg-ucr-gold/90"
															>
																{column.getIsSorted() === "desc" ? (
																	<ArrowDownIcon className="ms-2 h-4 w-4" />
																) : column.getIsSorted() === "asc" ? (
																	<ArrowUpIcon className="ms-2 h-4 w-4" />
																) : (
																	<ArrowRightLeft className="ms-2 h-4 w-4" />
																)}
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="start">
															<DropdownMenuItem
																onClick={() => column.toggleSorting(false)}
															>
																<ArrowUpIcon className="size-3.5 text-muted-foreground/70" />
																Asc
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => column.toggleSorting(true)}
															>
																<ArrowDownIcon className="size-3.5 text-muted-foreground/70" />
																Desc
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												)}
											</div>
										</>
									)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{isLoading ? (
					<TableRow>
						<TableCell colSpan={columns} className="h-[480px]">
							<div className="flex flex-col items-center justify-center h-full text-center">
								<p className="text-muted-foreground">Loading data...</p>
							</div>
						</TableCell>
					</TableRow>
				) : isError ? (
					<TableRow>
						<TableCell colSpan={columns} className="h-[480px]">
							<div className="flex flex-col items-center justify-center h-full text-center">
								<EyeClosed className="mb-2 h-6 w-6 text-muted-foreground/70" />
								<p className="text-muted-foreground">
									An error occurred while fetching data.
								</p>
							</div>
						</TableCell>
					</TableRow>
				) : rows.length ? (
					rows.map((row) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() && "selected"}
							className="group/row"
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell
									key={cell.id}
									className={cn(
										"bg-white/20 dark:bg-[#141827] group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
										(cell.column.columnDef.meta as any)?.className,
										(cell.column.columnDef.meta as any)?.tdClassName,
									)}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={columns} className="h-[480px]">
							<div className="flex flex-col items-center justify-center h-full text-center">
								<p className="text-muted-foreground">No results found.</p>
								<p className="text-sm text-muted-foreground mt-1">
									Try adjusting your filters.
								</p>
							</div>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};

export default DataTable;
