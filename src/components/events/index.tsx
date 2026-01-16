import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseEventDate } from "@/lib/date-utils";
import { normalizeEvent } from "@/lib/event-normalizer";
import type { NormalizedEvent, RawEvent } from "@/types/events";
import EventCard from "./event-card";
import EventDetail from "./event-detail";

type EventsProps = {
	data: RawEvent[];
};

type EventFilter = "upcoming" | "past";

type EventsByDate = {
	date: string;
	displayDate: string;
	events: NormalizedEvent[];
};

const Events = ({ data }: EventsProps) => {
	const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(
		null,
	);
	const [filter, setFilter] = useState<EventFilter>("upcoming");

	const normalizedEvents = data.map(normalizeEvent);

	const { upcomingEvents, pastEvents } = useMemo(() => {
		const now = new Date();
		const upcoming: NormalizedEvent[] = [];
		const past: NormalizedEvent[] = [];

		normalizedEvents.forEach((event) => {
			if (event.date.isTBD) {
				// Skip TBD events
				return;
			}

			// Parse the start time from the raw event
			const rawEvent = data.find((item) => item.id === event.id);
			const eventDate = parseEventDate(rawEvent?.start_time);
			if (eventDate) {
				if (eventDate >= now) {
					upcoming.push(event);
				} else {
					past.push(event);
				}
			}
		});

		return { upcomingEvents: upcoming, pastEvents: past };
	}, [normalizedEvents, data]);

	// Group events by date
	const groupedEvents = useMemo(() => {
		const eventsToGroup = filter === "upcoming" ? upcomingEvents : pastEvents;
		const grouped = new Map<string, NormalizedEvent[]>();

		eventsToGroup.forEach((event) => {
			const rawEvent = data.find((item) => item.id === event.id);
			const eventDate = parseEventDate(rawEvent?.start_time);

			if (eventDate) {
				// Format date as YYYY-MM-DD for grouping
				const dateKey = eventDate.toLocaleDateString("en-US", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					timeZone: "America/Los_Angeles",
				}).split('/').reverse().join('-').replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$3-$2');

				if (!grouped.has(dateKey)) {
					grouped.set(dateKey, []);
				}
				grouped.get(dateKey)?.push(event);
			}
		});

		// Convert to array and sort by date
		const result: EventsByDate[] = Array.from(grouped.entries())
			.map(([dateKey, events]) => {
				const date = new Date(dateKey + 'T00:00:00');
				const displayDate = date.toLocaleDateString("en-US", {
					weekday: "long",
					month: "long",
					day: "numeric",
					year: "numeric",
					timeZone: "America/Los_Angeles",
				});
				return { date: dateKey, displayDate, events };
			})
			.sort((a, b) => {
				if (filter === "upcoming") {
					return a.date.localeCompare(b.date);
				}
				return b.date.localeCompare(a.date);
			});

		return result;
	}, [upcomingEvents, pastEvents, filter, data]);

	const displayedEvents = filter === "upcoming" ? upcomingEvents : pastEvents;

	return (
		<div className="w-full max-w-7xl mx-auto py-32 px-4">
			<div className="flex justify-between w-full items-center mb-8">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
					Events
				</h1>
				<div className="mb-6 flex items-center gap-2">
					<Button
						variant={filter === "upcoming" ? "default" : "outline"}
						onClick={() => setFilter("upcoming")}
						className="rounded-full"
					>
						Upcoming ({upcomingEvents.length})
					</Button>
					<Button
						variant={filter === "past" ? "default" : "outline"}
						onClick={() => setFilter("past")}
						className="rounded-full"
					>
						Past ({pastEvents.length})
					</Button>
				</div>
			</div>

			{displayedEvents.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500 dark:text-gray-400 text-lg">
						No {filter} events found.
					</p>
				</div>
			) : (
				<div className="space-y-12">
					{groupedEvents.map(({date, displayDate, events}) => (
						<div key={date}>
							<div className="mb-6">
								<div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
									{displayDate}
								</div>
								<div className="h-px bg-ucr-blue dark:bg-ucr-gold" />
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{events.map((event, index) => (
									<EventCard
										key={index}
										event={event}
										onClick={() => setSelectedEvent(event)}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{selectedEvent && (
				<EventDetail
					event={selectedEvent}
					isOpen={!!selectedEvent}
					onClose={() => setSelectedEvent(null)}
				/>
			)}
		</div>
	);
};

export default Events;
