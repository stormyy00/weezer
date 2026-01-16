import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
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

		return {
			id: event.id,
			source: event.postUrl?.includes("instagram.com")
				? ("instagram" as const)
				: ("other" as const),
			organization: event.organization,
			title: event.title ?? "",
			description: event.description ?? undefined,
			start_time: formatLocalTime(event.startAt),
			end_time: formatLocalTime(event.endAt),
			location: event.location ? { name: event.location } : null,
			original_post: event.postUrl,
			media: proxiedMedia,
			organizationId: event.organizationId,
		};
	});

export const getOrganizationEvents = createServerFn()
	.inputValidator(z.object({ organizationId: z.string() }))
	.handler(async ({ data }): Promise<RawEvent[]> => {
		const result = await db
			.select()
			.from(events)
			.where(eq(events.organizationId, data.organizationId));

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
