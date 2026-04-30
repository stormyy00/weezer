import Events from "@/components/events";
import loading from "@/components/loading";
import { getEventsPaginated, getEventCounts } from "@/fn/events";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const eventSearchSchema = z.object({
	event: z.string().optional(),
	view: z.enum(["grid", "map"]).optional(),
});

export const Route = createFileRoute("/events")({
	component: RouteComponent,
	pendingComponent: loading,
	validateSearch: eventSearchSchema,
	loader: async ({ context }) => {
		// Prefetch initial events (upcoming view) and counts in parallel
		await Promise.all([
			context.queryClient.prefetchInfiniteQuery({
				queryKey: ["events", "upcoming"],
				queryFn: ({
					pageParam,
				}: {
					pageParam: { direction?: "upcoming" | "past"; cursor?: string };
				}) =>
					getEventsPaginated({
						data: {
							view: "upcoming",
							direction: pageParam?.direction,
							cursor: pageParam?.cursor,
							days: 2,
						},
					}),
				initialPageParam: {},
			}),
			context.queryClient.prefetchQuery({
				queryKey: ["event-counts"],
				queryFn: () => getEventCounts(),
			}),
		]);
	},
});

function RouteComponent() {
	const { event: eventId, view } = Route.useSearch();
	return <Events eventId={eventId} view={view} />;
}
