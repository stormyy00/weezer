import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Edit,
  Share2,
  Check,
  Triangle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { getOrganizationById } from "@/fn/organization";
import { getOrganizationEvents } from "@/fn/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import loading from "@/components/loading";
import { SOCIALS } from "@/data/socials";
import { parseEventDate } from "@/lib/date-utils";
import { normalizeEvent } from "@/lib/event-normalizer";
import type { NormalizedEvent } from "@/types/events";
import EventCard from "@/components/events/event-card";

const searchSchema = z.object({
  edit: z.boolean().optional(),
});

export const Route = createFileRoute("/admin/organizations/$id")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async ({ params, context }) => {
    const { id } = params;

    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["organization", id],
        queryFn: () => getOrganizationById({ data: { id } }),
      }),
      context.queryClient.prefetchQuery({
        queryKey: ["organization-events", id],
        queryFn: () => getOrganizationEvents({ data: { organizationId: id } }),
      }),
    ]);
  },
  pendingComponent: loading,
});

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
  rawEvents: any[],
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

function RouteComponent() {
  const { id } = Route.useParams();
  const { edit } = Route.useSearch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(edit || false);

  const { data: organization } = useSuspenseQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganizationById({ data: { id } }),
    gcTime: 5 * 60_000,
  });

  const { data: events } = useSuspenseQuery({
    queryKey: ["organization-events", id],
    queryFn: () => getOrganizationEvents({ data: { organizationId: id } }),
    gcTime: 5 * 60_000,
  });

  const normalizedEvents = useMemo(
    () => events.map(normalizeEvent),
    [events],
  );

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
            We couldn't find that organization. Please try again.
          </p>
          <Button
            onClick={() => navigate({ to: "/admin/organizations" })}
            className="mt-4"
          >
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const getConfidenceBadge = (score: number | undefined) => {
    if (score === undefined) return null;

    const color =
      score > 0.8
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : score > 0.6
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

    return (
      <Badge className={`ml-2 ${color}`}>
        {(score * 100).toFixed(0)}%
      </Badge>
    );
  };

  const createdAt = organization.createdAt ? new Date(organization.createdAt) : null;
  const updatedAt = organization.updatedAt ? new Date(organization.updatedAt) : null;
  const discoveredAt = organization.discoveredAt ? new Date(organization.discoveredAt) : null;
  const lastScrapedAt = organization.lastScrapedAt ? new Date(organization.lastScrapedAt) : null;
  const lastPostAt = organization.lastPostAt ? new Date(organization.lastPostAt) : null;

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate({ to: "/admin/organizations" })}
          className="cursor-pointer text-ucr-blue dark:text-ucr-yellow hover:brightness-95 font-semibold flex items-center gap-2"
        >
          ← Back to Organizations
        </button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow"
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditMode ? "Cancel Edit" : "Edit"}
          </Button>
           <Button
            variant="outline"
            className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow"
          >
            <Triangle size={16}  />
            Deactivate
          </Button>
          
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141827] p-8 shadow-sm">
              <div className="flex gap-3 md:gap-6 flex-row md:items-start">
                <div className="h-24 w-24 rounded-full bg-linear-to-br from-ucr-blue to-ucr-blue dark:to-ucr-yellow dark:from-ucr-yellow p-0.5">
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
                        Object.entries(organization.socials).map(([platform, url]) => {
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
                        })}
                      {!organization.socials && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No social links listed.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-2">
                {organization.bio || "No description provided yet."}
              </div>

              {organization.profileUrl && (
                <div className="mt-4">
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
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Separator />
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Metadata
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-2">Timestamps</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {createdAt?.toLocaleString() || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>{" "}
                      {updatedAt?.toLocaleString() || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Discovered:</span>{" "}
                      {discoveredAt?.toLocaleString() || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Last Scraped:</span>{" "}
                      {lastScrapedAt?.toLocaleString() || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Last Post:</span>{" "}
                      {lastPostAt?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Source & Status</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                      <span className="font-medium">Source:</span>{" "}
                      <Badge variant="outline">
                        {organization.source || "manual"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={
                          organization.status === 1
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : organization.status === 0
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }
                      >
                        {organization.status === 1
                          ? "Approved"
                          : organization.status === 0
                          ? "Pending"
                          : "Rejected"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Confidence:</span>
                      {getConfidenceBadge(organization.confidence)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Statistics</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <span className="font-medium">Total Posts:</span>{" "}
                      {organization.totalPosts || 0}
                    </div>
                    <div>
                      <span className="font-medium">Total Events:</span>{" "}
                      {organization.totalEvents || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Instagram</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Handle:</span>{" "}
                    {organization.instagramHandle ? (
                      <a
                        href={`https://instagram.com/${organization.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ucr-blue dark:text-ucr-yellow hover:underline"
                      >
                        @{organization.instagramHandle}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Edit functionality coming soon. This will allow you to modify organization
              fields, update metadata, and save changes.
            </p>
          </div>
        )}
      </div>
        <div className="grid grid-cols-2 space-y-8 h-auto">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Events
                </h2>
                {groupedUpcoming.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    No upcoming events yet.
                  </p>
                ) : (
                  <div className="mt-6 space-y-8">
                    {groupedUpcoming.map(({ date, displayDate, events: items }) => (
                      <div key={date} className="space-y-4">
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {displayDate}
                        </div>
                        <div className="h-px bg-ucr-blue dark:bg-ucr-gold" />
                        <div className="grid gap-4 sm:grid-cols-2">
                          {items.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onClick={() => {}}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6">
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
                        <div className="grid gap-4 sm:grid-cols-2">
                          {items.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onClick={() => {}}
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
  );
}
