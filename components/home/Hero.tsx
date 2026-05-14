import Link from "next/link";
import { ArrowRight, Image as ImageIc, ChatBubble, Check, File, CreditCard } from "@/components/icons";
import { SIGNUP_URL } from "@/lib/urls";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="wrap hero-inner">
        <div>
          <span className="hero-tag">
            <span className="pulse-dot" />
            Built in Washington, DC
          </span>
          <h1>
            <span className="line"><span>Your link to</span></span>
            <span className="line"><span className="grad-text">better patient care.</span></span>
          </h1>
          <p className="sub">
            A secure referral and collaboration network for general dentists
            and specialists. Send cases, share records, and track every
            outcome in one workspace your team will actually use.
          </p>
          <div className="hero-cta">
            <a href={SIGNUP_URL} className="btn btn-primary">
              Get started free
              <ArrowRight width={14} height={14} />
            </a>
            <Link href="/#how" className="btn btn-ghost">See how it works</Link>
          </div>
          <div className="hero-meta">
            <div className="hero-meta-item"><strong>HIPAA</strong>compliant by design</div>
            <div className="hero-meta-item"><strong>Under 2 min</strong>to send a referral</div>
            <div className="hero-meta-item"><strong>Free</strong>for general dentists</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="float-chip fc1">
            <div className="ic"><ImageIc width={16} height={16} stroke="#3E8EFF" /></div>
            <div className="txt"><strong>X-ray attached</strong><span>Panoramic, 2.4 MB</span></div>
          </div>
          <div className="float-chip fc2">
            <div className="ic"><ChatBubble width={16} height={16} stroke="#FFA940" /></div>
            <div className="txt"><strong>Dr. Lee replied</strong><span>Reviewing the case</span></div>
          </div>
          <div className="float-chip fc3">
            <div className="ic"><File width={16} height={16} stroke="#3DBD6B" /></div>
            <div className="txt"><strong>Case update</strong><span>Treatment notes from Dr. Lee</span></div>
          </div>
          <div className="case-card">
            <div className="cc-header">
              <div className="cc-header-left">
                <div className="cc-dots"><span /><span /><span /></div>
                <span className="cc-title">Active referral</span>
              </div>
              <span className="cc-id">CL-0247</span>
            </div>
            <div className="cc-body">
              <div className="cc-patient">
                <div className="cc-avatar">MS</div>
                <div>
                  <div className="cc-patient-name">Maria Santos</div>
                  <div className="cc-patient-meta">DOB Apr 1989 · Orthodontic consult</div>
                </div>
              </div>
              <div className="cc-flow">
                <div className="cc-pract"><div className="lbl">From</div><div className="nm">Dr. Chen, GP</div></div>
                <div className="cc-arrow">
                  <ArrowRight width={14} height={14} strokeLinecap="round" />
                </div>
                <div className="cc-pract"><div className="lbl">To</div><div className="nm">Dr. Lee, Ortho</div></div>
              </div>
              <div className="cc-attach">
                <div className="cc-att"><File />Pano x-ray</div>
                <div className="cc-att"><File />Clinical notes</div>
                <div className="cc-att"><CreditCard />Insurance</div>
              </div>
              <div className="cc-status">
                <span className="cc-status-pill">In progress</span>
                <span className="cc-time">Updated 2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
