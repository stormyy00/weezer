import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
	type InfiniteData,
	type UseQueryResult,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { RawEvent } from "@/types/events";
import { parseEventDate } from "@/lib/date-utils";
import { normalizeEvent } from "@/lib/event-normalizer";
import type { NormalizedEvent } from "@/types/events";
import {
	getEventsPaginated,
	getEventCounts,
	getEventByIdPublic,
	type PaginatedEventsResponse,
} from "@/fn/events";
import EventCard from "./event-card";
import EventDetail from "./event-detail";
import Search from "./search";
import { cn } from "@/lib/utils";
import Loading from "../loading";
import { LoaderCircle } from "lucide-react";

type EventsProps = {
	eventId?: string;
};

type PrimaryView = "upcoming" | "past";
type QuickRange = "today" | "week" | null;

const Events = ({ eventId }: EventsProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(
		null,
	);
	const [primaryView, setPrimaryView] = useState<PrimaryView>("upcoming");
	const [quickRange, setQuickRange] = useState<QuickRange>(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Helpers for client-side date filtering in Pacific Time
	const getPacificYmd = (date: Date) => {
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "America/Los_Angeles",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		const parts = Object.fromEntries(
			formatter.formatToParts(date).map((part) => [part.type, part.value]),
		);
		return {
			year: Number(parts.year),
			month: Number(parts.month),
			day: Number(parts.day),
		};
	};

	const isEventToday = (startTime: string | null | undefined) => {
		const eventDate = parseEventDate(startTime);
		if (!eventDate) return false;
		const eventYmd = getPacificYmd(eventDate);
		const todayYmd = getPacificYmd(new Date());
		return (
			eventYmd.year === todayYmd.year &&
			eventYmd.month === todayYmd.month &&
			eventYmd.day === todayYmd.day
		);
	};

	const isEventThisWeek = (startTime: string | null | undefined) => {
		const eventDate = parseEventDate(startTime);
		if (!eventDate) return false;

		const eventYmd = getPacificYmd(eventDate);
		const todayYmd = getPacificYmd(new Date());

		const msPerDay = 24 * 60 * 60 * 1000;
		const toUtcDay = (ymd: { year: number; month: number; day: number }) =>
			Date.UTC(ymd.year, ymd.month - 1, ymd.day);

		const todayUtc = toUtcDay(todayYmd);
		const eventUtc = toUtcDay(eventYmd);

		const dayOfWeek = new Date(todayUtc).getUTCDay(); // 0 (Sun) - 6 (Sat)
		const weekStart = todayUtc - dayOfWeek * msPerDay;
		const weekEnd = weekStart + 7 * msPerDay;

		return eventUtc >= weekStart && eventUtc < weekEnd;
	};

	// Ref for infinite scroll sentinel
	const bottomSentinelRef = useRef<HTMLDivElement>(null);

	// Fetch event counts for filter buttons
	const { data: counts } = useQuery({
		queryKey: ["event-counts"],
		queryFn: () => getEventCounts(),
		staleTime: 60_000, // 1 minute
	});

	// Page param type for infinite query
	type PageParam = {
		direction?: "upcoming" | "past";
		cursor?: string;
	};

	// Infinite query for events based on current effective view
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteQuery<
		PaginatedEventsResponse,
		Error,
		{ pages: PaginatedEventsResponse[]; pageParams: PageParam[] },
		string[],
		PageParam
	>({
		queryKey: ["events", primaryView],
		queryFn: async ({ pageParam }) => {
			return await getEventsPaginated({
				data: {
					view: primaryView,
					direction: pageParam?.direction,
					cursor: pageParam?.cursor,
				},
			});
		},
		initialPageParam: {},
		getNextPageParam: (lastPage) => {
			if (!lastPage.hasMore || !lastPage.nextCursor) return undefined;
			// Use the correct direction based on current effective view
			const dir = primaryView === "past" ? "past" : "upcoming";
			return { direction: dir, cursor: lastPage.nextCursor };
		},
		staleTime: 30_000, // 30 seconds
	});

	// Flatten and deduplicate events from all pages
	const allRawEvents = useMemo(() => {
		if (!data?.pages) return [];
		const seen = new Set<string>();
		return data.pages.flatMap((page: PaginatedEventsResponse) =>
			page.events.filter((e) => {
				if (seen.has(e.id)) return false;
				seen.add(e.id);
				return true;
			}),
		);
	}, [data?.pages]);

	// Normalize events for display
	const normalizedEvents = useMemo(
		() => allRawEvents.map(normalizeEvent),
		[allRawEvents],
	);

	// Map for quick lookup
	const rawEventMap = useMemo(() => {
		return new Map(allRawEvents.map((e) => [e.id, e]));
	}, [allRawEvents]);

	const trimmedQuery = useMemo(
		() => searchQuery.trim().toLowerCase(),
		[searchQuery],
	);

	const matchesQuery = useCallback(
		(event: NormalizedEvent) => {
			if (!trimmedQuery) return true;
			const haystack = [
				event.title,
				event.organization,
				...(event.organizations ?? []),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(trimmedQuery);
		},
		[trimmedQuery],
	);

	// Pull cached events for both upcoming and past views (already fetched pages only)
	type InfiniteResult = InfiniteData<
		PaginatedEventsResponse,
		PageParam | undefined
	>;
	const cachedUpcoming = queryClient.getQueryData<InfiniteResult>([
		"events",
		"upcoming",
	]);
	const cachedPast = queryClient.getQueryData<InfiniteResult>([
		"events",
		"past",
	]);

	const allCachedRawEvents = useMemo(() => {
		const seen = new Set<string>();
		const collect: PaginatedEventsResponse["events"] = [];

		const append = (data?: InfiniteResult) => {
			data?.pages?.forEach((page) => {
				page.events.forEach((event) => {
					if (seen.has(event.id)) return;
					seen.add(event.id);
					collect.push(event);
				});
			});
		};

		append(cachedUpcoming);
		append(cachedPast);

		return collect;
	}, [cachedPast, cachedUpcoming]);

	const allCachedNormalizedEvents = useMemo(
		() => allCachedRawEvents.map(normalizeEvent),
		[allCachedRawEvents],
	);

	const cachedRawEventMap = useMemo(() => {
		return new Map(allCachedRawEvents.map((e) => [e.id, e]));
	}, [allCachedRawEvents]);

	// Get current PT time as "fake UTC" to match how DB stores times
	const getNowInPT = () => {
		const now = new Date();
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "America/Los_Angeles",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
		const parts = Object.fromEntries(
			formatter.formatToParts(now).map((p) => [p.type, p.value]),
		);
		return Date.UTC(
			Number(parts.year),
			Number(parts.month) - 1,
			Number(parts.day),
			Number(parts.hour),
			Number(parts.minute),
			Number(parts.second),
		);
	};

	// Buckets derived from cached events for query-aware counts
	const cachedBuckets = useMemo(() => {
		const upcoming: NormalizedEvent[] = [];
		const past: NormalizedEvent[] = [];
		const today: NormalizedEvent[] = [];
		const week: NormalizedEvent[] = [];
		const nowMs = getNowInPT();

		allCachedNormalizedEvents.forEach((event) => {
			const rawEvent = cachedRawEventMap.get(event.id);
			const eventDate = parseEventDate(rawEvent?.start_time);
			if (!eventDate) return;

			const eventMs = eventDate.getTime();
			if (eventMs >= nowMs) {
				upcoming.push(event);
			} else {
				past.push(event);
			}

			if (isEventToday(rawEvent?.start_time)) {
				today.push(event);
			}
			if (isEventThisWeek(rawEvent?.start_time)) {
				week.push(event);
			}
		});

		return { upcoming, past, today, week };
	}, [allCachedNormalizedEvents, cachedRawEventMap]);

	// For search dropdown: pass upcoming events for empty query suggestions
	// Server-side search handles actual query results in the Search component

	const filteredEvents = useMemo(() => {
		let result = normalizedEvents;

		if (trimmedQuery) {
			result = result.filter((event) => matchesQuery(event));
		}

		// Apply client-side quick filters for upcoming view
		if (primaryView === "upcoming" && quickRange !== null) {
			result = result.filter((event) => {
				const rawEvent = rawEventMap.get(event.id);
				if (quickRange === "today") return isEventToday(rawEvent?.start_time);
				if (quickRange === "week") return isEventThisWeek(rawEvent?.start_time);
				return true;
			});
		}

		return result;
	}, [
		normalizedEvents,
		matchesQuery,
		primaryView,
		quickRange,
		rawEventMap,
		trimmedQuery,
	]);

	// Query-aware counts: fall back to server counts when no query
	const queryCounts = useMemo(() => {
		if (!trimmedQuery) {
			return {
				upcoming: counts?.upcoming ?? "...",
				past: counts?.past ?? "...",
				today: counts?.today,
				week: counts?.week,
			};
		}

		const upcoming = cachedBuckets.upcoming.filter((event) =>
			matchesQuery(event),
		).length;
		const past = cachedBuckets.past.filter((event) =>
			matchesQuery(event),
		).length;
		const today = cachedBuckets.today.filter((event) =>
			matchesQuery(event),
		).length;
		const week = cachedBuckets.week.filter((event) =>
			matchesQuery(event),
		).length;

		return { upcoming, past, today, week };
	}, [cachedBuckets, counts, matchesQuery, trimmedQuery]);

	// Direct fetch for event from URL when not in paginated results
	const eventInCache = useMemo(() => {
		if (!eventId) return null;
		return (
			normalizedEvents.find((e) => e.id === eventId) ||
			allCachedNormalizedEvents.find((e) => e.id === eventId)
		);
	}, [eventId, normalizedEvents, allCachedNormalizedEvents]);

	const shouldDirectFetch = Boolean(eventId && !eventInCache);

	const {
		data: directFetchedRawEvent,
		isLoading: isDirectFetching,
		error: directFetchError,
	}: UseQueryResult<RawEvent | null, Error> = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventByIdPublic({ data: { id: eventId! } }),
		enabled: shouldDirectFetch,
		staleTime: 5 * 60_000,
		gcTime: 10 * 60_000,
	});

	const directFetchedEvent = useMemo(() => {
		if (!directFetchedRawEvent) return null;
		return normalizeEvent(directFetchedRawEvent);
	}, [directFetchedRawEvent]);

	// Handle event selection from URL
	useEffect(() => {
		if (!eventId) {
			setSelectedEvent(null);
			return;
		}

		// Priority 1: Check if already in loaded/cached events
		if (eventInCache) {
			setSelectedEvent(eventInCache);
			return;
		}

		// Priority 2: Use directly fetched event
		if (directFetchedEvent) {
			setSelectedEvent(directFetchedEvent);
			return;
		}

		// Don't clear selection while loading
	}, [eventId, eventInCache, directFetchedEvent]);

	// IntersectionObserver for infinite scroll
	useEffect(() => {
		// Only enable infinite scroll for upcoming (all) and past
		if (primaryView !== "upcoming" && primaryView !== "past") return;
		// Disable infinite scroll when quick filters are active (today/week are client-side)
		if (primaryView === "upcoming" && quickRange !== null) return;
		if (!hasNextPage || isFetchingNextPage) return;

		const sentinel = bottomSentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage();
				}
			},
			{ rootMargin: "400px", threshold: 0 },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [primaryView, quickRange, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleCloseEvent = () => {
		setSelectedEvent(null);
		navigate({ to: "/events", search: {} });
	};

	const handleSelectEvent = (event: NormalizedEvent) => {
		setSelectedEvent(event);
	};

	// Group events by date for display
	const groupedEvents = useMemo(() => {
		const grouped = new Map<string, NormalizedEvent[]>();

		filteredEvents.forEach((event) => {
			const rawEvent = rawEventMap.get(event.id);
			const eventDate = parseEventDate(rawEvent?.start_time);
			if (!eventDate) return;

			// Use UTC since dates are stored as "fake UTC" (PT times with UTC marker)
			const dateKey = eventDate
				.toLocaleDateString("en-US", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					timeZone: "UTC",
				})
				.split("/")
				.reverse()
				.join("-")
				.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1-$3-$2");

			if (!grouped.has(dateKey)) grouped.set(dateKey, []);
			grouped.get(dateKey)?.push(event);
		});

		return Array.from(grouped.entries())
			.map(([dateKey, events]) => {
				const date = new Date(dateKey + "T00:00:00Z");
				const displayDate = date.toLocaleDateString("en-US", {
					weekday: "long",
					month: "long",
					day: "numeric",
					year: "numeric",
					timeZone: "UTC",
				});
				// Sort events within each date group by start time
				const sortedEvents = events.sort((a, b) => {
					const rawEventA = rawEventMap.get(a.id);
					const rawEventB = rawEventMap.get(b.id);
					const dateA = parseEventDate(rawEventA?.start_time);
					const dateB = parseEventDate(rawEventB?.start_time);

					if (!dateA) return 1;
					if (!dateB) return -1;

					return dateA.getTime() - dateB.getTime();
				});

				return { date: dateKey, displayDate, events: sortedEvents };
			})
			.sort((a, b) =>
				primaryView === "past"
					? b.date.localeCompare(a.date)
					: a.date.localeCompare(b.date),
			);
	}, [filteredEvents, rawEventMap, primaryView]);

	if (error) {
		return (
			<div className="w-full max-w-7xl mx-auto py-32 px-4">
				<div className="text-center py-12">
					<p className="text-red-500 text-lg">
						Failed to load events. Please try again later.
					</p>
				</div>
			</div>
		);
	}

	// Show error dialog if direct fetch failed or event not found
	const showEventNotFound =
		eventId &&
		!isDirectFetching &&
		!directFetchError &&
		!eventInCache &&
		directFetchedRawEvent === null;

	return (
		<div className="w-full max-w-7xl mx-auto py-32 px-4">
			{/* Loading overlay when fetching specific event from URL */}
			{eventId && isDirectFetching && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-4">
						<LoaderCircle className="h-8 w-8 animate-spin text-ucr-blue dark:text-ucr-gold" />
						<p className="text-sm text-muted-foreground">Loading event...</p>
					</div>
				</div>
			)}

			{/* Error dialog when event not found */}
			{(showEventNotFound || directFetchError) && (
				<Dialog
					open={true}
					onOpenChange={() => navigate({ to: "/events", search: {} })}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Event Not Found</DialogTitle>
						</DialogHeader>
						<p className="text-muted-foreground">
							We couldn't find the event you're looking for. It may have been
							removed or the link is incorrect.
						</p>
						<Button
							onClick={() => navigate({ to: "/events", search: {} })}
							className="mt-4"
						>
							Browse Events
						</Button>
					</DialogContent>
				</Dialog>
			)}

			<div className="flex flex-col gap-4 mb-4 md:mb-8">
				<div className="flex justify-between w-full items-center">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
						Events
					</h1>

					<div className="hidden md:flex items-center gap-3">
						<Search
							query={searchQuery}
							onQueryChange={setSearchQuery}
							eventResults={cachedBuckets.upcoming}
							onSelectEvent={handleSelectEvent}
						/>

						{/* Primary View Segmented Control */}
						<div className="inline-flex rounded-full border border-ucr-blue dark:border-ucr-gold p-1">
							<PrimaryViewButton
								active={primaryView === "upcoming"}
								onClick={() => {
									setPrimaryView("upcoming");
									setQuickRange(null);
								}}
							>
								Upcoming ({queryCounts.upcoming})
							</PrimaryViewButton>
							<PrimaryViewButton
								active={primaryView === "past"}
								onClick={() => {
									setPrimaryView("past");
									setQuickRange(null);
								}}
							>
								Past ({queryCounts.past})
							</PrimaryViewButton>
						</div>
					</div>
				</div>

				{/* Quick Filters - Desktop (only show when Upcoming is selected) */}
				{primaryView === "upcoming" && (
					<div className="hidden md:flex items-center gap-2 justify-end">
						<span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
							Quick filters:
						</span>
						<QuickFilterChip
							active={quickRange === null}
							onClick={() => setQuickRange(null)}
						>
							All upcoming
						</QuickFilterChip>
						<QuickFilterChip
							active={quickRange === "today"}
							onClick={() => setQuickRange("today")}
							count={queryCounts.today}
							disabled={!queryCounts.today}
							suggested={!!queryCounts.today && queryCounts.today > 0}
						>
							Today
						</QuickFilterChip>
						<QuickFilterChip
							active={quickRange === "week"}
							onClick={() => setQuickRange("week")}
							count={queryCounts.week}
							disabled={!queryCounts.week}
						>
							This week
						</QuickFilterChip>
					</div>
				)}
			</div>

			<div className="md:hidden sticky top-16 z-40 bg-background/80 backdrop-blur-md py-2 mb-4">
				<Search
					query={searchQuery}
					onQueryChange={setSearchQuery}
					eventResults={cachedBuckets.upcoming}
					onSelectEvent={handleSelectEvent}
				/>

				{/* Primary View Segmented Control - Mobile */}
				<div className="inline-flex rounded-full border border-ucr-blue dark:border-ucr-gold p-1 mt-3 w-full">
					<PrimaryViewButton
						active={primaryView === "upcoming"}
						onClick={() => {
							setPrimaryView("upcoming");
							setQuickRange(null);
						}}
						className="flex-1"
					>
						Upcoming ({queryCounts.upcoming})
					</PrimaryViewButton>
					<PrimaryViewButton
						active={primaryView === "past"}
						onClick={() => {
							setPrimaryView("past");
							setQuickRange(null);
						}}
						className="flex-1"
					>
						Past ({queryCounts.past})
					</PrimaryViewButton>
				</div>

				{/* Quick Filters - Mobile (only show when Upcoming is selected) */}
				{primaryView === "upcoming" && (
					<div className="flex justify-center items-center gap-2 mt-3 pb-2">
						<QuickFilterChip
							active={quickRange === null}
							onClick={() => setQuickRange(null)}
						>
							All
						</QuickFilterChip>
						<QuickFilterChip
							active={quickRange === "today"}
							onClick={() => setQuickRange("today")}
							count={queryCounts.today}
							disabled={!queryCounts.today}
							suggested={!!queryCounts.today && queryCounts.today > 0}
						>
							Today
						</QuickFilterChip>
						<QuickFilterChip
							active={quickRange === "week"}
							onClick={() => setQuickRange("week")}
							count={queryCounts.week}
							disabled={!queryCounts.week}
						>
							This week
						</QuickFilterChip>
					</div>
				)}
			</div>

			{isLoading ? (
				<Loading />
			) : filteredEvents.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500 dark:text-gray-400 text-lg">
						{quickRange === "today"
							? "No events today."
							: quickRange === "week"
								? "No events this week."
								: primaryView === "upcoming"
									? "No upcoming events found."
									: "No past events found."}
					</p>
					{quickRange !== null && (
						<Button
							variant="outline"
							onClick={() => setQuickRange(null)}
							className="mt-4 rounded-full"
						>
							View all upcoming events
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-6 md:space-y-12">
					{groupedEvents.map(({ date, displayDate, events }) => (
						<div key={date}>
							<div className="mb-4 md:mb-6">
								<div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
									{displayDate}
								</div>
								<div className="h-px bg-ucr-blue dark:bg-ucr-gold" />
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
								{events.map((event) => (
									<EventCard
										key={event.id}
										event={event}
										onClick={() => setSelectedEvent(event)}
									/>
								))}
							</div>
						</div>
					))}

					{/* Sentinel for infinite scroll */}
					{((primaryView === "upcoming" && quickRange === null) ||
						primaryView === "past") && (
						<div ref={bottomSentinelRef} className="h-16" />
					)}

					{isFetchingNextPage && hasNextPage && (
						<div className="flex h-full w-full flex-col items-center justify-center py-4">
							<LoaderCircle className="animate-spin text-ucr-blue dark:text-ucr-gold" />
						</div>
					)}

					{!hasNextPage &&
						!isFetchingNextPage &&
						filteredEvents.length > 0 &&
						primaryView === "upcoming" && (
							<div className="text-center py-8 space-y-4">
								<p className="text-gray-500 dark:text-gray-400">
									No more upcoming events
								</p>
								<Button
									variant="outline"
									onClick={() =>
										window.scrollTo({ top: 0, behavior: "smooth" })
									}
									className="rounded-full"
								>
									Back to top
								</Button>
							</div>
						)}

					{!hasNextPage &&
						!isFetchingNextPage &&
						filteredEvents.length > 0 &&
						primaryView === "past" && (
							<div className="text-center py-8 space-y-4">
								<p className="text-gray-500 dark:text-gray-400">
									No more past events
								</p>
								<Button
									variant="outline"
									onClick={() =>
										window.scrollTo({ top: 0, behavior: "smooth" })
									}
									className="rounded-full"
								>
									Back to top
								</Button>
							</div>
						)}
				</div>
			)}

			{selectedEvent && (
				<EventDetail
					event={selectedEvent}
					isOpen={!!selectedEvent}
					onClose={handleCloseEvent}
				/>
			)}
		</div>
	);
};

