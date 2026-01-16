import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormalizedEvent } from "@/types/events";
import { Badge } from "../ui/badge";

type EventCardProps = {
	event: NormalizedEvent;
	onClick?: () => void;
};

const EventCard = ({ event, onClick }: EventCardProps) => {
	const hasImage = !!event.media;
	const isTimeUnknown = event.date.time === "12:00 AM";
	const timeLabel = isTimeUnknown ? "View flyer for time" : event.date.time;

	return (
		<div
			onClick={onClick}
			className={cn(
				"w-full bg-white/80 dark:bg-[#0f141b]/80 backdrop-blur-xl",
				"border border-gray-200/60 dark:border-white/10",
				"rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-black/20",
				"overflow-hidden cursor-pointer",
				"hover:scale-[1.02] hover:shadow-xl",
				"transition-all duration-300",
			)}
		>
			<div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
				{hasImage ? (
					<img
						src={event.media.cover}
						alt={event.title}
						loading="lazy"
						className="w-full h-full object-cover"
						onError={(e) => {
							console.error("Failed to load image:", event.media.cover, e);
							e.currentTarget.style.display = "none";
							e.currentTarget.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-linear-to-br from-ucr-blue to-ucr-gold">
                  <span class="text-4xl font-bold text-white">${event.organization
										.split("_")
										.map((w) => w[0]?.toUpperCase())
										.join("")}</span>
                </div>
              `;
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-ucr-blue to-ucr-gold">
						<span className="text-4xl font-bold text-white">
							{event.organization
								.split("_")
								.map((w) => w[0]?.toUpperCase())
								.join("")}
						</span>
					</div>
				)}

				{/* Organization Badge - Top Right Corner */}
				<Badge className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
					<span className="text-[10px] font-semibold text-white uppercase tracking-wider">
						@{event.organization.replace(/_/g, "_")}
					</span>
				</Badge>
			</div>

			<div className="p-4 space-y-2.5">
				<div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucr-blue/10 dark:bg-ucr-blue/50 text-ucr-blue dark:text-ucr-yellow text-xs font-medium">
					{event.date.isTBD
						? "Time TBD"
						: isTimeUnknown
							? timeLabel
							: event.date.endTime
								? `${event.date.time} - ${event.date.endTime}`
								: timeLabel}
				</div>

				<div className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
					{event.title}
				</div>

				{event.description && (
					<p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
						{event.description}
					</p>
				)}

				<div className="space-y-1.5 pt-1">
					<div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
						<MapPin className="w-3.5 h-3.5 shrink-0" />
						<span className="truncate">
							{event.location.isTBD ? "Location TBD" : event.location.name}
						</span>
					</div>

					<div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
						<Clock className="w-3.5 h-3.5 shrink-0" />
						<span>
							{event.date.isTBD
								? "Time TBD"
								: isTimeUnknown
									? timeLabel
									: event.date.endTime
										? `${event.date.time} - ${event.date.endTime}`
										: timeLabel}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventCard;
