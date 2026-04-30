import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentProps } from "react";

// Leaflet pulls in `window` at module scope, which crashes during TanStack
// Start's SSR pass. Defer the import to the client by combining
// React.lazy() with a mount guard.
const EventMap = lazy(() => import("./event-map"));

type Props = ComponentProps<typeof EventMap>;

export default function EventMapLazy(props: Props) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className="h-[70vh] w-full animate-pulse rounded-lg border bg-muted" />
		);
	}

	return (
		<Suspense
			fallback={
				<div className="h-[70vh] w-full animate-pulse rounded-lg border bg-muted" />
			}
		>
			<EventMap {...props} />
		</Suspense>
	);
}
