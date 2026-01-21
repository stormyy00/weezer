import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	MapPin,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { NormalizedEvent } from "@/types/events";
import { Separator } from "../ui/separator";
import { ShareButton } from "@/components/ui/share-button";

type EventDetailProps = {
	event: NormalizedEvent;
	isOpen: boolean;
	onClose: () => void;
};

const EventDetail = ({ event, isOpen, onClose }: EventDetailProps) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const hasMultipleImages = event.media.all.length > 1;
	const isTimeUnknown = event.date.time === "12:00 AM";
	const timeLabel = isTimeUnknown ? "View flyer for time" : event.date.time;

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % event.media.all.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) =>
			prev === 0 ? event.media.all.length - 1 : prev - 1,
		);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
				<DialogHeader className="space-y-2">
					<DialogTitle className="text-2xl font-bold leading-tight">
						{event.title}
					</DialogTitle>

					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						{event.organizations && event.organizations.length > 1 ? (
							event.organizations.map((org, idx) => (
								<Badge
									key={idx}
									variant="secondary"
									className="uppercase tracking-wide"
								>
									{org.replace(/_/g, " ")}
								</Badge>
							))
						) : (
							<Badge variant="secondary" className="uppercase tracking-wide">
								{event.organization.replace(/_/g, " ")}
							</Badge>
						)}

						<span className="hidden md:block capitalize">via {event.source.platform}</span>

						<ShareButton
							id={event.id}
							type="event"
							variant="badge"
							className="ml-auto"
						/>
					</div>
				</DialogHeader>

				{event.media.all.length > 0 && (
					<div className="relative w-full max-h-[70vh] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center mt-2">
						<img
							src={event.media.all[currentImageIndex]}
							alt={`${event.title} - Image ${currentImageIndex + 1}`}
							className="max-w-full max-h-[70vh] object-contain"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>

						{hasMultipleImages && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
									aria-label="Previous image"
								>
									<ChevronLeft className="w-6 h-6" />
								</button>

								<button
									onClick={nextImage}
									className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
									aria-label="Next image"
								>
									<ChevronRight className="w-6 h-6" />
								</button>

								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
									{event.media.all.map((_, index) => (
										<button
											key={index}
											onClick={() => setCurrentImageIndex(index)}
											className={`h-2 rounded-full transition-all ${
												index === currentImageIndex
													? "bg-white w-6"
													: "bg-white/50 hover:bg-white/75 w-2"
											}`}
											aria-label={`Go to image ${index + 1}`}
										/>
									))}
								</div>
							</>
						)}
					</div>
				)}

        <Separator className="my-2" />

				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<Calendar className="w-5 h-5 text-ucr-blue mt-0.5 shrink-0" />
						<div>
							<div className="font-semibold">Date & Time</div>
							<div className="text-muted-foreground">
								{event.date.isTBD ? (
									"Date TBD"
								) : (
									<>
										{event.date.day}, {event.date.monthDay}
										{timeLabel && (
											<>
												{" • "}
												{timeLabel}
												{!isTimeUnknown &&
													event.date.endTime &&
													` - ${event.date.endTime}`}
											</>
										)}
									</>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<MapPin className="w-5 h-5 text-ucr-blue mt-0.5 shrink-0" />
						<div>
							<div className="font-semibold">Location</div>
							<div className="text-muted-foreground">
								{event.location.isTBD ? (
									"Location TBD"
								) : (
									<>
										{event.location.name}
										{event.location.campus && (
											<div className="text-sm opacity-70">
												{event.location.campus} Campus
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</div>

					{event.description && (
						<div>
							<div className="font-semibold mb-1">About this event</div>
							<p className="text-muted-foreground leading-relaxed">
								{event.description}
							</p>
						</div>
					)}

					<a
						href={event.source.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-4 py-2 bg-ucr-blue text-white rounded-lg hover:opacity-90 transition-opacity w-fit"
					>
						<span>
							View on{" "}
							{event.source.platform === "instagram" ? "Instagram" : "Source"}
						</span>
						<ExternalLink className="w-4 h-4" />
					</a>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default EventDetail;
