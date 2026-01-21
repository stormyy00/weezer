import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseEventDate } from "@/lib/date-utils";
import { normalizeEvent } from "@/lib/event-normalizer";
import type { NormalizedEvent, RawEvent } from "@/types/events";
import EventCard from "./event-card";
import EventDetail from "./event-detail";
import Search from "./search";
import { cn } from "@/lib/utils";

type EventsProps = {
  data: RawEvent[];
  eventId?: string;
};

type EventFilter = "upcoming" | "past" | "today" | "week";

// type EventsByDate = {
// 	date: string;
// 	displayDate: string;
// 	events: NormalizedEvent[];
// };

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isWithinNext7Days = (date: Date, now: Date) => {
  const diff = date.getTime() - now.getTime();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
};

const Events = ({ data, eventId }: EventsProps) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(
    null,
  );
  const [filter, setFilter] = useState<EventFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedEvents = useMemo(() => data.map(normalizeEvent), [data]);

  const rawEventMap = useMemo(() => {
    return new Map(data.map((e) => [e.id, e]));
  }, [data]);

  const eventSearchResults = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return [];

    return normalizedEvents.filter((event) => {
      const haystack = [event.title, event.organization, event.source.url]
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [normalizedEvents, searchQuery]);

  const filteredEvents = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return normalizedEvents;

    return normalizedEvents.filter((event) => {
      const haystack = [event.title, event.organization, event.source.url]
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [normalizedEvents, searchQuery]);

  useEffect(() => {
    if (eventId) {
      const event = normalizedEvents.find((e) => e.id === eventId);
      if (event) setSelectedEvent(event);
    } else {
      setSelectedEvent(null);
    }
  }, [eventId, normalizedEvents]);

  const handleCloseEvent = () => {
    setSelectedEvent(null);
    navigate({ to: "/events", search: {} });
  };

  const handleSelectEvent = (eventId: string) => {
    const event = normalizedEvents.find((item) => item.id === eventId);
    if (!event) return;
    setSelectedEvent(event);
  };

  const { upcomingEvents, pastEvents, todayEvents, weekEvents } =
    useMemo(() => {
      const now = new Date();
      const upcoming: NormalizedEvent[] = [];
      const past: NormalizedEvent[] = [];
      const today: NormalizedEvent[] = [];
      const week: NormalizedEvent[] = [];

      filteredEvents.forEach((event) => {
        if (event.date.isTBD) return;

        const rawEvent = rawEventMap.get(event.id);
        const eventDate = parseEventDate(rawEvent?.start_time);
        if (!eventDate) return;

        if (eventDate < now) {
          past.push(event);
          return;
        }

        upcoming.push(event);

        if (isSameDay(eventDate, now)) today.push(event);
        if (isWithinNext7Days(eventDate, now)) week.push(event);
      });

      return {
        upcomingEvents: upcoming,
        pastEvents: past,
        todayEvents: today,
        weekEvents: week,
      };
    }, [filteredEvents, rawEventMap]);

  const displayedEvents = useMemo(() => {
    switch (filter) {
      case "today":
        return todayEvents;
      case "week":
        return weekEvents;
      case "past":
        return pastEvents;
      default:
        return upcomingEvents;
    }
  }, [filter, upcomingEvents, pastEvents, todayEvents, weekEvents]);

  const groupedEvents = useMemo(() => {
    const grouped = new Map<string, NormalizedEvent[]>();

    displayedEvents.forEach((event) => {
      const rawEvent = rawEventMap.get(event.id);
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

      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey)?.push(event);
    });

    return Array.from(grouped.entries())
      .map(([dateKey, events]) => {
        const date = new Date(dateKey + "T00:00:00");
        const displayDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "America/Los_Angeles",
        });
        // Sort events within each date group by start time
        const sortedEvents = events.sort((a, b) => {
          const rawEventA = rawEventMap.get(a.id);
          const rawEventB = rawEventMap.get(b.id);
          const dateA = parseEventDate(rawEventA?.start_time);
          const dateB = parseEventDate(rawEventB?.start_time);

          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateA.getTime() - dateB.getTime();
        });

        return { date: dateKey, displayDate, events: sortedEvents };
      })
      .sort((a, b) =>
        filter === "past"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [displayedEvents, rawEventMap, filter]);

  return (
    <div className="w-full max-w-7xl mx-auto py-32 px-4">
      <div className="flex justify-between w-full items-center mb-2 md:mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Events
        </h1>

        <div className="hidden md:flex items-center gap-2">
          <Search
            query={searchQuery}
            onQueryChange={setSearchQuery}
            eventResults={
              searchQuery.trim() ? eventSearchResults : upcomingEvents
            }
            onSelectEvent={handleSelectEvent}
          />

          <FilterButton
            active={filter === "today"}
            onClick={() => setFilter("today")}
          >
            Today ({todayEvents.length})
          </FilterButton>

          <FilterButton
            active={filter === "week"}
            onClick={() => setFilter("week")}
          >
            This Week ({weekEvents.length})
          </FilterButton>

          <FilterButton
            active={filter === "upcoming"}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming ({upcomingEvents.length})
          </FilterButton>

          <FilterButton
            active={filter === "past"}
            onClick={() => setFilter("past")}
          >
            Past ({pastEvents.length})
          </FilterButton>
        </div>
      </div>

      <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md py-2 mb-4">
        <Search
          query={searchQuery}
          onQueryChange={setSearchQuery}
          eventResults={
            searchQuery.trim() ? eventSearchResults : upcomingEvents
          }
          onSelectEvent={handleSelectEvent}
        />

        <div className="flex gap-2 mt-3 items-center justify-center overflow-x-auto">
          <Button
            size="sm"
            variant={filter === "today" ? "default" : "outline"}
            onClick={() => setFilter("today")}
            className="rounded-full"
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={filter === "week" ? "default" : "outline"}
            onClick={() => setFilter("week")}
            className="rounded-full"
          >
            This Week
          </Button>
          <Button
            size="sm"
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
            className="rounded-full"
          >
            Upcoming
          </Button>
          <Button
            size="sm"
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
            className="rounded-full"
          >
            Past
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
        <div className="space-y-6 md:space-y-12">
          {groupedEvents.map(({ date, displayDate, events }) => (
            <div key={date}>
              <div className="mb-4 md:mb-6">
                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {displayDate}
                </div>
                <div className="h-px bg-ucr-blue dark:bg-ucr-gold" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {events.map((event) => (
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

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleCloseEvent}
        />
      )}
    </div>
  );
};

export default Events;

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

const FilterButton = ({
  active,
  onClick,
  children,
  className,
}: FilterButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "rounded-full transition-all px-5 py-2",
        active
          ? "bg-ucr-blue text-white shadow-md shadow-ucr-blue/30 dark:bg-ucr-gold dark:text-black dark:shadow-ucr-gold/30 font-medium"
          : "bg-transparent text-ucr-blue border border-ucr-blue hover:bg-ucr-blue/10 dark:text-ucr-gold dark:border-ucr-gold dark:hover:bg-ucr-gold/10",
        className,
      )}
    >
      {children}
    </Button>
  );
};
