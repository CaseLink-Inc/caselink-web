import RoiRing from "./RoiRing";

/**
 * ROI, rebuilt on the design system's locked "Statistics" application
 * (step 8): a white card with the corner wash, the statement and the
 * figures on the left, and a chart card on a Glacier ground on the right.
 *
 * Copy is unchanged. What changed is that the landing phrase is now the
 * blue-to-mint gradient rather than the warm one (step 5: the landing
 * phrase is hue only, never peach), the figures are Regular rather than
 * Bold, and the middle card has lost its peach tint, which the system
 * allows nowhere outside the logo.
 *
 * The three figures keep their division and equals signs, stacked so the
 * arithmetic still reads top to bottom in a half-width column.
 */
const figures = [
  {
    label: "Average specialist case value",
    num: "$4,200",
    sub: "A single Invisalign, endodontic, or implant case",
    tone: "ice",
  },
  {
    label: "CaseLink Specialist plan",
    num: "$299 / month",
    sub: "$3,588 per year on monthly billing",
    tone: "",
  },
  {
    label: "Return on a single case",
    num: "14 months covered",
    sub: "Every additional case after that is profit",
    tone: "mint",
  },
] as const;

const operators = ["÷", "="];

export default function Roi() {
  return (
    <section className="roi-sec">
      <div className="wrap">
        <div className="roi-card-outer">
          <div className="roi-grid">
            <div className="roi-say">
              <span className="eyebrow reveal">Return on investment</span>
              <h2 className="reveal">
                One new case covers the
                <br />
                <span className="cl-landing">whole year.</span>
              </h2>
              <p className="roi-lead reveal">
                A single new patient referred through CaseLink typically covers
                more than twelve months of your subscription.
              </p>

              <div className="roi-stack">
                {figures.map((f, i) => (
                  <div key={f.label} className="roi-step">
                    <div
                      className={`roi-stat reveal${f.tone ? ` roi-stat--${f.tone}` : ""}`}
                      style={{ transitionDelay: `${i * 0.08}s` }}
                    >
                      <span className="roi-stat-lbl">{f.label}</span>
                      <span className="roi-stat-num">{f.num}</span>
                      <span className="roi-stat-sub">{f.sub}</span>
                    </div>
                    {operators[i] ? (
                      <span className="roi-op" aria-hidden="true">
                        {operators[i]}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <p className="roi-note">
                Numbers above use a conservative $4,200 case value. Actual
                returns vary by specialty and case mix.
              </p>
            </div>

            <div className="roi-chart reveal">
              <span className="eyebrow">Months covered by one case</span>
              <RoiRing />
              <ul className="roi-legend">
                <li>
                  <i className="roi-key roi-key--year" />
                  The whole year<em>12</em>
                </li>
                <li>
                  <i className="roi-key roi-key--beyond" />
                  Beyond it<em>2</em>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
