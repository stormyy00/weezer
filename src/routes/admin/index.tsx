import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin"!

    should show todays scraped jobs with status and ability to view details of each job
    total jobs scraped today
    total errors today
    stats as well as most scrapped instagram profiles today
  </div>
}