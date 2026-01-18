import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/queue')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/queue"!

    if there is a a queue we can see the current amounts 
  </div>
}
