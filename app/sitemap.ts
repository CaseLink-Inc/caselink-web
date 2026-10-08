import type { MetadataRoute } from "next";
import { getResources } from "@/lib/resources";
import { specialties } from "@/lib/specialties";

const SITE = "https://www.caselink.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const articles: MetadataRoute.Sitemap = getResources().map((r) => ({
    url: `${SITE}/resources/${r.slug}`,
    lastModified: new Date(r.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const specialtyPages: MetadataRoute.Sitemap = specialties.map((s) => ({
    url: `${SITE}/referral-software/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE}/dental-referral-platform-dc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE}/referral-software`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...specialtyPages,
    {
      url: `${SITE}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE}/faqs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articles,
    {
      url: `${SITE}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/security`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/subprocessors`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
