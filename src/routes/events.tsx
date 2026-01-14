import Events from '@/components/events';
import { getEvents } from '@/data/events'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events')({
  component: RouteComponent,
  loader: async () => {
    return getEvents();
  }
})

function RouteComponent() {
    const events = Route.useLoaderData()

  return <Events data={events} />;
}
