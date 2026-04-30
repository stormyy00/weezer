import { useEffect, useMemo, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { Clock, MapPin } from "lucide-react";
import {
	Map,
	MapMarker,
	MapMarkerClusterGroup,
	MapTileLayer,
	MapTooltip,
	MapZoomControl,
} from "@/components/ui/map";
import { useTheme } from "@/hooks/use-theme";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNowInPT, parseEventDate } from "@/lib/date-utils";
import type { NormalizedEvent } from "@/types/events";

const UCR_CENTER: LatLngExpression = [33.9737, -117.3281];

type EventMapProps = {
	events: NormalizedEvent[];
	onEventSelect: (event: NormalizedEvent) => void;
};

// Same convention used by `getEventsPaginated` and `cachedBuckets` in
// index.tsx: timestamps are PT wall-clock tagged as UTC, and `getNowInPT()`
// returns the matching reference for "now."
const isCurrentOrUpcoming = (event: NormalizedEvent, nowMs: number) => {
	const start = parseEventDate(event.startTimeRaw);
	if (!start) return false;
	const end =
		parseEventDate(event.endTimeRaw) ??
		new Date(start.getTime() + 2 * 60 * 60 * 1000);
	return end.getTime() >= nowMs;
};

const formatTimeRange = (event: NormalizedEvent): string => {
	if (event.date.isTBD) return "Time TBD";
	if (event.date.time === "12:00 AM") return "View flyer for time";
	return event.date.endTime
		? `${event.date.time} – ${event.date.endTime}`
		: (event.date.time ?? "");
};

const formatDayLabel = (event: NormalizedEvent, nowMs: number): string => {
	const start = parseEventDate(event.startTimeRaw);
	if (!start) return "";
	const end =
		parseEventDate(event.endTimeRaw) ??
		new Date(start.getTime() + 2 * 60 * 60 * 1000);
	if (start.getTime() <= nowMs && end.getTime() >= nowMs) return "Now";

	const dayMs = 24 * 60 * 60 * 1000;
	const startDayUtc = Date.UTC(
		start.getUTCFullYear(),
		start.getUTCMonth(),
		start.getUTCDate(),
	);
	const nowDayUtc =
		Math.floor(nowMs / dayMs) * dayMs;
	const diffDays = Math.round((startDayUtc - nowDayUtc) / dayMs);

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays > 1 && diffDays < 7) return event.date.day ?? "";
	return event.date.monthDay ?? "";
};

// CARTO tiles (same defaults shadcn-map uses internally, but we resolve them
// against the in-house useTheme hook because shadcn-map relies on next-themes
// which isn't installed in this project).
const LIGHT_TILE_URL =
	"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
const DARK_TILE_URL =
	"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
	'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>';

const useResolvedTheme = (): "light" | "dark" => {
	const { theme } = useTheme();
	const [systemDark, setSystemDark] = useState(false);

	useEffect(() => {
		if (theme !== "system") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		setSystemDark(media.matches);
		const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		media.addEventListener("change", handler);
		return () => media.removeEventListener("change", handler);
	}, [theme]);

	if (theme === "dark") return "dark";
	if (theme === "light") return "light";
	return systemDark ? "dark" : "light";
};

