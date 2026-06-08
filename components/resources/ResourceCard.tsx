import Link from "next/link";
import Image from "next/image";
import { Clock } from "@/components/icons";
import {
  type Resource,
  CATEGORY_COLOR,
  formatResourceDate,
} from "@/lib/resources";

export default function ResourceCard({ r }: { r: Resource }) {
  return (
    <Link href={`/resources/${r.slug}`} className="res-card reveal">
      <div
        className="res-thumb"
        style={{ "--accent": CATEGORY_COLOR[r.category] } as React.CSSProperties}
        aria-hidden="true"
      >
        <Image
          src="/logo-mark-white.svg"
          alt=""
          width={44}
          height={44}
          className="res-thumb-mark"
        />
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
