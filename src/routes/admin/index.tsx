import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  return <div>Hello "/admin"!</div>
}