export default function EventMap({ events, onEventSelect }: EventMapProps) {
	const now = getNowInPT();
	const resolvedTheme = useResolvedTheme();
	const tileUrl = resolvedTheme === "dark" ? DARK_TILE_URL : LIGHT_TILE_URL;
	const isMobile = useIsMobile();

	const { groups, offCampusEvents, virtualEvents } = useMemo(() => {
		const buckets: Record<string, NormalizedEvent[]> = {};
		const offCampus: NormalizedEvent[] = [];
		const virtual: NormalizedEvent[] = [];

		for (const event of events) {
			if (!isCurrentOrUpcoming(event, now)) continue;

			const lat = event.location?.latitude;
			const lng = event.location?.longitude;
			const type = event.location?.type;

			if (type === "virtual") {
				virtual.push(event);
				continue;
			}
			if (type !== "on_campus" || typeof lat !== "number" || typeof lng !== "number") {
				offCampus.push(event);
				continue;
			}

			const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
			if (buckets[key]) buckets[key].push(event);
			else buckets[key] = [event];
		}

		const byStart = (a: NormalizedEvent, b: NormalizedEvent) =>
			(a.startTimeRaw ?? "").localeCompare(b.startTimeRaw ?? "");

		const sorted = Object.values(buckets).map((bucket) =>
			bucket.sort(byStart),
		);
		offCampus.sort(byStart);
		virtual.sort(byStart);

		return { groups: sorted, offCampusEvents: offCampus, virtualEvents: virtual };
	}, [events, now]);

	const offMapCount = offCampusEvents.length + virtualEvents.length;

	const [activeBuilding, setActiveBuilding] = useState<NormalizedEvent[] | null>(
		null,
	);
	const [offMapOpen, setOffMapOpen] = useState(false);
	const [offMapTab, setOffMapTab] = useState<"off_campus" | "virtual">(
		"off_campus",
	);

	return (
		<div className="relative h-[70vh] w-full overflow-hidden rounded-lg border">
			<Map center={UCR_CENTER} zoom={16} maxZoom={19} className="h-full w-full">
				<MapTileLayer
					key={resolvedTheme}
					url={tileUrl}
					attribution={TILE_ATTRIBUTION}
				/>
				<MapZoomControl />
				<MapMarkerClusterGroup
					showCoverageOnHover={false}
					disableClusteringAtZoom={17}
					icon={(count) => (
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-full text-base font-bold shadow ring-2 ring-background",
								"bg-ucr-blue text-white dark:bg-ucr-gold dark:text-black",
							)}
						>
							{count}
						</div>
					)}
				>
					{groups.map((group) => {
						const lat = group[0].location.latitude as number;
						const lng = group[0].location.longitude as number;
						return (
							<MapMarker
								key={`${lat},${lng}`}
								position={[lat, lng]}
								icon={
									<div
										className={cn(
											"flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-md ring-2 ring-background",
											"bg-ucr-blue text-white dark:bg-ucr-gold dark:text-black",
										)}
									>
										{group.length}
									</div>
								}
								iconAnchor={[18, 18]}
								eventHandlers={{ click: () => setActiveBuilding(group) }}
							>
								<MapTooltip>{group[0].location.name}</MapTooltip>
							</MapMarker>
						);
					})}
				</MapMarkerClusterGroup>
			</Map>

			{offMapCount > 0 && (
				<Button
					variant="secondary"
					onClick={() => setOffMapOpen(true)}
					className={cn(
						"absolute bottom-4 left-4 z-50 rounded-full px-4 py-2 text-xs font-medium shadow-md",
						"border border-ucr-blue/40 bg-background/95 text-ucr-blue hover:bg-ucr-blue/10",
						"dark:border-ucr-gold/40 dark:text-ucr-gold dark:hover:bg-ucr-gold/10",
					)}
				>
					{offMapCount} not on map
				</Button>
			)}

			<ResponsivePanel
				isMobile={isMobile}
				open={!!activeBuilding}
				onOpenChange={(open) => !open && setActiveBuilding(null)}
				title={activeBuilding?.[0]?.location.name ?? ""}
				description={`${activeBuilding?.length ?? 0} ${
					(activeBuilding?.length ?? 0) === 1 ? "event" : "events"
				} happening now or coming up`}
			>
				<div className="flex flex-col gap-3 px-6 pb-6 pt-4">
					{activeBuilding?.map((event) => (
						<BuildingEventRow
							key={event.id}
							event={event}
							now={now}
							onClick={() => onEventSelect(event)}
						/>
					))}
				</div>
			</ResponsivePanel>

			<ResponsivePanel
				isMobile={isMobile}
				open={offMapOpen}
				onOpenChange={setOffMapOpen}
				title="Not on the map"
				description="Events happening off-campus or online — pinning these would need a wider map than the UCR campus."
			>
				<div className="px-6 pt-4">
					<div className="inline-flex w-full rounded-full border border-ucr-blue p-1 dark:border-ucr-gold">
						<OffMapTabButton
							active={offMapTab === "off_campus"}
							onClick={() => setOffMapTab("off_campus")}
						>
							Off-campus ({offCampusEvents.length})
						</OffMapTabButton>
						<OffMapTabButton
							active={offMapTab === "virtual"}
							onClick={() => setOffMapTab("virtual")}
						>
							Virtual ({virtualEvents.length})
						</OffMapTabButton>
					</div>
				</div>

				<div className="flex flex-col gap-3 px-6 pb-6 pt-4">
					{(offMapTab === "off_campus" ? offCampusEvents : virtualEvents).map(
						(event) => (
							<BuildingEventRow
								key={event.id}
								event={event}
								now={now}
								onClick={() => onEventSelect(event)}
							/>
						),
					)}
					{(offMapTab === "off_campus" ? offCampusEvents : virtualEvents)
						.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							No {offMapTab === "off_campus" ? "off-campus" : "virtual"} events
							right now.
						</p>
					)}
				</div>
			</ResponsivePanel>
		</div>
	);
}

