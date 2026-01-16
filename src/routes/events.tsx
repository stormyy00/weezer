import Events from '@/components/events';
import { getEvents } from '@/data/events'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const eventSearchSchema = z.object({
  event: z.string().optional(),
})

export const Route = createFileRoute('/events')({
  component: RouteComponent,
  validateSearch: eventSearchSchema,
  loader: async () => {
    return getEvents();
  }
})

function RouteComponent() {
  const events = Route.useLoaderData()
  const { event: eventId } = Route.useSearch()
  return <Events data={events} eventId={eventId} />;
}
