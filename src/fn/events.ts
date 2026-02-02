import { createServerFn } from "@tanstack/react-start";
import {
	sql,
	eq,
	and,
	or,
	gte,
	lt,
	asc,
	desc,
	isNotNull,
	ilike,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { events } from "@/db/schemas";
import type { RawEvent } from "@/types/events";
import { authenticate } from "@/middleware/auth";

const formatLocalTime = (date: Date | null) => {
	if (!date) return null;
	return date.toISOString();
};

const mapEvents = (result: Array<typeof events.$inferSelect>): RawEvent[] =>
	result.map((event) => {
		const mediaUrls = Array.isArray(event.imageUrls)
			? (event.imageUrls as string[])
			: [];
		const proxiedMedia = mediaUrls.map((url) => getProxiedImageUrl(url));

		const organizationArray = Array.isArray(event.organization)
			? (event.organization as string[])
			: [];
		const primaryOrganization = organizationArray[0] ?? "";

		const organizationIdArray = Array.isArray(event.organizationId)
			? (event.organizationId as string[])
			: [];
		const primaryOrganizationId = organizationIdArray[0] ?? null;

		return {
			id: event.id,
			source: event.postUrl?.includes("instagram.com")
				? ("instagram" as const)
				: ("other" as const),
			organization: primaryOrganization,
			organizations: organizationArray,
			organizationId: primaryOrganizationId,
			organizationIds: organizationIdArray,
			title: event.title ?? "",
			description: event.description ?? undefined,
			start_time: formatLocalTime(event.startAt),
			end_time: formatLocalTime(event.endAt),
			location: event.location ? { name: event.location } : null,
			original_post: event.postUrl,
			media: proxiedMedia,
			created_at: formatLocalTime(event.createdAt),
			confidence: event.confidence as Record<string, number> | undefined,
			evidence: event.evidence as Record<string, any> | undefined,
		} as any;
	});

export const getOrganizationEvents = createServerFn()
	.inputValidator(z.object({ organizationId: z.string() }))
	.handler(async ({ data }): Promise<RawEvent[]> => {
		// Since organizationId is now a JSONB array, we need to check if it contains the ID
		const result = await db
			.select()
			.from(events)
			.where(
				sql`${events.organizationId}::jsonb @> ${JSON.stringify([data.organizationId])}::jsonb`,
			);

		return mapEvents(result);
	});

/**
 * Converts an R2 URL to a proxied URL that goes through our backend
 */
function getProxiedImageUrl(r2Url: string): string {
	try {
		const url = new URL(r2Url);
		const path = url.pathname.startsWith("/")
			? url.pathname.slice(1)
			: url.pathname;
		return `/api/images/${path}`;
	} catch {
		return r2Url;
	}
}

export const getEvents = createServerFn().handler(
	async (): Promise<RawEvent[]> => {
		const result = await db.select().from(events);

		return mapEvents(result);
	},
);

export const getEventsAdmin = createServerFn()
	.middleware([authenticate])
	.handler(async (): Promise<RawEvent[]> => {
		const result = await db.select().from(events);

		return mapEvents(result);
	});

export const getEventById = createServerFn()
	.middleware([authenticate])
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }): Promise<RawEvent | null> => {
		const result = await db.select().from(events).where(eq(events.id, data.id));

		if (result.length === 0) {
			return null;
		}

		return mapEvents(result)[0];
	});

export const getEventByIdPublic = createServerFn()
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }): Promise<RawEvent | null> => {
		const result = await db.select().from(events).where(eq(events.id, data.id));

		if (result.length === 0) {
			return null;
		}

		return mapEvents(result)[0];
	});

export const updateEvents = createServerFn()
	.middleware([authenticate])
	.inputValidator(
		z.object({
			eventIds: z.array(z.string()),
		}),
	)
	.handler(async ({ data }): Promise<void> => {
		await db
			.update(events)
			.set({ updatedAt: sql`NOW()` })
			.where(sql`${events.id} = ANY(${data.eventIds})`);
	});

export const deleteEvent = createServerFn()
	.middleware([authenticate])
	.inputValidator(
		z.object({
			eventId: z.string(),
		}),
	)
	.handler(async ({ data }): Promise<void> => {
		await db.delete(events).where(eq(events.id, data.eventId));
	});

// ============================================
// Paginated Events API
// ============================================

const TZ = "America/Los_Angeles";

/**
 * Get current time in Pacific Time as a "fake UTC" date.
 * Since the database stores PT times with UTC timezone markers,
 * we need to compare using PT time values, not actual UTC.
 */
