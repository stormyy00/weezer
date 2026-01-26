import { type Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowLeft,
	ArrowRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";

type DataTablePaginationProps<TData> = {
	table: Table<TData>;
	className?: string;
};

export function getPageNumbers(currentPage: number, totalPages: number) {
	const maxVisiblePages = 5;
	const rangeWithDots = [];

	if (totalPages <= maxVisiblePages) {
		// If total pages is 5 or less, show all pages
		for (let i = 1; i <= totalPages; i++) {
			rangeWithDots.push(i);
		}
	} else {
		// Always show first page
		rangeWithDots.push(1);

		if (currentPage <= 3) {
			// Near the beginning: [1] [2] [3] [4] ... [10]
			for (let i = 2; i <= 4; i++) {
				rangeWithDots.push(i);
			}
			rangeWithDots.push("...", totalPages);
		} else if (currentPage >= totalPages - 2) {
			// Near the end: [1] ... [7] [8] [9] [10]
			rangeWithDots.push("...");
			for (let i = totalPages - 3; i <= totalPages; i++) {
				rangeWithDots.push(i);
			}
		} else {
			// In the middle: [1] ... [4] [5] [6] ... [10]
			rangeWithDots.push("...");
			for (let i = currentPage - 1; i <= currentPage + 1; i++) {
				rangeWithDots.push(i);
			}
			rangeWithDots.push("...", totalPages);
		}
	}

	return rangeWithDots;
}

const DataTablePagination = <TData,>({
	table,
	className,
}: DataTablePaginationProps<TData>) => {
	const currentPage = table.getState().pagination.pageIndex + 1;
	const totalPages = table.getPageCount();
	const pageNumbers = getPageNumbers(currentPage, totalPages);

	return (
		<div
			className={cn(
				"flex items-center justify-between overflow-clip px-2",
				"@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4",
				className,
			)}
			style={{ overflowClipMargin: 1 }}
		>
			<div className="flex w-full items-center justify-between">
				<div className="flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden">
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex items-center gap-2 @max-2xl/content:flex-row-reverse">
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="hidden text-sm font-medium sm:block">Rows per page</p>
				</div>
			</div>

			<div className="flex items-center sm:space-x-6 lg:space-x-8">
				<div className="flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden">
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>

					{pageNumbers.map((pageNumber, index) => (
						<div key={`${pageNumber}-${index}`} className="flex items-center">
							{pageNumber === "..." ? (
								<span className="px-1 text-sm text-muted-foreground">...</span>
							) : (
								<Button
									variant={currentPage === pageNumber ? "default" : "outline"}
									className="h-8 min-w-8 px-2"
									onClick={() => table.setPageIndex((pageNumber as number) - 1)}
								>
									<span className="sr-only">Go to page {pageNumber}</span>
									{pageNumber}
								</Button>
							)}
						</div>
					))}

					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ArrowRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DataTablePagination;