// Bottom drawer on mobile, side sheet on desktop. Both render the same children
// inside the same ScrollArea so callers don't have to branch.
type ResponsivePanelProps = {
	isMobile: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
};

function ResponsivePanel({
	isMobile,
	open,
	onOpenChange,
	title,
	description,
	children,
}: ResponsivePanelProps) {
	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader className="text-left">
						<DrawerTitle>{title}</DrawerTitle>
						{description && <DrawerDescription>{description}</DrawerDescription>}
					</DrawerHeader>
					<ScrollArea className="max-h-[60vh]">{children}</ScrollArea>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-md p-0">
				<SheetHeader className="px-6 pt-6">
					<SheetTitle>{title}</SheetTitle>
					{description && <SheetDescription>{description}</SheetDescription>}
				</SheetHeader>
				<ScrollArea className="h-[calc(100vh-9rem)]">{children}</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

// Mirrors the segmented PrimaryViewButton pill from index.tsx so the off-map
// tabs feel native to the existing UI.
type OffMapTabButtonProps = {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function OffMapTabButton({ active, onClick, children }: OffMapTabButtonProps) {
	return (
		<Button
			onClick={onClick}
			className={cn(
				"flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
				active
					? "bg-ucr-blue text-white shadow-md shadow-ucr-blue/30 hover:bg-ucr-blue dark:bg-ucr-gold dark:text-black dark:shadow-ucr-gold/30 dark:hover:bg-ucr-gold"
					: "bg-transparent text-ucr-blue hover:bg-ucr-blue/10 dark:text-ucr-gold dark:hover:bg-ucr-gold/10",
			)}
		>
			{children}
		</Button>
	);
}

type BuildingEventRowProps = {
	event: NormalizedEvent;
	now: number;
	onClick: () => void;
};

function BuildingEventRow({ event, now, onClick }: BuildingEventRowProps) {
	const dayLabel = formatDayLabel(event, now);
	const timeRange = formatTimeRange(event);
	const isLive = dayLabel === "Now";

	return (
		<Card
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			className="group cursor-pointer overflow-hidden p-0 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<div className="flex gap-3 p-3">
				{event.media.cover ? (
					<img
						src={event.media.cover}
						alt=""
						className="size-16 shrink-0 rounded-md object-cover"
						loading="lazy"
					/>
				) : (
					<div className="size-16 shrink-0 rounded-md bg-muted" />
				)}
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-1.5">
						{isLive ? (
							<Badge variant="destructive" className="text-[10px] px-1.5">
								Live
							</Badge>
						) : (
							dayLabel && (
								<span className="inline-flex items-center rounded-full bg-ucr-blue/10 px-2 py-0.5 text-xs font-medium text-ucr-blue dark:bg-ucr-blue/50 dark:text-ucr-yellow">
									{dayLabel}
								</span>
							)
						)}
						<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
							<Clock className="size-3" />
							{timeRange}
						</span>
					</div>
					<div className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">
						{event.title}
					</div>
					{event.location.name && (
						<div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
							<MapPin className="size-3 shrink-0" />
							{event.location.name}
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
