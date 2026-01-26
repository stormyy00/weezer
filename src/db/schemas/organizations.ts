/**
 * Drizzle ORM Schema for DJ Events Database
 *
 * Tables:
 * - organizations: UCR clubs/orgs with Instagram handles (includes discovered orgs with status)
 * - raw_posts: Raw Instagram post data
 * - events: Extracted event data from posts
 */

import {
	pgTable,
	text,
	timestamp,
	integer,
	jsonb,
	uuid,
	smallint,
	real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rawPosts } from "./raw-posts";
import { events } from "./events";

export const organizations = pgTable("organizations", {
	id: uuid("id").primaryKey().defaultRandom(),

	name: text("name").notNull(), // Display name
	bio: text("bio"), // Short description/mission statement
	instagramHandle: text("instagram_handle"), // @handle (without @), can be null for orgs without Instagram

	// Social Media & Profile
	socials: jsonb("socials").notNull().default("{}"), // {"twitter": "url", "facebook": "url", etc}
	category: text("category"), // Org category (e.g., "Dance", "Academic", etc.)
	profileUrl: text("profile_url"), // HighlanderLink URL
	logoUrl: text("logo_url"), // Organization logo/profile image URL (can be from R2)

	shared: integer("shared").notNull().default(0), // Number of times org profile has been shared
	viewed: integer("viewed").notNull().default(0), // Number of times org profile has been viewed

	// Discovery & Approval
	status: smallint("status").notNull().default(1), // -1: rejected, 0: pending approval, 1: approved/active
	confidence: real("confidence").notNull().default(1.0), // Confidence in data extraction (0.0-1.0)
	discoveredAt: timestamp("discovered_at", { withTimezone: true }), // When scraped from HighlanderLink

	// Stats & Tracking
	totalPosts: integer("total_posts").notNull().default(0),
	totalEvents: integer("total_events").notNull().default(0),
	lastPostAt: timestamp("last_post_at", { withTimezone: true }),
	lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),

	// Metadata
	source: text("source").notNull().default("manual"), // "discovered" or "manual"
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
	rawPosts: many(rawPosts),
	events: many(events),
}));

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
