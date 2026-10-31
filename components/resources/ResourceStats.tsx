import { type ResourceStat } from "@/lib/resources";

export default function ResourceStats({
  stats,
  accent = "#3E8EFF",
}: {
  stats: ResourceStat[];
  accent?: string;
}) {
  if (stats.length === 0) return null;
  return (
    /* `reveal` opts the strip into the site's scroll observer, which adds
       `in`; the per-card index drives the stagger from CSS so no state or
       timers are needed. */
    <div
      className="res-stats reveal"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="res-stat"
          style={{ "--i": i } as React.CSSProperties}
        >
          <div className="res-stat-val">{s.value}</div>
          <div className="res-stat-lbl">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
