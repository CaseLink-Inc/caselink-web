"use client";

import { useState } from "react";
import ResourceCard from "@/components/resources/ResourceCard";
import { type Resource, type ResourceCategory } from "@/lib/resources";

const CATEGORY_ORDER: ResourceCategory[] = [
  "Referrals",
  "Benchmarks",
  "Specialists",
  "Operations",
  "Getting started",
  "Policy",
];

// Category-tab row + filtered grid (Gapstars-style). Tabs only show
// categories that actually have articles, so it stays clean as the library
// grows.
export default function ResourceLibrary({ resources }: { resources: Resource[] }) {
  const present = CATEGORY_ORDER.filter((c) =>
    resources.some((r) => r.category === c),
  );
  const tabs: string[] = ["All", ...present];
  const [active, setActive] = useState("All");

  const shown =
    active === "All"
      ? resources
      : resources.filter((r) => r.category === active);

  return (
    <section className="res-main">
      <div className="wrap">
        <div className="res-tabs" role="tablist" aria-label="Filter resources by topic">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active === t}
              className={`res-tab${active === t ? " is-active" : ""}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="res-grid">
          {shown.map((r) => (
            <ResourceCard key={r.slug} r={r} reveal={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
