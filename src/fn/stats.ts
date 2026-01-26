import { db } from "@/db";
import { events, organizations } from "@/db/schemas";
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import z from "zod";

export const updateOraganizationSharedCount = createServerFn()
	.inputValidator(z.object({ orgId: z.string() }))
	.handler(async ({ data }) => {
		await db
			.update(organizations)
			.set({
				shared: sql`${organizations.shared} + 1`,
			})
			.where(eq(organizations.id, data.orgId));
	});

export const updateOrganizationViewedCount = createServerFn()
	.inputValidator(z.object({ orgId: z.string() }))
	.handler(async ({ data }) => {
		await db
			.update(organizations)
			.set({
				viewed: sql`${organizations.viewed} + 1`,
			})
			.where(eq(organizations.id, data.orgId));
	});

export const updateEventSharedCount = createServerFn()
	.inputValidator(z.object({ eventId: z.string() }))
	.handler(async ({ data }) => {
		await db
			.update(events)
			.set({
				shared: sql`${events.shared} + 1`,
			})
			.where(eq(events.id, data.eventId));
	});

export const updateEventViewedCount = createServerFn()
	.inputValidator(z.object({ eventId: z.string() }))
	.handler(async ({ data }) => {
		await db
			.update(events)
			.set({
				viewed: sql`${events.viewed} + 1`,
			})
			.where(eq(events.id, data.eventId));
	});
