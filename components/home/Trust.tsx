import Image from "next/image";
import TrustStage from "./TrustStage";

/**
 * Trust, rebuilt on the design system's locked "Feature section" application
 * (step 8): white ground with a corner wash, one hero object in a 32px frame
 * beside the statement, and four step 7 value cards on an Ice field panel
 * below, each with a frosted icon from the step 6 set.
 *
 * The hero object is TrustStage. The claim icons come from the icon set's
 * own "HIPAA and security" group, and the four here are different from the
 * four orbiting the padlock, since no artwork repeats across a set.
 *
 * Copy is unchanged from the previous section.
 */
const items = [
  {
    icon: "/ds/icons/caselink-encryption-key.svg",
    title: "Encrypted in transit and at rest",
    body: "Every referral, every message, every file encrypted in transit and at rest.",
  },
  {
    icon: "/ds/icons/caselink-audit-log.svg",
    title: "Audit logs for every action",
    body: "Every login, every change, every download timestamped and traceable.",
  },
  {
    icon: "/ds/icons/caselink-access-control.svg",
    title: "Role-based access with auto timeouts",
    body: "Staff see only what they need. Sessions end when they should.",
  },
  {
    icon: "/ds/icons/caselink-privacy.svg",
    title: "Designed for dental privacy from day one",
    body: "Built around HIPAA from the first line of code. Never retrofitted.",
  },
];

export default function Trust() {
  return (
    <section id="trust" className="trust cl-grain">
      <div className="wrap">
        <div className="trust-top">
          <TrustStage />
          <div className="trust-say reveal">
            <span className="eyebrow">HIPAA compliance</span>
            <h2>
              <span className="cl-landing">HIPAA</span> compliance you can trust.
            </h2>
            <p className="lead">
              We don&apos;t just meet standards. We build on them.
            </p>
          </div>
        </div>

        <div className="trust-base reveal">
          <div className="trust-four clw-stagger">
            {items.map((it, i) => (
              <div
                key={it.title}
                className="cl-card cl-card--lg trust-card"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="clw-ibx clw-ibx--lg">
                  <Image src={it.icon} alt="" width={52} height={52} />
                </span>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
