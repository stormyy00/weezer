import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { organizations } from "@/db/schemas";
import { Organization } from "./table/organization";

export type OrganizationSocials = {
	instagram?: string | null;
	[key: string]: string | null | undefined;
};

export type OrganizationRecord = {
	id: string;
	name: string;
	bio: string | null;
	logoUrl: string | null;
	profileUrl: string | null;
	category: string | null;
	socials: OrganizationSocials | null;
};

const normalizeInstagram = (socials: OrganizationSocials | null) => {
	if (socials?.instagram && !socials.instagram.startsWith("http")) {
		socials.instagram = `https://instagram.com/${socials.instagram}`;
	}
};

export const getOrganizationById = createServerFn()
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }): Promise<OrganizationRecord | null> => {
		const [organization] = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				socials: organizations.socials,
				bio: organizations.bio,
				logoUrl: organizations.logoUrl,
				profileUrl: organizations.profileUrl,
				category: organizations.category,
			})
			.from(organizations)
			.where(eq(organizations.id, data.id));

		if (organization?.socials && typeof organization.socials === "object") {
			normalizeInstagram(organization.socials as OrganizationSocials);
		}

		return (organization ?? null) as OrganizationRecord | null;
	});

export const getOrganizations = createServerFn().handler(
	async (): Promise<OrganizationRecord[]> => {
		const result = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				socials: organizations.socials,
				bio: organizations.bio,
				logoUrl: organizations.logoUrl,
			})
			.from(organizations)
			.orderBy(desc(organizations.status), asc(organizations.name));

		const normalized = result.map((org) => {
			if (org.socials && typeof org.socials === "object") {
				normalizeInstagram(org.socials as OrganizationSocials);
			}
			return org as OrganizationRecord;
		});

		return normalized;
	},
);


export const getOrganizationsAdmin = createServerFn().handler(async (): Promise<Organization[]> => {
 const result = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				socials: organizations.socials,
				bio: organizations.bio,
				profileUrl: organizations.profileUrl,
				status: organizations.status,
				createdAt: organizations.createdAt,
				lastScrapedAt: organizations.lastScrapedAt,
				instagramHandle: organizations.instagramHandle,
				totalPosts: organizations.totalPosts,
				totalEvents: organizations.totalEvents,
			})
			.from(organizations)
			.orderBy(asc(organizations.name));

		return result.map((org) => ({
			...org,
			bio: org.bio ?? "",
			instagramHandle: org.instagramHandle ?? "",
			profileUrl: org.profileUrl ?? "",
		}));
	},
);