"use client";

import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	MapPin,
  Share,
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
import { UploadIcon } from "../ui/icons";

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
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						{event.title}
					</DialogTitle>
				</DialogHeader>

				{event.media.all.length > 0 && (
					<div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
						<img
							src={event.media.all[currentImageIndex]}
							alt={`${event.title} - Image ${currentImageIndex + 1}`}
							className="w-full h-full object-contain"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>

						{hasMultipleImages && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
									aria-label="Previous image"
								>
									<ChevronLeft className="w-6 h-6" />
								</button>
								<button
									onClick={nextImage}
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
									aria-label="Next image"
								>
									<ChevronRight className="w-6 h-6" />
								</button>

								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
									{event.media.all.map((_, index) => (
										<button
											key={index}
											onClick={() => setCurrentImageIndex(index)}
											className={`w-2 h-2 rounded-full transition-all ${
												index === currentImageIndex
													? "bg-white w-6"
													: "bg-white/50 hover:bg-white/75"
											}`}
											aria-label={`Go to image ${index + 1}`}
										/>
									))}
								</div>
							</>
						)}
					</div>
				)}

				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="uppercase tracking-wide">
						{event.organization.replace(/_/g, " ")}
					</Badge>
					<span className="text-sm text-muted-foreground capitalize">
						via {event.source.platform}
					</span>
          <Badge  onClick={() => {}} variant={"secondary"} className="flex items-center gap-1 cursor-pointer text-sm"><UploadIcon size={16} className="text-ucr-blue  shrink-0" /> Share</Badge>
				</div>

				<div className="space-y-2">
					<div className="flex items-start gap-2">
						<Calendar className="w-5 h-5 text-ucr-blue mt-0.5 shrink-0" />
						<div>
							<div className="font-semibold text-gray-900 dark:text-white">
								Date & Time
							</div>
							<div className="text-gray-700 dark:text-gray-300">
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

					<div className="flex items-start gap-2">
						<MapPin className="w-5 h-5 text-ucr-blue mt-0.5 shrink-0" />
						<div>
							<div className="font-semibold text-gray-900 dark:text-white">
								Location
							</div>
							<div className="text-gray-700 dark:text-gray-300">
								{event.location.isTBD ? (
									"Location TBD"
								) : (
									<>
										{event.location.name}
										{event.location.campus && (
											<div className="text-sm text-gray-500 dark:text-gray-400">
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
							<div className="font-semibold text-gray-900 dark:text-white">
								About this event
							</div>
							<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
								{event.description}
							</p>
						</div>
					)}

					<a
						href={event.source.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-4 py-2 bg-ucr-blue text-white rounded-lg hover:opacity-90 transition-opacity mt-1"
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
