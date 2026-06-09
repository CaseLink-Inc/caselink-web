import Link from "next/link";
import Image from "next/image";
import { Clock } from "@/components/icons";
import {
  type Resource,
  CATEGORY_COLOR,
  formatResourceDate,
} from "@/lib/resources";

export default function ResourceCard({
  r,
  reveal = true,
}: {
  r: Resource;
  // Scroll-reveal animation. Disable inside client-filtered grids, where cards
  // re-render on filter change and the reveal observer never re-observes them
  // (they'd stay invisible until a refresh).
  reveal?: boolean;
}) {
  return (
    <Link
      href={`/resources/${r.slug}`}
      className={`res-card${reveal ? " reveal" : ""}`}
    >
      <div
        className="res-thumb"
        style={{ "--accent": CATEGORY_COLOR[r.category] } as React.CSSProperties}
      >
        {r.thumbnail ? (
          <Image
            src={r.thumbnail}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 380px"
            className="res-thumb-img"
          />
        ) : (
          <Image
            src="/logo-mark-white.svg"
            alt=""
            width={44}
            height={44}
            className="res-thumb-mark"
          />
        )}
        <span className="res-cat">{r.category}</span>
      </div>
      <div className="res-card-body">
        <h3>{r.title}</h3>
        <p>{r.excerpt}</p>
        <div className="res-meta">
          <span>{formatResourceDate(r.date)}</span>
          <i aria-hidden="true">·</i>
          <span className="res-rt">
            <Clock width={12} height={12} />
            {r.readMinutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
