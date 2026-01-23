import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Edit,
  ChevronDownIcon,
  Link,
} from "lucide-react";
import { useState } from "react";
import { getEventById } from "@/fn/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import loading from "@/components/loading";

const searchSchema = z.object({
  edit: z.boolean().optional(),
});

export const Route = createFileRoute("/admin/events/$id")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async ({ params, context }) => {
    const { id } = params;

    await context.queryClient.prefetchQuery({
      queryKey: ["event", id],
      queryFn: () => getEventById({ data: { id } }),
    });
  },
  pendingComponent: loading,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { edit } = Route.useSearch();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(edit || false);

  const { data: event } = useSuspenseQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById({ data: { id } }),
  });

  if (!event) {
    return (
      <div className="w-full max-w-7xl mx-auto py-32 px-4">
        <div className="rounded-2xl border border-dashed border-ucr-blue/50 dark:border-ucr-gold/40 p-10 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Event not found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We couldn't find that event. Please try again.
          </p>
          <Button
            onClick={() => navigate({ to: "/admin/events" })}
            className="mt-4"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const hasMultipleImages = event.media.length > 0 && event.media.length > 1;
  const startDate = event.start_time ? new Date(event.start_time) : null;
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const createdAt = event.created_at ? new Date(event.created_at) : null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % event.media.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? event.media.length - 1 : prev - 1
    );
  };

  const getConfidenceBadge = (score: number | undefined) => {
    if (score === undefined) return null;

    const color = score > 0.8
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

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate({ to: "/admin/events" })}
          className="cursor-pointer text-ucr-blue dark:text-ucr-yellow hover:brightness-95 font-semibold flex items-center gap-2"
        >
          ← Back to Events
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
          {/* <Button
            variant="outline"
            onClick={handleShare}
            className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Share"}
          </Button> */}
          {event.organizationIds && event.organizationIds.length > 1 ? (
            <Button
              variant="outline"
              onClick={() => navigate({ to: `/admin/organizations/${event.organizationIds?.[0]}` })}
              className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow"
            >
              View Organization
            </Button>
            ) : (

            <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-full">
            <Button variant="outline" size="icon" aria-label="More Options" className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow" >
              View Organization <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {event.organizationIds?.map((orgId, idx) => (
            <DropdownMenuGroup key={idx}>
              <DropdownMenuItem>
                <Link href={`/admin/organizations/${orgId}`}>
                  {orgId}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
          )}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.organizations && event.organizations.length > 0 ? (
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
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {event.media.length > 0 && (
            <div className="relative w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={event.media[currentImageIndex]}
                alt={`${event.title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
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
                    {event.media.map((_, index) => (
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

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Event Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-ucr-blue mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold flex items-center">
                    Date & Time
                    {getConfidenceBadge((event as any).confidence?.start_at)}
                  </div>
                  <div className="text-muted-foreground">
                    {startDate ? (
                      <>
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        <br />
                        {startDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {endDate && (
                          <> - {endDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}</>
                        )}
                      </>
                    ) : (
                      "Date TBD"
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-ucr-blue mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold flex items-center">
                    Location
                    {getConfidenceBadge((event as any).confidence?.location)}
                  </div>
                  <div className="text-muted-foreground">
                    {event.location?.name || "Location TBD"}
                  </div>
                </div>
              </div>

              {event.description && (
                <div>
                  <div className="font-semibold mb-1 flex items-center">
                    Description
                    {getConfidenceBadge((event as any).confidence?.description)}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              <a
                href={event.original_post}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-ucr-blue text-white rounded-lg hover:opacity-90 transition-opacity w-fit"
              >
                <span>View on {event.source === "instagram" ? "Instagram" : "Source"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Metadata
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="font-semibold mb-2">Timestamps</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {createdAt?.toLocaleString() || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Source Data</div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div>
                    <span className="font-medium">Post URL:</span>{" "}
                    <a
                      href={event.original_post}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ucr-blue dark:text-ucr-yellow hover:underline break-all"
                    >
                      {event.original_post}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Image URLs:</span>{" "}
                    {event.media.length} images
                  </div>
                  {event.organizations && event.organizations.length > 0 && (
                    <div>
                      <span className="font-medium">Organizations:</span>{" "}
                      {event.organizations.join(", ")}
                    </div>
                  )}
                  {event.organizationIds && event.organizationIds.length > 0 && (
                    <div>
                      <span className="font-medium">Organization IDs:</span>{" "}
                      {event.organizationIds.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-t-lg border border-gray-200 dark:border-gray-800">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  LLM Extraction Evidence
                </div>
              </div>
              <div className="bg-white dark:bg-gray-950 p-5 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-800">
                {(() => {
                  const evidence = (event as any).evidence || {};
                  const entries = Object.entries(evidence);

                  if (entries.length === 0) {
                    return (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No evidence data available
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {entries.map(([key, value]) => (
                        <div
                          key={key}
                          className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                            >
                              {key.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-3 border-l-2 border-gray-300 dark:border-gray-700">
                            {typeof value === "string" ? (
                              <p>{value}</p>
                            ) : (
                              <pre className="font-mono text-xs whitespace-pre-wrap wrap-break-word bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-800">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Edit functionality coming soon. This will allow you to modify event
              fields, update metadata, and save changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
