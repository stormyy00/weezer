import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import OrgDetails from "@/components/organizations/org-details";
import { getOrganizationEvents } from "@/data/events";
import { getOrganizationById } from "@/data/organization";

const eventSearchSchema = z.object({
	event: z.string().optional(),
});

export const Route = createFileRoute("/organizations/$id")({
	component: RouteComponent,
	validateSearch: eventSearchSchema,
	loader: async ({ params }) => {
		const { id } = params;
		const organization = await getOrganizationById({ data: { id } });
		const events = await getOrganizationEvents({ data: { organizationId: id } });
		return { organization, events };
	},
});

function RouteComponent() {
	const { organization, events } = Route.useLoaderData();
	const { event: eventId } = Route.useSearch();
	return <OrgDetails organization={organization} events={events} eventId={eventId} />;
}
