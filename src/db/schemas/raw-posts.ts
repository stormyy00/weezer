
import { pgTable, text, timestamp, jsonb, uuid, boolean } from 'drizzle-orm/pg-core';
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
});

export const rawPostsRelations = relations(rawPosts, ({ one }) => ({
  organization: one(organizations, {
    fields: [rawPosts.organizationId],
    references: [organizations.id],
  }),
}));

export type RawPost = typeof rawPosts.$inferSelect;
export type InsertRawPost = typeof rawPosts.$inferInsert;
