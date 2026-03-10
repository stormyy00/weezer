import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Calendar, X } from "lucide-react";
import type { NormalizedEvent } from "@/types/events";
import { searchEvents } from "@/fn/events";
import { normalizeEvent } from "@/lib/event-normalizer";
import { cn } from "@/lib/utils";

function useDebouncedValue<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}

type SearchProps = {
	query: string;
	onQueryChange: (value: string) => void;
	eventResults: NormalizedEvent[];
	onSelectEvent: (event: NormalizedEvent) => void;
};

const Search = ({
	query,
	onQueryChange,
	eventResults,
	onSelectEvent,
}: SearchProps) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const resultsRef = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Debounce the query for server search
	const debouncedQuery = useDebouncedValue(query.trim(), 300);

	// Server-side search when query is non-empty
	const { data: serverResults, isLoading: isSearching } = useQuery({
		queryKey: ["event-search", debouncedQuery],
		queryFn: () => searchEvents({ data: { query: debouncedQuery, limit: 50 } }),
		enabled: debouncedQuery.length > 0,
		staleTime: 30_000,
	});

	// Normalize and combine results
	const displayResults = useMemo(() => {
		if (!debouncedQuery) {
			return eventResults.slice(0, 8);
		}
		if (serverResults) {
			return serverResults.map(normalizeEvent).slice(0, 12);
		}
		return [];
	}, [debouncedQuery, eventResults, serverResults]);

	// Reset selected index when results change
	useEffect(() => {
		setSelectedIndex(0);
	}, [displayResults]);

	// Auto-scroll to selected item when navigating with keyboard
	useEffect(() => {
		if (!resultsRef.current) return;
		const selectedElement = resultsRef.current.querySelector(
			`[data-index="${selectedIndex}"]`,
		) as HTMLElement | null;
		if (selectedElement) {
			selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [selectedIndex]);

	// Close on outside click
	useEffect(() => {
		if (!isOpen) return;

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!containerRef.current?.contains(target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, [isOpen]);

	// Keyboard navigation
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
				inputRef.current?.blur();
			}
			if (!isOpen || displayResults.length === 0) return;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => (i + 1) % displayResults.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex(
					(i) => (i - 1 + displayResults.length) % displayResults.length,
				);
			} else if (e.key === "Enter" && displayResults[selectedIndex]) {
				e.preventDefault();
				handleSelect(displayResults[selectedIndex]);
			}
		};

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, displayResults, selectedIndex]);

	const handleSelect = (event: NormalizedEvent) => {
		onSelectEvent(event);
		setIsOpen(false);
		onQueryChange("");
	};

	const showDropdown =
		isOpen && (displayResults.length > 0 || isSearching || debouncedQuery);

	return (
		<div ref={containerRef} className="relative w-full md:max-w-md lg:max-w-lg">
			{/* Search Input */}
			<div
				className={cn(
					"relative flex items-center gap-2",
					"bg-white/90 dark:bg-[#1a1f26]/90",
					"backdrop-blur-xl",
					"border border-gray-200/60 dark:border-white/10",
					"rounded-3xl",
					"transition-all duration-300",
					isOpen && "ring-2 ring-ucr-blue/30 dark:ring-ucr-gold/30",
					"hover:shadow-sm hover:border-gray-300/60 dark:hover:border-white/20",
				)}
			>
				<div className="absolute left-4 pointer-events-none">
					<SearchIcon
						className={cn(
							"w-4 h-4 transition-colors duration-200",
							isOpen
								? "text-ucr-blue dark:text-ucr-gold"
								: "text-gray-400 dark:text-gray-500",
						)}
					/>
				</div>
				<input
					ref={inputRef}
					type="text"
					placeholder="Search events or orgs..."
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					onFocus={() => setIsOpen(true)}
					onClick={() => setIsOpen(true)}
					className={cn(
						"w-full h-11 pl-11 pr-4",
						"bg-transparent",
						"text-sm text-gray-900 dark:text-white",
						"placeholder:text-gray-400 dark:placeholder:text-gray-500",
						"outline-none",
						"rounded-xl",
					)}
				/>
				{query && (
					<button
						onClick={() => onQueryChange("")}
						className="absolute right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
					>
						<X className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
					</button>
				)}
			</div>

			{/* Dropdown */}
			{showDropdown && (
				<div
					className={cn(
						"absolute left-0 right-0 top-full mt-2 z-50",
						"bg-white/95 dark:bg-[#0f141b]/95",
						"backdrop-blur-xl",
						"border border-gray-200/60 dark:border-white/10",
						"rounded-2xl",
						"shadow-2xl shadow-gray-900/10 dark:shadow-black/40",
						"overflow-hidden",
						"animate-in fade-in-0 zoom-in-95 duration-200",
						// Mobile: slightly larger max-height for touch scrolling
						"max-h-[70vh] md:max-h-none",
					)}
				>
					{/* Header */}
					<div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								{debouncedQuery ? "Search Results" : "Upcoming Events"}
							</span>
							{isSearching && (
								<div className="flex items-center gap-1.5">
									<div className="w-1.5 h-1.5 rounded-full bg-ucr-blue dark:bg-ucr-gold animate-pulse" />
									<span className="text-[10px] text-gray-400 dark:text-gray-500">
										Searching...
									</span>
								</div>
							)}
							{!isSearching && displayResults.length > 0 && (
								<span className="text-[10px] text-gray-400 dark:text-gray-500">
									{displayResults.length} found
								</span>
							)}
						</div>
					</div>

					{/* Results */}
					<div
						ref={resultsRef}
						className="max-h-[80vh] md:max-h-96 overflow-y-auto overscroll-contain"
					>
						{displayResults.length === 0 && !isSearching && debouncedQuery && (
							<div className="px-4 py-8 text-center">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									No events found for "{debouncedQuery}"
								</p>
								<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
									Try searching by event name or org handle
								</p>
							</div>
						)}

						{displayResults.map((event, index) => (
							<button
								key={event.id}
								data-index={index}
								onClick={() => handleSelect(event)}
								onMouseEnter={() => setSelectedIndex(index)}
								className={cn(
									"w-full px-3 md:px-4 py-3 md:py-3 flex items-start gap-3 text-left",
									"transition-colors duration-150",
									"active:bg-ucr-blue/10 dark:active:bg-ucr-gold/10", // Touch feedback
									selectedIndex === index
										? "bg-ucr-blue/5 dark:bg-ucr-gold/5"
										: "hover:bg-gray-50 dark:hover:bg-white/5",
								)}
							>
								{/* Event Image/Fallback */}
								<div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-ucr-blue to-ucr-gold">
									{event.media?.cover ? (
										<img
											src={event.media.cover}
											alt=""
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<span className="text-xs font-bold text-white uppercase">
												{event.organization
													.split("_")
													.map((w) => w[0])
													.join("")
													.slice(0, 2)}
											</span>
										</div>
									)}
								</div>

								{/* Event Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2">
										<h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
											{event.title}
										</h4>
										{selectedIndex === index && (
											<span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
												↵
											</span>
										)}
									</div>

									<div className="mt-1 flex items-center gap-3">
										<span className="inline-flex items-center gap-1 text-xs text-ucr-blue dark:text-ucr-gold font-medium">
											@{event.organization}
										</span>
									</div>

									<div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
										<span className="inline-flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{event.date.isTBD ? "TBD" : event.date.monthDay}
										</span>
									</div>
								</div>
							</button>
						))}
					</div>

					{/* Footer hint - hidden on mobile */}
					{displayResults.length > 0 && (
						<div className="hidden md:block px-4 py-2.5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
							<div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
								<span>
									<kbd className="px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-white/10 font-mono">
										↑↓
									</kbd>{" "}
									navigate
								</span>
								<span>
									<kbd className="px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-white/10 font-mono">
										↵
									</kbd>{" "}
									select
								</span>
								<span>
									<kbd className="px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-white/10 font-mono">
										esc
									</kbd>{" "}
									close
								</span>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Search;
