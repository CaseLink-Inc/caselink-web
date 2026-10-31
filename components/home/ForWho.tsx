import Image from "next/image";
import { SIGNUP_URL } from "@/lib/urls";

/**
 * Audience cards, restyled onto the design system's WebsiteCards "Value"
 * family (step 7): solid white .cl-card--lg on the Ice field ground, a
 * frosted design system icon in a round icon box, a Regular 22px card
 * headline, and the points as .cl-card-row dividers.
 *
 * The copy is unchanged from the previous section: the same eyebrow,
 * headline, lead, roles, titles, bodies, points and calls to action.
 */
export default function ForWho() {
  const cards = [
    {
      icon: "/ds/icons/caselink-general-dentist.svg",
      role: "For general dentists",
      title: "Refer with confidence.",
      body: "Keep your patients and your specialist relationships in one place.",
      points: [
        "See every case status at a glance",
        "See case progress and outcome reports as they come back",
        "Free for general dentists",
      ],
      cta: "Start as a GP",
      href: SIGNUP_URL,
    },
    {
      icon: "/ds/icons/caselink-specialist.svg",
      role: "For specialists",
      title: "Receive without chaos.",
      body: "Triage incoming cases in seconds with full clinical context attached.",
      points: [
        "Pre-filled patient details and x-rays",
        "Reply right in the case thread instead of over the phone",
        "One additional case per month covers the plan",
      ],
      cta: "Start as a specialist",
      href: SIGNUP_URL,
    },
    {
      icon: "/ds/icons/caselink-care-team.svg",
      role: "For office managers",
      title: "Coordinate without the calls.",
      body: "Run the daily flow of referrals across the whole practice without chasing anyone.",
      points: [
        "Every case visible to your front desk team",
        "One thread per patient, all history attached",
        "Multiple staff seats included on every plan",
      ],
      cta: "Start with your team",
      href: SIGNUP_URL,
    },
  ];

  return (
    <section id="who" className="clsec clsec--frosted cl-grain">
      {/* G6 Frosted field: glows underneath, a grid of frosted tiles on
          top. The tiles are .cl-tile-field's own <i> children. */}
      <div className="clsec-tiles cl-tile-field" aria-hidden="true">
        {Array.from({ length: 180 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="wrap clsec-body">
        <div className="clsec-head reveal">
          <span className="clsec-eyebrow">Built for both sides</span>
          <h2 className="clsec-h2">
            Whichever side of the
            <br />
            <span className="cl-landing">referral</span> you are on.
          </h2>
          <p className="clsec-lede">
            Same workspace. Different details. Right for each role.
          </p>
        </div>

        <div className="clwho-grid">
          {cards.map((c, i) => (
            <div
              key={c.role}
              className="cl-card cl-card--lg clwho-card reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div>
                <span className="clw-ibx clw-ibx--lg">
                  <Image src={c.icon} alt="" width={52} height={52} />
                </span>
                <div className="clwho-role">{c.role}</div>
                <h3 className="clw-cardtitle">{c.title}</h3>
                <p className="clw-cardbody">{c.body}</p>
                <ul className="clwho-points">
                  {c.points.map((p) => (
                    <li key={p} className="cl-card-row">
                      <span className="cl-ring" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={c.href}
                className="cl-btn cl-btn--secondary clwho-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
