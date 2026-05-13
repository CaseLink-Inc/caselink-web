import Link from "next/link";
import { Briefcase, Smile, Heart, ArrowRight } from "@/components/icons";

export default function ForWho() {
  const cards = [
    {
      icon: <Briefcase width={26} height={26} stroke="#3E8EFF" />,
      role: "For general dentists",
      title: "Refer with confidence.",
      body: "Keep your patients and your specialist relationships in one place.",
      points: [
        "See every case status at a glance",
        "Get outcome reports back automatically",
        "Free to use, forever",
      ],
      cta: "Start as a GP",
    },
    {
      icon: <Smile width={26} height={26} stroke="#FFA940" />,
      role: "For specialists",
      title: "Receive without chaos.",
      body: "Triage incoming cases in seconds with full clinical context attached.",
      points: [
        "Pre-filled patient details and x-rays",
        "Reply in the case thread, not over the phone",
        "One additional case per month covers the plan",
      ],
      cta: "Start as a specialist",
    },
    {
      icon: <Heart width={26} height={26} stroke="#3DBD6B" />,
      role: "For patients",
      title: "Continuity by design.",
      body: "Arrive at the specialist already known, with records already shared.",
      points: [
        "No repeating symptoms across visits",
        "No re-shooting x-rays",
        "Care that feels coordinated",
      ],
      cta: "Learn more",
    },
  ];

  return (
    <section id="who" className="for-who">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Built for both sides</span>
          <h2>Whichever side of the<br /><span className="grad-text">referral</span> you are on.</h2>
          <p>Same workspace. Different details. Right for each role.</p>
        </div>
        <div className="who-grid">
          {cards.map((c, i) => (
            <div key={c.role} className="who-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div>
                <div className="who-icon">{c.icon}</div>
                <div className="role">{c.role}</div>
                <h3>{c.title}</h3>
                <p className="body">{c.body}</p>
                <ul className="points">
                  {c.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
              <Link href="/contact" className="arr">
                {c.cta}
                <ArrowRight width={16} height={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