function getNowInPT(): Date {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	const parts = formatter.formatToParts(now);
	const year = parseInt(parts.find((p) => p.type === "year")?.value || "0");
	const month =
		parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1;
	const day = parseInt(parts.find((p) => p.type === "day")?.value || "1");
	const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
	const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
	const second = parseInt(parts.find((p) => p.type === "second")?.value || "0");

	// Return PT time as if it were UTC (to match how DB stores times)
	return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Get start of day (00:00:00) for a "fake UTC" date
 * Since DB stores PT times with UTC timezone marker, and the input date
 * is already in "fake UTC" format, we just zero out the time components.
 */
function getStartOfDay(date: Date): Date {
	// Since the date is already in "fake UTC" (PT time stored as UTC),
	// we just extract the UTC date components and set time to midnight
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			0,
			0,
			0,
			0,
		),
	);
}

/**
 * Get end of day (23:59:59.999) in Pacific Time
 * Returns a Date object representing the start of the next day (for < comparison)
 */
function getEndOfDay(date: Date): Date {
	// Get today's start and add exactly 24 hours
	const start = getStartOfDay(date);
	return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Get start of week (Sunday) for a "fake UTC" date
 */
function getStartOfWeek(date: Date): Date {
	const start = getStartOfDay(date);
	// Since we're using "fake UTC", getUTCDay() gives the correct day of week
	const dayOfWeek = start.getUTCDay();
	// Subtract days to get to Sunday
	return new Date(start.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
}

/**
 * Get end of week (Saturday end) in Pacific Time
 */
function getEndOfWeek(date: Date): Date {
	const start = getStartOfWeek(date);
	// Add 7 days worth of milliseconds
	return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
}

// Input validation schema for paginated events
const paginatedEventsSchema = z.object({
	view: z.enum(["upcoming", "week", "past", "today"]).default("upcoming"),
	direction: z.enum(["upcoming", "past"]).optional(),
	cursor: z.string().optional(), // ISO date string
	days: z.number().int().positive().max(14).default(2),
});

// Response type for paginated events
export type PaginatedEventsResponse = {
	events: RawEvent[];
	nextCursor: string | null;
	hasMore: boolean;
};

export const getEventsPaginated = createServerFn()
	.inputValidator(paginatedEventsSchema)
	.handler(async ({ data }): Promise<PaginatedEventsResponse> => {
		const { view, direction: _direction, cursor } = data;
		// Use PT time since DB stores PT times with UTC marker
		const now = getNowInPT();

		// Handle different views
		if (view === "today") {
			const todayStart = getStartOfDay(now);
			const todayEnd = getEndOfDay(now);

			const result = await db
				.select()
				.from(events)
				.where(
					and(gte(events.startAt, todayStart), lt(events.startAt, todayEnd)),
				)
				.orderBy(asc(events.startAt));

			return {
				events: mapEvents(result),
				nextCursor: null,
				hasMore: false,
			};
		}

		if (view === "week") {
			const weekStart = getStartOfWeek(now);
			const weekEnd = getEndOfWeek(now);

			const result = await db
				.select()
				.from(events)
				.where(
					and(
						gte(events.startAt, weekStart),
						lt(events.startAt, weekEnd),
						isNotNull(events.startAt),
					),
				)
				.orderBy(asc(events.startAt));

			return {
				events: mapEvents(result),
				nextCursor: null,
				hasMore: false,
			};
		}

		if (view === "past") {
			// Past: paginate by the most recent day that has events, clamped to now (PT)
			// boundEnd is exclusive upper bound: now on first page; cursor (dayStart) on subsequent pages
			const boundEnd = cursor ? new Date(cursor) : now;
			const ceiling = boundEnd < now ? boundEnd : now;

			// Find the most recent event before the bound (and before now)
			const prevEvent = await db
				.select({ startAt: events.startAt })
				.from(events)
				.where(
					and(
						isNotNull(events.startAt),
						lt(events.startAt, boundEnd),
						lt(events.startAt, now),
					),
				)
				.orderBy(desc(events.startAt))
				.limit(1);

			if (prevEvent.length === 0 || !prevEvent[0]?.startAt) {
				return { events: [], nextCursor: null, hasMore: false };
			}

			const firstStart = prevEvent[0].startAt as Date;
			const dayStart = getStartOfDay(firstStart);
			const dayEnd = getEndOfDay(firstStart);

			// Cap at ceiling (min of boundEnd, dayEnd, now) to avoid including >= now
			const minBound = ceiling < dayEnd ? ceiling : dayEnd;
			const pageEnd = minBound;

			// If the window is empty or inverted, short-circuit and rely on hasMore below
			if (pageEnd <= dayStart) {
				const checkMoreEmpty = await db
					.select({ count: sql<number>`COUNT(*)` })
					.from(events)
					.where(
						and(
							lt(events.startAt, dayStart),
							lt(events.startAt, now),
							isNotNull(events.startAt),
						),
					);

				const hasMoreEmpty = Number(checkMoreEmpty[0]?.count ?? 0) > 0;
				return {
					events: [],
					nextCursor: hasMoreEmpty ? dayStart.toISOString() : null,
					hasMore: hasMoreEmpty,
				};
			}

			const result = await db
				.select()
				.from(events)
				.where(
					and(
						gte(events.startAt, dayStart),
						lt(events.startAt, pageEnd),
						isNotNull(events.startAt),
						lt(events.startAt, now),
					),
				)
				.orderBy(desc(events.startAt));

			// Safety filter in case any rows slip through at/after now
			const filtered = result.filter((row) => row.startAt && row.startAt < now);

			// Determine if there are events before this day (only count actual past events)
			const checkMore = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(events)
				.where(
					and(
						lt(events.startAt, dayStart),
						lt(events.startAt, now),
						isNotNull(events.startAt),
					),
				);

			const hasMore = Number(checkMore[0]?.count ?? 0) > 0;

			return {
				events: mapEvents(filtered),
				nextCursor: hasMore ? dayStart.toISOString() : null,
				hasMore,
			};
		}

		// Default: "upcoming" view - paginate by the next day that has events
		// Cursor is treated as a lower bound timestamp (ISO string)
		const bound = cursor ? new Date(cursor) : now;

		// Find the next event on or after the bound
		const nextEvent = await db
			.select({ startAt: events.startAt })
			.from(events)
			.where(and(isNotNull(events.startAt), gte(events.startAt, bound)))
			.orderBy(asc(events.startAt))
			.limit(1);

		if (nextEvent.length === 0 || !nextEvent[0]?.startAt) {
			return { events: [], nextCursor: null, hasMore: false };
		}

		const firstStart = nextEvent[0].startAt as Date;
		const dayStart = getStartOfDay(firstStart);
		const dayEnd = getEndOfDay(firstStart);

		// For today, avoid returning already-started events earlier today
		const pageStart = bound > dayStart ? bound : dayStart;

		const result = await db
			.select()
			.from(events)
			.where(
				and(
					gte(events.startAt, pageStart),
					lt(events.startAt, dayEnd),
					isNotNull(events.startAt),
				),
			)
			.orderBy(asc(events.startAt));

		// Determine if there are events after this day
		const checkMore = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(events)
			.where(and(gte(events.startAt, dayEnd), isNotNull(events.startAt)));

		const hasMore = Number(checkMore[0]?.count ?? 0) > 0;

		return {
			events: mapEvents(result),
			nextCursor: hasMore ? dayEnd.toISOString() : null,
			hasMore,
		};
	});

// Event counts for filter buttons
export type EventCounts = {
	today: number;
	week: number;
	upcoming: number;
	past: number;
};

export const getEventCounts = createServerFn().handler(
	async (): Promise<EventCounts> => {
		// Use PT time since DB stores PT times with UTC marker
		const now = getNowInPT();
		const todayStart = getStartOfDay(now);
		const todayEnd = getEndOfDay(now);
		const weekStart = getStartOfWeek(now);
		const weekEnd = getEndOfWeek(now);

		// Run separate count queries for reliability
		const [todayResult, weekResult, upcomingResult, pastResult] =
			await Promise.all([
				db
					.select({ count: sql<number>`count(*)` })
					.from(events)
					.where(
						and(gte(events.startAt, todayStart), lt(events.startAt, todayEnd)),
					),
				db
					.select({ count: sql<number>`count(*)` })
					.from(events)
					.where(
						and(
							isNotNull(events.startAt),
							gte(events.startAt, weekStart),
							lt(events.startAt, weekEnd),
						),
					),
				db
					.select({ count: sql<number>`count(*)` })
					.from(events)
					.where(and(isNotNull(events.startAt), gte(events.startAt, now))),
				db
					.select({ count: sql<number>`count(*)` })
					.from(events)
					.where(and(isNotNull(events.startAt), lt(events.startAt, now))),
			]);

		return {
			today: Number(todayResult[0]?.count ?? 0),
			week: Number(weekResult[0]?.count ?? 0),
			upcoming: Number(upcomingResult[0]?.count ?? 0),
			past: Number(pastResult[0]?.count ?? 0),
		};
	},
);

const searchEventsSchema = z.object({
	query: z.string().min(1).max(100),
	limit: z.number().int().min(1).max(100).default(50),
});

export const searchEvents = createServerFn()
	.inputValidator(searchEventsSchema)
	.handler(async ({ data }): Promise<RawEvent[]> => {
		const { query, limit } = data;
		const searchPattern = `%${query}%`;

		const result = await db
			.select()
			.from(events)
			.where(
				and(
					isNotNull(events.startAt),
					or(
						ilike(events.title, searchPattern),
						sql`${events.organization}::text ILIKE ${searchPattern}`,
					),
				),
			)
			.orderBy(desc(events.startAt))
			.limit(limit);

		return mapEvents(result);
	});