export default Events;

// Primary View Segmented Button (for Upcoming/Past)
type PrimaryViewButtonProps = {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
};

const PrimaryViewButton = ({
	active,
	onClick,
	children,
	className,
}: PrimaryViewButtonProps) => {
	return (
		<Button
			onClick={onClick}
			className={cn(
				"rounded-full transition-all px-5 py-2 font-medium",
				active
					? "bg-ucr-blue text-white shadow-md shadow-ucr-blue/30 dark:bg-ucr-gold dark:text-black dark:shadow-ucr-gold/30 hover:bg-ucr-blue dark:hover:bg-ucr-gold"
					: "bg-transparent text-ucr-blue hover:bg-ucr-blue/10 dark:text-ucr-gold dark:hover:bg-ucr-gold/10",
				className,
			)}
		>
			{children}
		</Button>
	);
};

// Quick Filter Chip (for Today/This week/All upcoming)
type QuickFilterChipProps = {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
	count?: number;
	disabled?: boolean;
	suggested?: boolean;
	className?: string;
};

const QuickFilterChip = ({
	active,
	onClick,
	children,
	count,
	disabled,
	suggested,
	className,
}: QuickFilterChipProps) => {
	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"rounded-full transition-all px-4 py-1.5 text-sm whitespace-nowrap relative",
				active
					? "bg-ucr-blue/10 hover:bg-blue-ucr text-ucr-blue border border-ucr-blue dark:bg-ucr-gold/10 dark:text-ucr-gold dark:border-ucr-gold"
					: "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800",
				disabled &&
					"opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent",
				className,
			)}
		>
			{suggested && !active && (
				<span className="absolute -top-1 -right-1 flex h-3 w-3">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ucr-blue dark:bg-ucr-gold opacity-75"></span>
					<span className="relative inline-flex rounded-full h-3 w-3 bg-ucr-blue dark:bg-ucr-gold"></span>
				</span>
			)}
			{children}
			{count !== undefined && ` (${count})`}
		</Button>
	);
};
