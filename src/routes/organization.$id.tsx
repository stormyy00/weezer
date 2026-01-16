import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { id } = params;
    // You can fetch organization data here using the id
    return { id };
  }
})

function RouteComponent() {
  const { id } = Route.useParams();
  return <div>Hello "/organization/{id}"!</div>
}
