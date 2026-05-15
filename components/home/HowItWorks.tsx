"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, Lock, Plus, Grid, ChatBubble, CheckList, Clock, Bolt, Check,
} from "@/components/icons";

const STAGE_MS = 5200;
const TABS = ["Referrals", "Network", "Messages", "Analytics"] as const;

export default function HowItWorks() {
  const [tab, setTab] = useState(0);
  // `round` increments every time we advance or jump, which is used as
  // the React key on the progress bar element to restart its CSS animation.
  const [round, setRound] = useState(0);
  const [running, setRunning] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setTab((t) => (t + 1) % 4);
    setRound((r) => r + 1);
  }, []);

  // IntersectionObserver: start when the frame enters the viewport,
  // pause when it leaves, resume when it comes back.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setRunning(entry.isIntersecting);
      });
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Drive the auto-advance interval, gated on `running`.
  useEffect(() => {
    if (!running) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(advance, STAGE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, advance]);

  const goTo = (i: number) => {
    setTab(i);
    setRound((r) => r + 1);
    // Reset the auto-advance timer so the new stage gets its full 5.2s.
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(advance, STAGE_MS);
    }
  };

  return (
    <section id="how" className="how-sec">
      <div className="wrap">
        <div className="how-head reveal">
          <span className="eyebrow">How it works</span>
          <h2>One workspace to manage and<br />grow your <span className="grad-text">referral network.</span></h2>
          <p>Send referrals, grow your network, message providers, and track progress. All in the same place.</p>
        </div>

        <div ref={frameRef} className="demo-frame reveal">
          <div className="demo-stepper">
            {TABS.map((label, i) => (
              <div
                key={label}
                className={`demo-step ${tab === i ? "active" : ""}`}
                onClick={() => goTo(i)}
              >
                <span className="num">{i + 1}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="demo-mockup">
            <div
              key={`progress-${round}`}
              className={`demo-progress ${running ? "go" : ""}`}
            />
            <div className="demo-browser">
              <div className="dots"><span /><span /><span /></div>
              <div className="demo-url">
                <Lock stroke="#3DBD6B" strokeWidth={2.5} />
                app.CaseLink.net
              </div>
            </div>
            <div className="demo-screen">
              <div className="demo-sidebar">
                <div className="ds-logo">
                  <Image src="/logo-mark.svg" width={22} height={22} alt="" />
                  CaseLink
                </div>
                <div className="ds-nav">
                  <div className={`ds-nav-item ${tab === 0 ? "on" : ""}`}><Plus />New referral</div>
                  <div className={`ds-nav-item ${tab === 1 ? "on" : ""}`}>
                    <Grid />Network<span className="badge">8</span>
                  </div>
                  <div className={`ds-nav-item ${tab === 2 ? "on" : ""}`}>
                    <ChatBubble />Messages<span className="badge">3</span>
                  </div>
                  <div className={`ds-nav-item ${tab === 3 ? "on" : ""}`}><CheckList />Analytics</div>
                </div>
              </div>

              <div className="demo-content">
                <div className={`demo-stage ${tab === 0 ? "live" : ""}`}>
                  <TabReferrals />
                </div>
                <div className={`demo-stage ${tab === 1 ? "live" : ""}`}>
                  <TabNetwork />
                </div>
                <div className={`demo-stage ${tab === 2 ? "live" : ""}`}>
                  <TabMessages />
                </div>
                <div className={`demo-stage ${tab === 3 ? "live" : ""}`}>
                  <TabAnalytics />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-benefits">
          <div className="dben reveal">
            <div className="dben-ic"><Clock width={18} height={18} stroke="#3E8EFF" /></div>
            <h4>Three-step referrals</h4>
            <p>Practice, patient, notes. Send in under three minutes.</p>
          </div>
          <div className="dben reveal" style={{ transitionDelay: ".1s" }}>
            <div className="dben-ic"><Bolt width={18} height={18} stroke="#FFA940" /></div>
            <h4>A network you grow</h4>
            <p>Find specialists nearby, invite the ones you trust.</p>
          </div>
          <div className="dben reveal" style={{ transitionDelay: ".2s" }}>
            <div className="dben-ic"><ChatBubble width={18} height={18} stroke="#3DBD6B" /></div>
            <h4>Patient and network threads</h4>
            <p>Encrypted messaging organized by patient and by practice.</p>
          </div>
          <div className="dben reveal" style={{ transitionDelay: ".3s" }}>
            <div className="dben-ic"><Check width={18} height={18} stroke="#90F0C5" /></div>
            <h4>Track progress</h4>
            <p>See every case move through your practice from referral to outcome.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TAB 1: REFERRALS ---------------- */
function TabReferrals() {
  return (
    <div className="tab-pad">
      <div className="ref-stepper">
        <div className="ref-step done"><span className="rs-dot">1</span>Practice</div>
        <div className="ref-step active"><span className="rs-dot">2</span>Patient</div>
        <div className="ref-step"><span className="rs-dot">3</span>Notes</div>
      </div>
      <div className="ref-to">
        <span className="ref-to-lbl">Referring to</span>
        <span className="ref-to-name">Capital Smile Orthodontics · Dr. R. Park</span>
        <Check width={14} height={14} stroke="#fff" strokeWidth={2.5} />
      </div>
      <div className="ref-form">
        <div className="ref-row">
          <div className="ref-field">
            <label>First name</label>
            <div className="ref-input filled">Maria</div>
          </div>
          <div className="ref-field">
            <label>Last name</label>
            <div className="ref-input filled">Santos</div>
          </div>
        </div>
        <div className="ref-row">
          <div className="ref-field">
            <label>Date of birth</label>
            <div className="ref-input filled">04 / 11 / 1989</div>
          </div>
          <div className="ref-field">
            <label>Phone</label>
            <div className="ref-input filled">(202) 555-0184</div>
          </div>
        </div>
        <div className="ref-row">
          <div className="ref-field">
            <label>Email</label>
            <div className="ref-input filled">m.santos@email.com</div>
          </div>
          <div className="ref-field">
            <label>Insurance</label>
            <div className="ref-input filled">Delta Dental</div>
          </div>
        </div>
      </div>
      <div className="ref-foot">
        <button className="ref-back">Back</button>
        <button className="ref-next">Continue<ArrowRight width={12} height={12} /></button>
      </div>
    </div>
  );
}

/* ---------------- TAB 2: NETWORK ---------------- */
function TabNetwork() {
  const practices = [
    { initials: "CS", av: "a1", name: "Capital Smile Orthodontics", spec: "Orthodontics", doc: "Dr. R. Park", refs: 34 },
    { initials: "DC", av: "a2", name: "DC Oral Surgery Center", spec: "Oral Surgery", doc: "Dr. M. Chen", refs: 21 },
    { initials: "DP", av: "a3", name: "District Perio", spec: "Periodontics", doc: "Dr. P. Patel", refs: 18 },
    { initials: "RB", av: "a4", name: "Root & Branch Endo", spec: "Endodontics", doc: "Dr. J. Wu", refs: 15 },
  ];
  return (
    <div className="tab-pad">
      <div className="net-head">
        <div>
          <div className="net-title">Your network</div>
          <div className="net-sub">8 connected practices across 4 specialties</div>
        </div>
      </div>
      <div className="net-subtabs">
        <span className="net-subtab on">Connected</span>
        <span className="net-subtab">Discover</span>
      </div>
      <div className="net-grid">
        {practices.map((p) => (
          <div key={p.name} className="net-card">
            <div className={`net-av ${p.av}`}>{p.initials}</div>
            <div className="net-info">
              <div className="net-name">{p.name}</div>
              <div className="net-meta">{p.spec} · {p.doc}</div>
            </div>
            <div className="net-refs">
              <span className="net-refs-n">{p.refs}</span>
              <span className="net-refs-l">refs</span>
            </div>
          </div>
        ))}
      </div>
      <div className="net-foot">
        12 more practices nearby on CaseLink.
        <a className="net-discover">Discover
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ---------------- TAB 3: MESSAGES ---------------- */
function TabMessages() {
  const threads = [
    { active: true, unread: true, initials: "SC", av: "a1", name: "Dr. Sarah Chen", practice: "Capital Smile", preview: "X-rays received. Treatment plan looks good.", time: "9:24a" },
    { initials: "MC", av: "a2", name: "Dr. M. Chen", practice: "DC Oral Surgery", preview: "Got the panoramic, thanks", time: "8:51a" },
    { initials: "PP", av: "a3", name: "Dr. P. Patel", practice: "District Perio", preview: "Following up on Mr. Reyes", time: "Yest" },
    { initials: "JW", av: "a4", name: "Dr. J. Wu", practice: "Root & Branch Endo", preview: "Treatment complete, report attached", time: "Mon" },
  ];
  return (
    <div className="tab-pad msg-pad">
      <div className="msg-grid">
        <aside className="msg-list">
          <div className="msg-filters">
            <span className="msg-filter on">All active</span>
            <span className="msg-filter">Unread</span>
            <span className="msg-filter">Patient</span>
            <span className="msg-filter">Network</span>
          </div>
          {threads.map((t, i) => (
            <div key={i} className={`msg-thread ${t.active ? "on" : ""}`}>
              <div className={`msg-av ${t.av}`}>{t.initials}</div>
              <div className="msg-thread-info">
                <div className="msg-thread-top">
                  <span className="msg-thread-name">{t.name}</span>
                  <span className="msg-thread-time">{t.time}</span>
                </div>
                <div className="msg-thread-practice">{t.practice}</div>
                <div className="msg-thread-preview">{t.preview}</div>
              </div>
              {t.unread && <span className="msg-unread" aria-label="unread" />}
            </div>
          ))}
        </aside>
        <main className="msg-pane">
          <div className="msg-pane-head">
            <div className="msg-pane-av a1">SC</div>
            <div>
              <div className="msg-pane-name">Dr. Sarah Chen</div>
              <div className="msg-pane-meta">Maria Santos · Orthodontics</div>
            </div>
          </div>
          <div className="msg-bubbles">
            <div className="msg-bub them">
              <div>Hi, just received the x-rays. Looks like a good candidate for Invisalign.</div>
              <span className="msg-bub-t">9:14 am</span>
            </div>
            <div className="msg-bub me">
              <div>Great. She mentioned crowding on the lower arch, anything we should add?</div>
              <span className="msg-bub-t">9:18 am</span>
            </div>
            <div className="msg-bub them">
              <div>Got it. Treatment plan looks good. I&apos;ll loop back with the next steps shortly.</div>
              <span className="msg-bub-t">9:24 am</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- TAB 4: ANALYTICS ---------------- */
function TabAnalytics() {
  const stats = [
    { big: "428", lbl: "Total referrals", delta: "+18%", positive: true },
    { big: "85%", lbl: "Conversion rate", delta: "+4 pts", positive: true },
    { big: "2.4h", lbl: "Avg response", delta: "-32 min", positive: true },
    { big: "$186k", lbl: "Revenue impact", delta: "+22%", positive: true },
  ];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = [
    { r: 28, c: 22 }, { r: 32, c: 28 }, { r: 30, c: 26 }, { r: 38, c: 32 },
    { r: 42, c: 36 }, { r: 40, c: 35 }, { r: 45, c: 40 }, { r: 48, c: 42 },
    { r: 50, c: 44 }, { r: 54, c: 48 }, { r: 58, c: 52 }, { r: 62, c: 56 },
  ];
  const maxBar = 70;

  return (
    <div className="tab-pad">
      <div className="ana-head">
        <div className="ana-title">Performance</div>
        <div className="ana-sub">Trends across referrals, response time, and revenue · Last 12 months</div>
      </div>
      <div className="ana-stats">
        {stats.map((s, i) => (
          <div key={i} className="ana-stat">
            <div className="ana-stat-big">{s.big}</div>
            <div className="ana-stat-lbl">{s.lbl}</div>
            <div className={`ana-stat-delta ${s.positive ? "up" : ""}`}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div className="ana-chart-wrap">
        <div className="ana-chart-head">
          <div className="ana-chart-title">Referrals over time</div>
          <div className="ana-legend">
            <span><span className="leg-sw" style={{ background: "#3E8EFF" }} />Received</span>
            <span><span className="leg-sw" style={{ background: "#90F0C5" }} />Completed</span>
          </div>
        </div>
        <div className="ana-chart">
          {data.map((d, i) => (
            <div key={i} className="ana-bar-group">
              <div className="ana-bars">
                <div className="ana-bar received" style={{ height: `${(d.r / maxBar) * 100}%` }} />
                <div className="ana-bar completed" style={{ height: `${(d.c / maxBar) * 100}%` }} />
              </div>
              <div className="ana-bar-lbl">{months[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
