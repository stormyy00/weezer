import Dashboard from '@/components/admin/organizations'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/organizations/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Dashboard />;
}
