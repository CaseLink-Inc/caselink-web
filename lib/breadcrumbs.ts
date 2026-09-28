const SITE = "https://www.caselink.net";

export type Crumb = { name: string; path: string };

/**
 * BreadcrumbList JSON-LD for an inner page. Home is prepended
 * automatically, so pass only the trail below it, ending with the
 * current page. Schema only: the site shows no visible breadcrumb bar.
 */
export function breadcrumbJsonLd(trail: Crumb[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path === "/" ? "/" : c.path}`,
    })),
  };
}
