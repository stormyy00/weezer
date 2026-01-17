import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Event Data
  title: text('title'),
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt: timestamp('end_at', { withTimezone: true }),
  location: text('location'),
  description: text('description'),

  // Source Tracking
  organization: jsonb('organization').notNull().default('[]'), // Array of handles
  organizationId: jsonb('organization_id').default('[]'),
  postUrl: text('post_url').notNull(), // Instagram post URL
  imageUrls: jsonb('image_urls').notNull().default('[]'), // Flyer images
  sources: jsonb('sources').notNull().default('[]'), // Source post IDs

  // LLM Extraction Metadata
  confidence: jsonb('confidence').notNull().default('{}'), // {"title": 0.9, "start_at": 0.85, "location": 0.7}
  evidence: jsonb('evidence').notNull().default('{}'), // Raw extraction data for debugging

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const eventsRelations = relations(events, ({ one }) => ({
  organization: one(organizations, {
    fields: [events.organizationId],
    references: [organizations.id],
  }),
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
