import { breadcrumbJsonLd, type Crumb } from "@/lib/breadcrumbs";

/** Emits BreadcrumbList JSON-LD. Renders nothing visible. */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }}
    />
  );
}
