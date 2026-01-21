import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OrgCard from "@/components/organizations/org-card";
import Pagination from "@/components/organizations/pagination";
import { Input } from "@/components/ui/input";
import { getOrganizations } from "@/fn/organization";
import { useSuspenseQuery } from "@tanstack/react-query";
import loading from "@/components/loading";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["organizations"],
      queryFn: () => getOrganizations(),
    });
  },
  pendingComponent: loading,
  component: RouteComponent,
});

function RouteComponent() {
  //   const organizations = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 27;
  const { data: organizations } = useSuspenseQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations(),
    gcTime: 5 * 60_000,
  });

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 100);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const searchableItems = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();
    if (!query) return organizations;

    const tokens = query.split(" ").filter(Boolean);

    return organizations
      .map((org) => {
        const name = org.name.toLowerCase();
        const bio = org.bio?.toLowerCase() || "";

        let score = 0;

        tokens.forEach((token) => {
          if (name.includes(token)) score += 2;
          if (bio.includes(token)) score += 1;
        });

        return { ...org, score };
      })
      .filter((org) => org.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [organizations, debouncedQuery]);

  const totalPages = Math.ceil(searchableItems.length / pageSize);
  const paginatedItems = searchableItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="w-full max-w-7xl mx-auto py-32 px-4">
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Organization & Clubs Directory
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
              Explore and connect with student organizations on campus. Find
              your community and get involved! This directory uses{" "}
              <a
                href="https://highlanderlink.ucr.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ucr-blue dark:text-ucr-gold font-semibold"
              >
                Highlander Link
              </a>{" "}
              as the source for this directory as well as events are linked
              based of the instagram. If it's active there but still not listed
              here, or if you have feedback or suggestions, please{" "}
              <Link
                to="/feedback"
                className="text-ucr-blue dark:text-ucr-gold font-semibold"
              >
                contact us here
              </Link>
              .
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">
                  {organizations.length}+
                </span>{" "}
                organizations
              </div>
              <div>Live data</div>
              <div>Updated regularly</div>
            </div>
          </div>

          <div className="flex items-center border border-[#E2E8F0] dark:border-border bg-white dark:bg-card rounded-3xl px-3 py-1 gap-2 w-full max-w-md">
            <Search className="text-muted-foreground" size={20} />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search 500+ organizations..."
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {searchableItems.length} organizations
        </p>
      </div>

      {paginatedItems.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No organizations found for{" "}
          <span className="font-medium text-foreground">"{searchQuery}"</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6">
          {paginatedItems.map(({ id, name, logoUrl, bio, socials }) => (
            <OrgCard
              organization={{ id, name, logoUrl, bio, socials }}
              key={id}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
