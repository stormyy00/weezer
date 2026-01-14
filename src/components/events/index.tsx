import { useState, useMemo } from 'react'
import EventCard from './event-card'
import EventDetail from './event-detail'
import { normalizeEvent } from '@/lib/event-normalizer'
import type { RawEvent, NormalizedEvent } from '@/types/events'
import { Button } from '@/components/ui/button'

type EventsProps = {
  data: RawEvent[]
}

type EventFilter = 'upcoming' | 'past'

const Events = ({ data }: EventsProps) => {
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null)
  const [filter, setFilter] = useState<EventFilter>('upcoming')

  const normalizedEvents = data.map(normalizeEvent)

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date()
    const upcoming: NormalizedEvent[] = []
    const past: NormalizedEvent[] = []

    normalizedEvents.forEach((event) => {
      if (event.date.isTBD) {
        // TBD events go to upcoming
        upcoming.push(event)
      } else {
        // Parse the start time from the raw event
        const rawEvent = data.find(e => e.id === event.id)
        if (rawEvent?.start_time) {
          const eventDate = new Date(rawEvent.start_time)
          if (eventDate >= now) {
            upcoming.push(event)
          } else {
            past.push(event)
          }
        } else {
          upcoming.push(event)
        }
      }
    })

    return { upcomingEvents: upcoming, pastEvents: past }
  }, [normalizedEvents, data])

  const displayedEvents = filter === 'upcoming' ? upcomingEvents : pastEvents

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4">
      <div className=" flex justify-between w-full items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Events
        </h1>
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
          className="rounded-full"
        >
          Upcoming ({upcomingEvents.length})
        </Button>
        <Button
          variant={filter === 'past' ? 'default' : 'outline'}
          onClick={() => setFilter('past')}
          className="rounded-full"
        >
          Past ({pastEvents.length})
        </Button>
      </div>
       
      </div>

      {displayedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No {filter} events found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

export default Events
