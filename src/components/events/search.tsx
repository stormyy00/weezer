import { useEffect, useRef, useState } from "react";
import type { NormalizedEvent } from "@/types/events";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";

type SearchProps = {
	query: string;
	onQueryChange: (value: string) => void;
	eventResults: NormalizedEvent[];
	onSelectEvent: (eventId: string) => void;
};

const Search = ({
	query,
	onQueryChange,
	eventResults,
	onSelectEvent,
}: SearchProps) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	// Close on outside click
	useEffect(() => {
		if (!isOpen) return;

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!containerRef.current?.contains(target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, [isOpen]);

	// Close on Escape
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, []);

	const handleSelect = (eventId: string) => {
		onSelectEvent(eventId);
		setIsOpen(false);
		onQueryChange("");
	};

	return (
		<div ref={containerRef} className="relative w-full max-w-sm">
			<Command
				className="w-full border bg-white dark:bg-[#1c1c1e] rounded-3xl"
				shouldFilter={false}
			>
				<CommandInput
					placeholder="Search events..."
					value={query}
					onValueChange={onQueryChange}
					onFocus={() => setIsOpen(true)}
					onClick={() => setIsOpen(true)}
				/>

				{isOpen && (
					<CommandList
						className="
              absolute
              left-0
              right-0
              top-full
              mt-2
              z-50
              max-h-72
              overflow-y-auto
              rounded-md
              border
              bg-white
              shadow-lg
              dark:bg-[#1c1c1e]
            "
					>
						<CommandEmpty>No events found.</CommandEmpty>

						<CommandGroup
							heading={query.trim() ? "Matching events" : "Upcoming events"}
						>
							{eventResults.map((event) => (
								<CommandItem
									key={event.id}
									value={`${event.title} ${event.organization}`}
									onSelect={() => handleSelect(event.id)}
									className="flex flex-col items-start gap-1 py-2"
								>
									<span className="text-sm font-medium">
										{event.title}
									</span>
									<span className="text-xs text-muted-foreground">
										{event.organization}
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				)}
			</Command>
		</div>
	);
};

export default Search;
