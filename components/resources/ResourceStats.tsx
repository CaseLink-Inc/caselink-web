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
    <div
      className="res-stats"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {stats.map((s) => (
        <div key={s.label} className="res-stat">
          <div className="res-stat-val">{s.value}</div>
          <div className="res-stat-lbl">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
