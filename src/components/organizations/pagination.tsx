import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
};

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	className,
}: PaginationProps) => {
	if (totalPages <= 1) {
		return null;
	}

	const pageNumbers = getPageNumbers(currentPage, totalPages);
	let dotsCount = 0;

	return (
		<div
			className={cn(
				"flex items-center justify-between overflow-clip px-2 mt-10",
				"@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4",
				className,
			)}
			style={{ overflowClipMargin: 1 }}
		>
			<div className="flex w-full items-center justify-between">
				<div className="flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden">
					Page {currentPage} of {totalPages}
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
						onClick={() => onPageChange(1)}
						disabled={currentPage === 1}
					>
						<span className="sr-only">Go to first page</span>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					{pageNumbers.map((pageNumber) => {
						if (pageNumber === "...") {
							dotsCount += 1;

							return (
								<div key={`dots-${dotsCount}`} className="flex items-center">
									<span className="px-1 text-sm text-muted-foreground">
										...
									</span>
								</div>
							);
						}

						const pageValue = pageNumber as number;

						return (
							<div key={`page-${pageNumber}`} className="flex items-center">
								<Button
									variant={currentPage === pageNumber ? "default" : "outline"}
									className="h-8 min-w-8 px-2"
									onClick={() => onPageChange(pageValue)}
								>
									<span className="sr-only">Go to page {pageNumber}</span>
									{pageNumber}
								</Button>
							</div>
						);
					})}

					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => onPageChange(totalPages)}
						disabled={currentPage === totalPages}
					>
						<span className="sr-only">Go to last page</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Pagination;

function getPageNumbers(currentPage: number, totalPages: number) {
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
