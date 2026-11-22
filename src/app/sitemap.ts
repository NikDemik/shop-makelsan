import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import { SOLUTIONS } from "@/lib/solutions";
import { KB_ARTICLES } from "@/lib/kb";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/solutions`, changeFrequency: "weekly", priority: 0.7 },
    ...SOLUTIONS.map<MetadataRoute.Sitemap[number]>((s) => ({
      url: `${SITE_URL}/solutions/${s.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
    { url: `${SITE_URL}/kb`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/documentation`, changeFrequency: "weekly", priority: 0.6 },
    ...KB_ARTICLES.map<MetadataRoute.Sitemap[number]>((a) => ({
      url: `${SITE_URL}/kb/${a.slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
    })),
    { url: `${SITE_URL}/delivery`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/warranty`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contacts`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [series, products] = await Promise.all([
    prisma.series.findMany({ select: { slug: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, modDate: true },
    }),
  ]);

  return [
    ...staticEntries,
    ...series.map<MetadataRoute.Sitemap[number]>((s) => ({
      url: `${SITE_URL}/catalog/${s.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...products.map<MetadataRoute.Sitemap[number]>((p) => ({
      url: `${SITE_URL}/product/${encodeURIComponent(p.slug)}`,
      lastModified: p.modDate ?? undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
