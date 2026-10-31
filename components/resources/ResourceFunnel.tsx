export type FunnelStage = {
  /** Stage name, e.g. "Patient contacts the specialist". */
  label: string;
  /** The published figure for this stage, or omitted when none exists. */
  figure?: string;
  /** Short note under the stage: the source, or what the gap is. */
  note: string;
  /** Marks the stage the article calls the biggest drop. */
  peak?: boolean;
};

/**
 * The referral funnel as a diagram rather than five paragraphs.
 *
 * It carries the article's own numbers and nothing else. Where the piece
 * says a stage is not measured, the stage says so too: a funnel drawn to
 * invented widths would claim precision the data does not have, which is
 * the opposite of what the article argues. So the bars are even and the
 * figures do the talking.
 */
export default function ResourceFunnel({
  stages,
  result,
  accent = "#3E8EFF",
}: {
  stages: FunnelStage[];
  /** The end-to-end line, e.g. "35 to 45%". */
  result?: { figure: string; label: string };
  accent?: string;
}) {
  return (
    <figure
      className="res-funnel"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <ol className="res-funnel-list">
        {stages.map((s, i) => (
          <li
            key={s.label}
            className={`res-funnel-stage${s.peak ? " is-peak" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {/* The node sits OUTSIDE the card, in the spine's gutter. Inside
                it, the card's own backdrop-filter would paint over the line
                and leave it showing only as slivers between stages. */}
            <span className="res-funnel-node" aria-hidden="true">
              {i + 1}
            </span>
            <span className="res-funnel-card">
              <span className="res-funnel-body">
                <span className="res-funnel-label">{s.label}</span>
                <span className="res-funnel-note">{s.note}</span>
              </span>
              <span className={`res-funnel-fig${s.figure ? "" : " is-gap"}`}>
                {s.figure ?? "Not measured"}
              </span>
            </span>
          </li>
        ))}
      </ol>
      {result && (
        <div className="res-funnel-result">
          <span className="res-funnel-result-val">{result.figure}</span>
          <span className="res-funnel-result-lbl">{result.label}</span>
        </div>
      )}
    </figure>
  );
}
