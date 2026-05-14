import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function SignupPage() {
  return (
    <section className="contact-hero" style={{ paddingBottom: 40 }}>
      <div className="contact-hero-bg" />
      <div className="wrap" style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
        <div className="contact-form-wrap" style={{ marginTop: 64 }}>
          <span className="eyebrow">Join CaseLink</span>
          <h3 style={{ marginTop: 18 }}>Create your practice account</h3>
          <p className="sub">Free for general dentists. One month free for specialists.</p>
          <form action="/dashboard">
            <div className="form-row">
              <div className="form-group">
                <label>First name</label>
                <input className="form-input" required />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input className="form-input" required />
              </div>
            </div>
            <div className="form-group">
              <label>Work email</label>
              <input className="form-input" type="email" required />
            </div>
            <div className="form-group">
              <label>Practice name</label>
              <input className="form-input" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" required />
            </div>
            <button type="submit" className="form-submit">
              Create account
              <ArrowRight width={16} height={16} />
            </button>
          </form>
          <p style={{ fontSize: 13, color: "#7A8886", textAlign: "center", marginTop: 18 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#3E8EFF", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
          <p style={{ fontSize: 11, color: "#7A8886", textAlign: "center", marginTop: 8 }}>
            This is a demo. No real account is created.
          </p>
        </div>
      </div>
    </section>
  );
}
