import type { MetadataRoute } from "next";
import { getResources } from "@/lib/resources";

const SITE = "https://www.caselink.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const articles: MetadataRoute.Sitemap = getResources().map((r) => ({
    url: `${SITE}/resources/${r.slug}`,
    lastModified: new Date(r.date),
    changeFrequency: "monthly",
    priority: 0.6,
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
  ];
}
