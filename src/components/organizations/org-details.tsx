import { ExternalLink } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SOCIALS } from "@/data/socials";
import { parseEventDate } from "@/lib/date-utils";
import { normalizeEvent } from "@/lib/event-normalizer";
import type { OrganizationRecord } from "@/fn/organization";
import type { NormalizedEvent, RawEvent } from "@/types/events";
import EventCard from "@/components/events/event-card";
import EventDetail from "@/components/events/event-detail";
import { ShareButton } from "@/components/ui/share-button";

const formatDisplayDate = (dateKey: string) => {
	const date = new Date(`${dateKey}T00:00:00`);
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "America/Los_Angeles",
	});
};

const groupEventsByDate = (
	events: NormalizedEvent[],
	rawEvents: RawEvent[],
) => {
	const grouped = new Map<string, NormalizedEvent[]>();

	events.forEach((event) => {
		const rawEvent = rawEvents.find((item) => item.id === event.id);
		const eventDate = parseEventDate(rawEvent?.start_time);
		if (!eventDate) return;

		const dateKey = eventDate
			.toLocaleDateString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				timeZone: "America/Los_Angeles",
			})
			.split("/")
			.reverse()
			.join("-")
			.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1-$3-$2");

		if (!grouped.has(dateKey)) {
			grouped.set(dateKey, []);
		}
		grouped.get(dateKey)?.push(event);
	});

	return Array.from(grouped.entries())
		.map(([dateKey, items]) => ({
			date: dateKey,
			displayDate: formatDisplayDate(dateKey),
			events: items,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
};

type OrgDetailsProps = {
	organization: OrganizationRecord | null;
	events: RawEvent[];
	eventId?: string;
};

const OrgDetails = ({ organization, events, eventId }: OrgDetailsProps) => {
	const navigate = useNavigate();
	const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(
		null,
	);

	const normalizedEvents = useMemo(() => events.map(normalizeEvent), [events]);

	// Handle event ID from URL parameter
	useEffect(() => {
		if (eventId) {
			const event = normalizedEvents.find((e) => e.id === eventId);
			if (event) {
				setSelectedEvent(event);
			}
		} else {
			setSelectedEvent(null);
		}
	}, [eventId, normalizedEvents]);

	const handleCloseEvent = () => {
		setSelectedEvent(null);
		if (organization) {
			navigate({
				to: "/organizations/$id",
				params: { id: organization.id },
				search: {},
			});
		}
	};

	const { upcomingEvents, pastEvents } = useMemo(() => {
		const now = new Date();
		const upcoming: NormalizedEvent[] = [];
		const past: NormalizedEvent[] = [];

		normalizedEvents.forEach((event) => {
			if (event.date.isTBD) return;
			const rawEvent = events.find((item) => item.id === event.id);
			const eventDate = parseEventDate(rawEvent?.start_time);
			if (!eventDate) return;

			if (eventDate >= now) {
				upcoming.push(event);
			} else {
				past.push(event);
			}
		});

		return { upcomingEvents: upcoming, pastEvents: past };
	}, [normalizedEvents, events]);

	const groupedUpcoming = useMemo(
		() => groupEventsByDate(upcomingEvents, events),
		[upcomingEvents, events],
	);

	const groupedPast = useMemo(
		() => groupEventsByDate(pastEvents, events),
		[pastEvents, events],
	);

	if (!organization) {
		return (
			<div className="w-full max-w-7xl mx-auto py-32 px-4">
				<div className="rounded-2xl border border-dashed border-ucr-blue/50 dark:border-ucr-gold/40 p-10 text-center">
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
						Organization not found
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						We couldn’t find that organization. Please try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-7xl mx-auto py-32 px-4">
			<div className="flex justify-between w-full mb-6">
				<button
					onClick={() => navigate({ to: "/organizations", search: {} })}
					className="cursor-pointer text-ucr-blue dark:text-ucr-yellow hover:brightness-95 font-semibold flex items-center gap-2"
				>
					← Back
				</button>
				<div className="flex flex-wrap gap-3 justify-end">
					{organization.profileUrl && (
						<Button
							asChild
							className="bg-ucr-blue hover:bg-ucr-blue/90 duration-300 text-white hover:brightness-95"
						>
							<a
								href={organization.profileUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								Highlander Link
								<ExternalLink className="ml-2 h-4 w-4" />
							</a>
						</Button>
					)}
					<ShareButton id={organization.id} type="organization" />
				</div>
			</div>
			<div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<div className="space-y-8">
					<div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141827] p-8 shadow-sm">
						<div className="flex gap-3 md:gap-6 flex-row md:items-start">
							<div className="h-24 w-24 rounded-full bg-linear-to-br from-ucr-blue to-ucr-blue dark:to-ucr-yellow dark:from-ucr-yellow  p-0.5">
								<div className="h-full w-full rounded-full bg-white dark:bg-[#0f1322] p-2">
									<img
										src={organization.logoUrl ?? "/logo.svg"}
										alt={organization.name}
										className="h-full w-full rounded-full object-cover"
									/>
								</div>
							</div>

							<div className="flex-1 space-y-4">
								<div className="flex flex-wrap items-center gap-3">
									<h1 className="text-lg md:text-3xl font-bold text-gray-900 dark:text-white">
										{organization.name}
									</h1>
									{organization.category && (
										<span className="inline-flex items-center rounded-full bg-ucr-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ucr-blue dark:bg-ucr-blue/30 dark:text-ucr-yellow">
											{organization.category}
										</span>
									)}
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<div className="flex flex-wrap gap-2">
										{organization.socials &&
											Object.entries(organization.socials).map(
												([platform, url]) => {
													if (!url) return null;
													const SocialIcon = SOCIALS[platform];
													if (!SocialIcon) return null;
													return (
														<a
															key={platform}
															href={url}
															target="_blank"
															rel="noopener noreferrer"
															className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-black/5 text-gray-700 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
														>
															<span className="text-2xl text-ucr-blue dark:text-ucr-yellow">
																<SocialIcon />
															</span>
														</a>
													);
												},
											)}
										{!organization.socials && (
											<span className="text-sm text-gray-500 dark:text-gray-400">
												No social links listed.
											</span>
										)}
									</div>
									{/* <div className="flex flex-wrap gap-3">
										{organization.profileUrl && (
											<Button
												asChild
												className="bg-ucr-blue hover:bg-ucr-blue/90 duration-300 text-white hover:brightness-95"
											>
												<a
													href={organization.profileUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													Highlander Link
													<ExternalLink className="ml-2 h-4 w-4" />
												</a>
											</Button>
										)} */}
									{/* <Button
										variant="outline"
										className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow dark:hover:bg-ucr-gold/20 cursor-pointer duration-300"
										onClick={() => {
											if (typeof window !== "undefined") {
												navigator.clipboard.writeText(window.location.href);
												setCopied(true);
												window.setTimeout(() => setCopied(false), 2000);
											}
										}}
									>
										{copied ? (
											<Check className="mr-2 h-4 w-4" />
										) : (
											<Share2 className="mr-2 h-4 w-4" />
										)}
										{copied ? "Copied" : "Share"}
									</Button> */}

									{/* </div> */}
								</div>
							</div>
						</div>
						<div className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-2">
							{organization.bio || "No description provided yet."}
						</div>
					</div>

					<div className="space-y-8">
						<div className=" p-6">
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
								Upcoming Events
							</h2>
							{groupedUpcoming.length === 0 ? (
								<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
									No upcoming events yet.
								</p>
							) : (
								<div className="mt-6 space-y-8">
									{groupedUpcoming.map(
										({ date, displayDate, events: items }) => (
											<div key={date} className="space-y-4">
												<div className="text-base font-semibold text-gray-900 dark:text-white">
													{displayDate}
												</div>
												<div className="h-px bg-ucr-blue dark:bg-ucr-gold" />
												<div className="grid gap-4 sm:grid-cols-3">
													{items.map((event) => (
														<EventCard
															key={event.id}
															event={event}
															onClick={() => setSelectedEvent(event)}
														/>
													))}
												</div>
											</div>
										),
									)}
								</div>
							)}
						</div>

						<div className=" p-6 ">
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
								Past Events
							</h2>
							{groupedPast.length === 0 ? (
								<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
									No past events yet.
								</p>
							) : (
								<div className="mt-6 space-y-8">
									{groupedPast.map(({ date, displayDate, events: items }) => (
										<div key={date} className="space-y-4">
											<div className="text-base font-semibold text-gray-900 dark:text-white">
												{displayDate}
											</div>
											<div className="h-px bg-ucr-blue dark:bg-ucr-gold" />
											<div className="grid gap-4 sm:grid-cols-3">
												{items.map((event) => (
													<EventCard
														key={event.id}
														event={event}
														onClick={() => setSelectedEvent(event)}
													/>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

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

export default OrgDetails;
