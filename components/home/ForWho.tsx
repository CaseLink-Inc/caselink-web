import { Briefcase, Smile, ArrowRight } from "@/components/icons";
import { Users } from "@/components/icons";
import { SIGNUP_URL } from "@/lib/urls";

export default function ForWho() {
  const cards = [
    {
      iconClass: "who-anim-float",
      icon: <Briefcase width={26} height={26} stroke="#3E8EFF" />,
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
      iconClass: "who-anim-pulse",
      icon: <Smile width={26} height={26} stroke="#FFA940" />,
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
      iconClass: "who-anim-sway",
      icon: <Users width={26} height={26} stroke="#3DBD6B" />,
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
                <div className={`who-icon ${c.iconClass}`}>
                  <span className="who-icon-inner">{c.icon}</span>
                </div>
                <div className="role">{c.role}</div>
                <h3>{c.title}</h3>
                <p className="body">{c.body}</p>
                <ul className="points">
                  {c.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
              <a href={c.href} className="arr">
                {c.cta}
                <ArrowRight width={16} height={16} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
