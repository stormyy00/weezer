import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OrgCard from "@/components/organizations/org-card";
import Pagination from "@/components/organizations/pagination";
import { Input } from "@/components/ui/input";
import { getOrganizations } from "@/data/organization";

export const Route = createFileRoute("/organizations/")({
	component: RouteComponent,
	loader: async () => {
		return await getOrganizations();
	},
});

function RouteComponent() {
	const organizations = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 27;

	const searchableItems = useMemo(
		() =>
			organizations
				.map((organization) => ({
					...organization,
					searchableString: `${organization.name.toLowerCase()} ${organization.bio?.toLowerCase() || ""}`,
				}))
				.filter((organization) =>
					organization.searchableString.includes(searchQuery.toLowerCase()),
				),
		[organizations, searchQuery],
	)

	const totalPages = Math.ceil(searchableItems.length / pageSize);
	const paginatedItems = searchableItems.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	)

	useEffect(() => {
		if (totalPages > 0 && currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	return (
		<div className="w-full max-w-7xl mx-auto py-32 px-4">
			<div className="flex flex-col mb-10">
				<div className="flex justify-between w-full items-center">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
						Organization & Clubs Directory
					</h1>
					<div className="flex items-center border border-[#E2E8F0] dark:border-border bg-white dark:bg-card rounded-3xl px-3 py-0.5 gap-2 flex-1 max-w-md relative">
						<Search className="text-muted-foreground" size={20} />
						<Input
							value={searchQuery}
							onChange={(event) => {
								setSearchQuery(event.target.value);
								setCurrentPage(1)
							}}
							placeholder="Search..."
							className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
						/>
					</div>
				</div>
				<p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
					Explore and connect with various student organizations and clubs on
					campus. Find your community and get involved! Note: This directory is
					uses <a href="https://highlanderlink.ucr.edu" target="_blank" rel="noopener noreferrer">Highlander Link</a> 
          as the source of truth. If you notice any discrepancies, please reach out to the respective organizations directly.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6">
				{paginatedItems.map((organization) => (
					<OrgCard organization={organization} key={organization.id} />
				))}
			</div>
      
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
			/>
		</div>
	)
}
