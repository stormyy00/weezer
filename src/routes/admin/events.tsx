import Dashboard from '@/components/admin/events'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/events')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Dashboard />
}
