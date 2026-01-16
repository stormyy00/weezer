import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { organizations } from "@/db/schemas";

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
			.where(eq(organizations.status, 1))
			.orderBy(asc(organizations.name));

		const normalized = result.map((org) => {
			if (org.socials && typeof org.socials === "object") {
				normalizeInstagram(org.socials as OrganizationSocials);
			}
			return org as OrganizationRecord;
		});

		return normalized;
	},
);
