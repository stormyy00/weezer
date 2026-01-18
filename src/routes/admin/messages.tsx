import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/messages')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/messages"!

    either feedback or messages from users we can view and manage them here as well as respond if needed
  </div>
}
