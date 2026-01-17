
import { pgTable, text, timestamp, jsonb, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';

export const rawPosts = pgTable('raw_posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Post Data
  platform: text('platform').notNull().default('instagram'), // Always "instagram" for now
  handle: text('handle').notNull(), // Instagram handle this came from
  caption: text('caption').notNull(),
  mediaUrls: jsonb('media_urls').notNull().default('[]'), // Array of image/video URLs
  postUrl: text('post_url').notNull(), // Direct link to Instagram post
  postedAt: timestamp('posted_at', { withTimezone: true }).notNull(),

  isEvent: boolean('is_event'), // Whether this post likely contains an event
  // Raw Data Storage
  raw: jsonb('raw').notNull(), // Full instaloader post data
  // Foreign Key
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: text('status').default('pending'), // pending, processing, completed, failed, rate_limited
  attempts: integer('attempts').default(0),
  error_message: text('error_message'),
  processing_started_at: timestamp('processing_started_at'),
  processing_completed_at: timestamp('processing_completed_at'),
  retry_after: timestamp('retry_after'),
});

export const rawPostsRelations = relations(rawPosts, ({ one }) => ({
  organization: one(organizations, {
    fields: [rawPosts.organizationId],
    references: [organizations.id],
  }),
}));

export type RawPost = typeof rawPosts.$inferSelect;
export type InsertRawPost = typeof rawPosts.$inferInsert;
