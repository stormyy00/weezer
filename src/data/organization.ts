import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { organizations } from "@/db/schemas";
import { Organization } from "./table/organization";
import { authenticate } from "@/middleware/auth";

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
  instagramHandle: string | null;
  status: number;
  confidence: number;
  totalPosts: number;
  totalEvents: number;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  discoveredAt: Date | null;
  lastScrapedAt: Date | null;
  lastPostAt: Date | null;
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
        instagramHandle: organizations.instagramHandle,
        status: organizations.status,
        confidence: organizations.confidence,
        totalPosts: organizations.totalPosts,
        totalEvents: organizations.totalEvents,
        source: organizations.source,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        discoveredAt: organizations.discoveredAt,
        lastScrapedAt: organizations.lastScrapedAt,
        lastPostAt: organizations.lastPostAt,
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
        profileUrl: organizations.profileUrl,
        category: organizations.category,
        instagramHandle: organizations.instagramHandle,
        status: organizations.status,
        confidence: organizations.confidence,
        totalPosts: organizations.totalPosts,
        totalEvents: organizations.totalEvents,
        source: organizations.source,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        discoveredAt: organizations.discoveredAt,
        lastScrapedAt: organizations.lastScrapedAt,
        lastPostAt: organizations.lastPostAt,
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

export const getOrganizationsAdmin = createServerFn()
  .middleware([authenticate])
  .handler(async (): Promise<Organization[]> => {
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
  });

export const changeOrganizationStatus = createServerFn()
  .middleware([authenticate])
  .inputValidator(
    z.object({
      orgId: z.string(),
      status: z.enum(["active", "inactive"]),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const statusValue = data.status === "active" ? 1 : 0;
    await db
      .update(organizations)
      .set({ status: statusValue })
      .where(eq(organizations.id, data.orgId));
  });

export const deleteOrganization = createServerFn()
  .middleware([authenticate])
  .inputValidator(
    z.object({
      orgId: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    await db.delete(organizations).where(eq(organizations.id, data.orgId));
  });
