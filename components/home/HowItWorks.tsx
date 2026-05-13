"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, Lock, Plus, Grid, ChatBubble, CheckList, Image as ImageIc,
  File, CreditCard, Clock, Bolt, Check,
} from "@/components/icons";

const STAGE_MS = 4200;

type Stage1State = {
  patient: string;
  specialty: string;
  refer: string;
  priority: string;
  typing: 0 | 1 | 2 | 3 | 4;
  attachIn: [boolean, boolean, boolean];
  ctaReady: boolean;
};

const emptyStage1: Stage1State = {
  patient: "",
  specialty: "",
  refer: "",
  priority: "",
  typing: 0,
  attachIn: [false, false, false],
  ctaReady: false,
};

function useTypingSequence(active: boolean) {
  const [state, setState] = useState<Stage1State>(emptyStage1);

  useEffect(() => {
    if (!active) {
      setState(emptyStage1);
      return;
    }
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const typeInto = (
      field: "patient" | "specialty" | "refer" | "priority",
      text: string,
      speed: number,
      typingId: 1 | 2 | 3 | 4
    ) => new Promise<void>((resolve) => {
      let i = 0;
      setState((s) => ({ ...s, typing: typingId }));
      const tick = () => {
        if (cancelled) return resolve();
        i++;
        setState((s) => ({ ...s, [field]: text.slice(0, i) }));
        if (i >= text.length) {
          setState((s) => ({ ...s, typing: 0 }));
          resolve();
        } else {
          timeouts.push(setTimeout(tick, speed));
        }
      };
      timeouts.push(setTimeout(tick, speed));
    });

    (async () => {
      await typeInto("patient", "Maria Santos", 40, 1);
      if (cancelled) return;
      await typeInto("specialty", "Orthodontics", 35, 2);
      if (cancelled) return;
      await typeInto("refer", "Dr. Lee, Capital Smile Ortho", 28, 3);
      if (cancelled) return;
      await typeInto("priority", "Routine", 60, 4);
      if (cancelled) return;
      [0, 1, 2].forEach((idx) => {
        timeouts.push(setTimeout(() => {
          setState((s) => {
            const a: [boolean, boolean, boolean] = [...s.attachIn];
            a[idx] = true;
            return { ...s, attachIn: a };
          });
        }, idx * 180));
      });
      timeouts.push(setTimeout(() => setState((s) => ({ ...s, ctaReady: true })), 700));
    })();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [active]);

  return state;
}

export default function HowItWorks() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stage1 = useTypingSequence(started && stage === 0);

  const advance = useCallback(() => {
    setStage((s) => (s + 1) % 4);
    stageStartRef.current = Date.now();
    setProgress(0);
  }, []);

  // Start demo when in view
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          stageStartRef.current = Date.now();
        }
      });
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  // Auto-advance + progress
  useEffect(() => {
    if (!started) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, STAGE_MS);
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - stageStartRef.current;
      setProgress(Math.min(100, (elapsed / STAGE_MS) * 100));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(raf);
    };
  }, [started, advance]);

  const goTo = (i: number) => {
    setStage(i);
    stageStartRef.current = Date.now();
    setProgress(0);
  };

  return (
    <section id="how" className="how-sec">
      <div className="wrap">
        <div className="how-head reveal">
          <span className="eyebrow">How it works</span>
          <h2>Send a referral in<br />under <span className="grad-text">ninety seconds.</span></h2>
          <p>Watch a real workflow move through CaseLink from start to finish.</p>
        </div>

        <div ref={frameRef} className="demo-frame reveal">
          <div className="demo-stepper">
            {["Send", "Track", "Talk", "Close"].map((label, i) => (
              <div
                key={label}
                className={`demo-step ${stage === i ? "active" : ""}`}
                onClick={() => goTo(i)}
              >
                <span className="num">{i + 1}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="demo-mockup">
            <div className="demo-progress" style={{ width: `${progress}%` }} />
            <div className="demo-browser">
              <div className="dots"><span /><span /><span /></div>
              <div className="demo-url">
                <Lock stroke="#3DBD6B" strokeWidth={2.5} />
                app.caselink.net
              </div>
            </div>
            <div className="demo-screen">
              <div className="demo-sidebar">
                <div className="ds-logo">
                  <Image src="/caselink-logo.svg" width={22} height={22} alt="" />
                  CaseLink
                </div>
                <div className="ds-nav">
                  <div className={`ds-nav-item ${stage === 0 ? "on" : ""}`}><Plus />New referral</div>
                  <div className={`ds-nav-item ${stage === 1 ? "on" : ""}`}>
                    <Grid />Referrals<span className="badge">12</span>
                  </div>
                  <div className={`ds-nav-item ${stage === 2 ? "on" : ""}`}>
                    <ChatBubble />Messages<span className="badge">2</span>
                  </div>
                  <div className={`ds-nav-item ${stage === 3 ? "on" : ""}`}><CheckList />Outcomes</div>
                </div>
              </div>

              <div className="demo-content">
                {/* Stage 1: SEND */}
                <div className={`demo-stage ${stage === 0 ? "live" : ""}`}>
                  <div className="demo-stage-title">New referral</div>
                  <div className="demo-stage-sub">Pre-filled from your patient records</div>
                  <div className="demo-form">
                    <div className="dform-row">
                      <div className="dform-field">
                        <label>Patient</label>
                        <div className={`dform-input ${stage1.typing === 1 ? "typing" : ""} ${stage1.patient && stage1.typing !== 1 ? "filled" : ""}`}>{stage1.patient}</div>
                      </div>
                      <div className="dform-field">
                        <label>Specialty</label>
                        <div className={`dform-input ${stage1.typing === 2 ? "typing" : ""} ${stage1.specialty && stage1.typing !== 2 ? "filled" : ""}`}>{stage1.specialty}</div>
                      </div>
                    </div>
                    <div className="dform-row">
                      <div className="dform-field">
                        <label>Refer to</label>
                        <div className={`dform-input ${stage1.typing === 3 ? "typing" : ""} ${stage1.refer && stage1.typing !== 3 ? "filled" : ""}`}>{stage1.refer}</div>
                      </div>
                      <div className="dform-field">
                        <label>Priority</label>
                        <div className={`dform-input ${stage1.typing === 4 ? "typing" : ""} ${stage1.priority && stage1.typing !== 4 ? "filled" : ""}`}>{stage1.priority}</div>
                      </div>
                    </div>
                    <div className="dform-field">
                      <label>Attachments</label>
                      <div className="dform-attach">
                        <div className={`dform-att ${stage1.attachIn[0] ? "in" : ""}`}><ImageIc />Panoramic x-ray</div>
                        <div className={`dform-att ${stage1.attachIn[1] ? "in" : ""}`}><File />Clinical notes</div>
                        <div className={`dform-att ${stage1.attachIn[2] ? "in" : ""}`}><CreditCard />Insurance card</div>
                      </div>
                    </div>
                    <div className={`dform-cta ${stage1.ctaReady ? "ready" : ""}`}>
                      Send referral
                      <ArrowRight width={14} height={14} />
                    </div>
                  </div>
                </div>

                {/* Stage 2: TRACK */}
                <Stage2 active={stage === 1} />

                {/* Stage 3: TALK */}
                <Stage3 active={stage === 2} />

                {/* Stage 4: CLOSE */}
                <Stage4 active={stage === 3} />
              </div>
            </div>
          </div>
        </div>

        <div className="demo-benefits">
          <div className="dben reveal">
            <div className="dben-ic"><Clock width={18} height={18} stroke="#3E8EFF" /></div>
            <h4>90 seconds</h4>
            <p>Average time to send a referral</p>
          </div>
          <div className="dben reveal" style={{ transitionDelay: ".1s" }}>
            <div className="dben-ic"><Bolt width={18} height={18} stroke="#FFA940" /></div>
            <h4>Real-time tracking</h4>
            <p>Status updates the moment they change</p>
          </div>
          <div className="dben reveal" style={{ transitionDelay: ".2s" }}>
            <div className="dben-ic"><ChatBubble width={18} height={18} stroke="#3DBD6B" /></div>
            <h4>Encrypted chat</h4>
            <p>HIPAA compliant messaging in context</p>
          </div>
          <div className="dben reveal" style={{ transitionDelay: ".3s" }}>
            <div className="dben-ic"><Check width={18} height={18} stroke="#90F0C5" /></div>
            <h4>Closed loop</h4>
            <p>Outcomes flow back automatically</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stage2({ active }: { active: boolean }) {
  const [shown, setShown] = useState<boolean[]>([false, false, false, false]);
  useEffect(() => {
    if (!active) {
      setShown([false, false, false, false]);
      return;
    }
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    [0, 1, 2, 3].forEach((i) => {
      timeouts.push(setTimeout(() => {
        setShown((arr) => {
          const next = [...arr];
          next[i] = true;
          return next;
        });
      }, i * 150));
    });
    return () => timeouts.forEach(clearTimeout);
  }, [active]);

  const items = [
    { av: "a1", initials: "MS", name: "Maria Santos", meta: "→ Dr. Lee, Orthodontics", pill: "active", pillLabel: "Active", time: "2 min ago", activeBorder: true },
    { av: "a2", initials: "JR", name: "James Reyes", meta: "→ Dr. Adams, Endodontics", pill: "sent", pillLabel: "Sent", time: "14 min ago" },
    { av: "a3", initials: "EP", name: "Emma Park", meta: "→ Dr. Singh, Periodontics", pill: "done", pillLabel: "Complete", time: "1 hour ago" },
    { av: "a4", initials: "DK", name: "David Kim", meta: "→ Dr. Murphy, Oral surgery", pill: "done", pillLabel: "Complete", time: "Yesterday" },
  ];

  return (
    <div className={`demo-stage ${active ? "live" : ""}`}>
      <div className="demo-stage-title">Your referrals</div>
      <div className="demo-stage-sub">Every case, every status, one place</div>
      <div className="demo-cards">
        {items.map((it, i) => (
          <div key={it.name} className={`dcard ${shown[i] ? "in" : ""} ${it.activeBorder ? "active" : ""}`}>
            <div className={`dcard-av ${it.av}`}>{it.initials}</div>
            <div className="dcard-info">
              <div className="nm">{it.name}</div>
              <div className="meta">{it.meta}</div>
            </div>
            <span className={`dcard-pill ${it.pill}`}>{it.pillLabel}</span>
            <span className="dcard-time">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stage3({ active }: { active: boolean }) {
  const [m1, setM1] = useState(false);
  const [m2, setM2] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [m4, setM4] = useState(false);

  useEffect(() => {
    if (!active) {
      setM1(false); setM2(false); setShowTyping(false); setM4(false);
      return;
    }
    const ts: ReturnType<typeof setTimeout>[] = [];
    ts.push(setTimeout(() => setM1(true), 200));
    ts.push(setTimeout(() => setM2(true), 1100));
    ts.push(setTimeout(() => setShowTyping(true), 1900));
    ts.push(setTimeout(() => { setShowTyping(false); setM4(true); }, 3100));
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className={`demo-stage ${active ? "live" : ""}`}>
      <div className="demo-stage-title">Case messages</div>
      <div className="demo-stage-sub">Encrypted chat threaded to Maria Santos</div>
      <div className="demo-chat">
        <div className={`dchat-msg me ${m1 ? "in" : ""}`}>
          <div className="dchat-av me">CH</div>
          <div>
            <div className="dchat-bubble">Records look good. Anything else you need from us?</div>
            <div className="dchat-time" style={{ textAlign: "right" }}>9:14 am</div>
          </div>
        </div>
        <div className={`dchat-msg them ${m2 ? "in" : ""}`}>
          <div className="dchat-av them">LE</div>
          <div>
            <div className="dchat-bubble">Got everything. Booking her in for Tuesday morning.</div>
            <div className="dchat-time">9:16 am</div>
          </div>
        </div>
        {showTyping && (
          <div className="dchat-msg them in">
            <div className="dchat-av them">LE</div>
            <div>
              <div className="dchat-typing"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div className={`dchat-msg them ${m4 ? "in" : ""}`}>
          <div className="dchat-av them">LE</div>
          <div>
            <div className="dchat-bubble">Sending appointment confirmation now. Thanks Dr. Chen.</div>
            <div className="dchat-time">9:17 am</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stage4({ active }: { active: boolean }) {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  useEffect(() => {
    if (!active) { setS1(false); setS2(false); setS3(false); return; }
    const ts: ReturnType<typeof setTimeout>[] = [];
    ts.push(setTimeout(() => setS1(true), 200));
    ts.push(setTimeout(() => setS2(true), 700));
    ts.push(setTimeout(() => setS3(true), 1300));
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className={`demo-stage ${active ? "live" : ""}`}>
      <div className="demo-stage-title">Outcome received</div>
      <div className="demo-stage-sub">Post-op report from Dr. Lee, automatically</div>
      <div className="demo-outcome">
        <div className={`doc-success ${s1 ? "in" : ""}`}>
          <div className="doc-check">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h4>Treatment complete</h4>
            <p>Maria Santos returned to you for follow-up</p>
          </div>
        </div>
        <div className={`doc-report ${s2 ? "in" : ""}`}>
          <div className="doc-report-head">
            <h5>Post-op report · Dr. Lee</h5>
            <span className="badge">Signed</span>
          </div>
          <div className="doc-line w90" />
          <div className="doc-line w70" />
          <div className="doc-line w55" />
        </div>
        <div className={`doc-stats ${s3 ? "in" : ""}`}>
          <div className="doc-stat"><div className="big">0</div><div className="lbl">Phone calls</div></div>
          <div className="doc-stat"><div className="big">0</div><div className="lbl">Faxes</div></div>
          <div className="doc-stat"><div className="big">100%</div><div className="lbl">Tracked</div></div>
        </div>
      </div>
    </div>
  );
}
