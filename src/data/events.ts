import { createServerFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { events } from "@/db/schemas";
import type { RawEvent } from "@/types/events";

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
		};
	});

export const getOrganizationEvents = createServerFn()
	.inputValidator(z.object({ organizationId: z.string() }))
	.handler(async ({ data }): Promise<RawEvent[]> => {
		// Since organizationId is now a JSONB array, we need to check if it contains the ID
		const result = await db
			.select()
			.from(events)
			.where(sql`${events.organizationId}::jsonb @> ${JSON.stringify([data.organizationId])}::jsonb`);

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


export const getEventsAdmin = createServerFn().handler(
	async (): Promise<RawEvent[]> => {
		const result = await db.select().from(events);

		return mapEvents(result);
	},
);