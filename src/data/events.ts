import { createServerFn } from "@tanstack/react-start"
import { db } from "@/db"
import { events } from "@/db/schemas"
import type { RawEvent } from "@/types/events"

/**
 * Converts an R2 URL to a proxied URL that goes through our backend
 */
function getProxiedImageUrl(r2Url: string): string {
  try {
    const url = new URL(r2Url)
    const path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
    return `/api/images/${path}`
  } catch {
    return r2Url
  }
}

export const getEvents = createServerFn().handler(async (): Promise<RawEvent[]> => {

  const result = await db.select({
    id: events.id,
    source: events.postUrl,
    organization: events.organization,
    title: events.title,
    description: events.description,
    start_time: events.startAt,
    end_time: events.endAt,
    location: events.location,
    original_post: events.postUrl,
    media: events.imageUrls
  }).from(events)

  // Map the result to RawEvent format
  const mappedResult: RawEvent[] = result.map(event => {
    // Convert timestamp to local ISO string (remove Z to indicate local time)
    const formatLocalTime = (date: Date | null) => {
      if (!date) return null
      // Get the ISO string and keep it in the original timezone
      return date.toISOString()
    }

    // Convert R2 URLs to proxied URLs
    const mediaUrls = Array.isArray(event.media) ? event.media as string[] : []
    const proxiedMedia = mediaUrls.map(url => getProxiedImageUrl(url))

    return {
      id: event.id,
      source: event.source?.includes('instagram.com') ? 'instagram' as const : 'other' as const,
      organization: event.organization,
      title: event.title ?? '',
      description: event.description ?? undefined,
      start_time: formatLocalTime(event.start_time),
      end_time: formatLocalTime(event.end_time),
      location: event.location ? { name: event.location } : null,
      original_post: event.original_post,
      media: proxiedMedia
    }
  })

  return mappedResult
})
