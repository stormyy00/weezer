import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/statistics")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			// statistics of current jobs ran total, error rate, most scrape insta
			profile, most shared event, most viewed organization, most org generated
			events,
		</div>
	);
}
