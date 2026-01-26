import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/raw-posts")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/raw-posts"!</div>;
}
