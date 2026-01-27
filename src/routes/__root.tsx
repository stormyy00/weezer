import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import Navigation from "@/components/navigation";
import { SearchProvider } from "@/hooks/use-search";
import { ThemeProvider } from "@/hooks/use-theme";
import type { QueryClient } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { seo } from "@/lib/seo";
import { PostHogProvider } from "posthog-js/react";
import { getServerSession } from "@/fn/auth";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	beforeLoad: async () => {
		const session = await getServerSession();
		return { session };
	},
	component: RootComponent,
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			// ...seo({
			//   title: "UCR Events",
			//   description: "Stay updated with the latest events at UCR.",
			//   keywords:
			//     "UCR, events, university, California, campus, student activities, highlanders",
			// }),
			{
				title: "UCR Events",
				description: "Stay updated and discover the latest events at UCR",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootComponent() {
	const { session } = Route.useRouteContext();
	const state = useRouterState();
	const hideNav =
		state.location.pathname.startsWith("/adminlogin") ||
		state.location.pathname.startsWith("/admin");

	return (
		<>
			{!hideNav && (
				<SearchProvider>
					<Navigation session={session} />
				</SearchProvider>
			)}
			<Outlet />
		</>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const options = {
		api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
		defaults: "2025-11-30",
	} as const;

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>
					<PostHogProvider
						apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
						options={options}
					>
						{children}
						<Analytics />
					</PostHogProvider>
				</ThemeProvider>

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
