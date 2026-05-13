import Image from "next/image";
import Link from "next/link";
import {
  Plus, Grid, ChatBubble, CheckList, ArrowRight,
} from "@/components/icons";

const referrals = [
  { initials: "MS", av: "a1", name: "Maria Santos", to: "Dr. Lee, Orthodontics", pill: "active", pillLabel: "Active", time: "2 min ago" },
  { initials: "JR", av: "a2", name: "James Reyes", to: "Dr. Adams, Endodontics", pill: "sent", pillLabel: "Sent", time: "14 min ago" },
  { initials: "EP", av: "a3", name: "Emma Park", to: "Dr. Singh, Periodontics", pill: "done", pillLabel: "Complete", time: "1 hour ago" },
  { initials: "DK", av: "a4", name: "David Kim", to: "Dr. Murphy, Oral surgery", pill: "done", pillLabel: "Complete", time: "Yesterday" },
  { initials: "AL", av: "a1", name: "Alicia Lopez", to: "Dr. Lee, Orthodontics", pill: "sent", pillLabel: "Sent", time: "Yesterday" },
  { initials: "TR", av: "a2", name: "Tomas Reyes", to: "Dr. Adams, Endodontics", pill: "done", pillLabel: "Complete", time: "Mon" },
];

const stats = [
  { big: "12", lbl: "Active referrals", cls: "s1" },
  { big: "47", lbl: "Sent this month", cls: "s2" },
  { big: "92%", lbl: "Completion rate", cls: "s3" },
  { big: "2.4h", lbl: "Avg response", cls: "s4" },
];

export default function DashboardPage() {
  return (
    <section className="dash">
      <div className="wrap">
        <div className="dash-shell">
          <aside className="dash-side">
            <div className="ds-logo">
              <Image src="/caselink-logo.svg" width={24} height={24} alt="" />
              CaseLink
            </div>
            <div className="ds-nav">
              <div className="ds-nav-item on"><Grid />Referrals<span className="badge">12</span></div>
              <Link href="#" className="ds-nav-item"><Plus />New referral</Link>
              <Link href="#" className="ds-nav-item">
                <ChatBubble />Messages<span className="badge">2</span>
              </Link>
              <Link href="#" className="ds-nav-item"><CheckList />Outcomes</Link>
            </div>
            <div className="dash-promo">
              <div className="lbl">Demo</div>
              <p>You&apos;re signed in to a demo account with mock data.</p>
              <Link href="/">Back to site</Link>
            </div>
          </aside>

          <main className="dash-main">
            <div className="dash-head">
              <div>
                <h1>Good morning, Dr. Chen</h1>
                <p>You have 2 referrals waiting for an update.</p>
              </div>
              <Link href="#" className="btn btn-primary">
                New referral
                <ArrowRight width={14} height={14} />
              </Link>
            </div>

            <div className="dash-stats">
              {stats.map((s, i) => (
                <div key={i} className={`dash-stat ${s.cls}`}>
                  <div className="big">{s.big}</div>
                  <div className="lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            <div className="dash-list-head">
              <h2>Recent referrals</h2>
              <span className="count">Showing {referrals.length}</span>
            </div>

            <div className="demo-cards">
              {referrals.map((r, i) => (
                <div key={i} className={`dcard in ${i === 0 ? "active" : ""}`}>
                  <div className={`dcard-av ${r.av}`}>{r.initials}</div>
                  <div className="dcard-info">
                    <div className="nm">{r.name}</div>
                    <div className="meta">→ {r.to}</div>
                  </div>
                  <span className={`dcard-pill ${r.pill}`}>{r.pillLabel}</span>
                  <span className="dcard-time">{r.time}</span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
