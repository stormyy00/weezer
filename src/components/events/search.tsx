import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type { NormalizedEvent } from "@/types/events";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";

const DROPDOWN_OFFSET = 8;

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
	const listRef = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [listPosition, setListPosition] = useState({
		top: 0,
		left: 0,
		width: 0,
	});

	const updateListPosition = useCallback(() => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) {
			return;
		}

		setListPosition({
			top: rect.bottom + DROPDOWN_OFFSET,
			left: rect.left,
			width: rect.width,
		});
	}, []);

	useLayoutEffect(() => {
		updateListPosition();
	}, [updateListPosition]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		updateListPosition();

		const handleWindowChange = () => updateListPosition();
		window.addEventListener("resize", handleWindowChange);
		window.addEventListener("scroll", handleWindowChange, true);

		return () => {
			window.removeEventListener("resize", handleWindowChange);
			window.removeEventListener("scroll", handleWindowChange, true);
		};
	}, [isOpen, updateListPosition]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				containerRef.current?.contains(target) ||
				listRef.current?.contains(target)
			) {
				return;
			}
			setIsOpen(false);
		};

		document.addEventListener("mousedown", handleOutsideClick);

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [isOpen]);

	return (
		<div ref={containerRef} className="w-full max-w-sm">
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
						ref={listRef}
						className="fixed z-50 max-h-72 overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-[#1c1c1e]"
						style={{
							top: listPosition.top,
							left: listPosition.left,
							width: listPosition.width,
						}}
					>
						<CommandEmpty>No events found.</CommandEmpty>
						<CommandGroup
							heading={query.trim() ? "Matching events" : "Upcoming events"}
						>
							{eventResults.map((event) => (
								<CommandItem
									key={event.id}
									value={`${event.title} ${event.organization}`}
									onSelect={() => onSelectEvent(event.id)}
									className="flex flex-col items-start gap-1 py-2"
								>
									<span className="text-sm font-medium">{event.title}</span>
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
