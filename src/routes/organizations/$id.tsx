import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import OrgDetails from "@/components/organizations/org-details";
import { getOrganizationEvents } from "@/data/events";
import { getOrganizationById } from "@/data/organization";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import loading from "@/components/loading";

const eventSearchSchema = z.object({
  event: z.string().optional(),
});

export const Route = createFileRoute("/organizations/$id")({
  component: RouteComponent,
  validateSearch: eventSearchSchema,
  loader: async ({ params, context }) => {
    const { id } = params;

    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["organizations", id],
        queryFn: () => getOrganizationById({ data: { id } }),
      }),
      context.queryClient.prefetchQuery({
        queryKey: ["events", id],
        queryFn: () => getOrganizationEvents({ data: { organizationId: id } }),
      }),
    ]);
  },
  pendingComponent: loading,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { event: eventId } = Route.useSearch();

  const { data: organization } = useFetchOrganizationById(id);
  const { data: events } = useFetchOrganizationEvents(id);

  return (
    <OrgDetails organization={organization} events={events} eventId={eventId} />
  );
}

const useFetchOrganizationById = (id: string) => {
  return useSuspenseQuery({
    queryKey: ["organizations", id],
    queryFn: () => getOrganizationById({ data: { id } }),
    gcTime: 5 * 60_000,
  });
};
const useFetchOrganizationEvents = (id: string) => {
  return useSuspenseQuery({
    queryKey: ["events", id],
    queryFn: () => getOrganizationEvents({ data: { organizationId: id } }),
    gcTime: 5 * 60_000,
  });
};
