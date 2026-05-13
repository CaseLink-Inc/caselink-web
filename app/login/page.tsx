import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function LoginPage() {
  return (
    <section className="contact-hero" style={{ paddingBottom: 40 }}>
      <div className="contact-hero-bg" />
      <div className="wrap" style={{ position: "relative", maxWidth: 460, margin: "0 auto" }}>
        <div className="contact-form-wrap" style={{ marginTop: 64 }}>
          <span className="eyebrow">Welcome back</span>
          <h3 style={{ marginTop: 18 }}>Sign in to CaseLink</h3>
          <p className="sub">Use the email associated with your practice.</p>
          <form action="/dashboard">
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" defaultValue="dr.chen@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" defaultValue="demo" required />
            </div>
            <button type="submit" className="form-submit">
              Continue
              <ArrowRight width={16} height={16} />
            </button>
          </form>
          <p style={{ fontSize: 13, color: "#7A8886", textAlign: "center", marginTop: 18 }}>
            New here?{" "}
            <Link href="/signup" style={{ color: "#3E8EFF", fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
          <p style={{ fontSize: 11, color: "#7A8886", textAlign: "center", marginTop: 8 }}>
            This is a demo. No credentials are checked.
          </p>
        </div>
      </div>
    </section>
  );
}
