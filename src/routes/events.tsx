import Events from "@/components/events";
import loading from "@/components/loading";
import { getEvents } from "@/fn/events";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const eventSearchSchema = z.object({
	event: z.string().optional(),
});

export const Route = createFileRoute("/events")({
	component: RouteComponent,
	pendingComponent: loading,
	validateSearch: eventSearchSchema,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: ["events"],
			queryFn: getEvents,
		});
	},
});

function RouteComponent() {
	// const events = Route.useLoaderData()
	const { data: events } = useSuspenseQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
		gcTime: 5 * 60_000, // 5 minutes
	});
	const { event: eventId } = Route.useSearch();
	return <Events data={events} eventId={eventId} />;
}
