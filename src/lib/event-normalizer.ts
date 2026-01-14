import { formatEventDate } from './date-utils'
import type { RawEvent, NormalizedEvent } from '@/types/events'

export function normalizeEvent(event: RawEvent): NormalizedEvent {
  const startDate = formatEventDate(event.start_time)
  const endDate = formatEventDate(event.end_time)

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    organization: event.organization,
    date: {
      day: startDate.day,
      monthDay: startDate.monthDay,
      time: startDate.time,
      endTime: endDate.time,
      isTBD: startDate.isTBD
    },
    location: {
      name: event.location?.name,
      campus: event.location?.campus,
      isTBD: !event.location
    },
    media: {
      cover: event.media[0],
      all: event.media
    },
    source: {
      platform: event.source,
      url: event.original_post
    }
  }
}
