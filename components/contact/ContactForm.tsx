"use client";

import { useState } from "react";
import Script from "next/script";
import { ArrowRight, Check } from "@/components/icons";

const roles = [
  { value: "gp", label: "General dentist", small: "Send referrals" },
  { value: "specialist", label: "Specialist", small: "Receive referrals" },
  { value: "dso", label: "DSO or group", small: "Multi-location" },
];

// Web3Forms public API. Submissions are POSTed with a domain-locked access
// key; Web3Forms forwards them to the email tied to that key
// (support@caselink.net). The key is safe to ship in client code because
// Web3Forms only accepts submissions originating from the configured
// domain. Setting NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in Vercel will override
// this fallback if you ever rotate the key without a code change.
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ??
  "fbc67ad1-a32f-4d04-a870-82d7b6e2084d";

export default function ContactForm() {
  const [role, setRole] = useState("gp");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errored, setErrored] = useState(false);
  const [captchaMissing, setCaptchaMissing] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrored(false);
    setCaptchaMissing(false);

    // Build a plain object from the form, plus the Web3Forms control fields.
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    fd.forEach((v, k) => {
      payload[k] = typeof v === "string" ? v : v.name;
    });
    payload.access_key = WEB3FORMS_ACCESS_KEY;
    payload.subject = "New CaseLink contact form submission";
    payload.from_name = "CaseLink";

    // Unchecked checkboxes are absent from FormData. Record consent
    // explicitly either way so every submission carries a clear trail.
    payload.transactional_consent = payload.transactional_consent ? "yes" : "no";
    payload.marketing_consent = payload.marketing_consent ? "yes" : "no";

    // hCaptcha (enabled in the Web3Forms dashboard) injects an `h-captcha-response`
    // hidden input once the challenge is solved. If the user submits before solving
    // it, Web3Forms would reject the request with a generic 400, so we catch it
    // client-side and surface a clearer message.
    if (!payload["h-captcha-response"]) {
      setCaptchaMissing(true);
      setSubmitting(false);
      return;
    }
    // When you hit Reply in Gmail, it should go to the person who submitted
    // the form rather than to Web3Forms. We pull their email straight from
    // the form payload.
    if (payload.email) {
      payload.replyto = payload.email;
    }

    // If the access key hasn't been configured yet, fall straight to the
    // mailto fallback so the user still has a way to reach us.
    if (!WEB3FORMS_ACCESS_KEY) {
      const body = Object.entries(payload)
        .filter(([k]) => !["access_key", "subject", "from_name"].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      window.location.href = `mailto:support@caselink.net?subject=${encodeURIComponent(
        "New CaseLink contact form submission"
      )}&body=${encodeURIComponent(body)}`;
      setSubmitted(true);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      const ok = res.ok && data && (data.success === true || data.success === "true");
      setSubmitted(true);
      if (!ok) setErrored(true);
    } catch {
      setSubmitted(true);
      setErrored(true);
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        window.scrollTo({ top: Math.max(0, window.scrollY - 80), behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <div className="contact-form-wrap reveal">
      <h3>Tell us about your practice</h3>
      <p className="sub">We will get back to you within one business day. Most replies happen the same afternoon.</p>

      {submitted ? (
        <div className="form-success show">
          <Check width={20} height={20} stroke="#3DBD6B" strokeWidth={2.5} />
          <div>
            <strong>Thanks. Your message is in.</strong>
            <div style={{ fontSize: 13, color: "#4A5250", marginTop: 2 }}>
              We will be in touch shortly.
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First name<span className="req">*</span></label>
              <input className="form-input" name="firstName" required />
            </div>
            <div className="form-group">
              <label>Last name<span className="req">*</span></label>
              <input className="form-input" name="lastName" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email<span className="req">*</span></label>
              <input className="form-input" type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" type="tel" name="phone" />
            </div>
          </div>
          <div className="form-group">
            <label>Practice name<span className="req">*</span></label>
            <input className="form-input" name="practice" required />
          </div>
          <div className="form-group">
            <label>I am a<span className="req">*</span></label>
            <div className="radio-grid">
              {roles.map((r) => (
                <label key={r.value} className={`radio-card ${role === r.value ? "on" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                  />
                  <span>{r.label}</span>
                  <small>{r.small}</small>
                </label>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Practice size</label>
              <select className="form-select" name="size" defaultValue="Solo practitioner">
                <option>Solo practitioner</option>
                <option>2 to 5 providers</option>
                <option>6 to 15 providers</option>
                <option>16 or more</option>
              </select>
            </div>
            <div className="form-group">
              <label>What can we help with</label>
              <select className="form-select" name="topic" defaultValue="Book a 15 minute walkthrough">
                <option>Book a 15 minute walkthrough</option>
                <option>Get pricing details</option>
                <option>Pilot program inquiry</option>
                <option>Integration questions</option>
                <option>Investor inquiry</option>
                <option>Press or partnership</option>
                <option>Something else</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Anything we should know</label>
            <textarea
              className="form-textarea"
              name="message"
              placeholder="Tell us about your referral workflow today. The more context, the better we can help."
            />
          </div>
          <div className="optin-block">
            <p className="optin-intro">
              Choose how CaseLink can reach you. You can change this any time
              in Settings.
            </p>
            <label className="check-row optin-row">
              <input type="checkbox" name="transactional_consent" value="yes" />
              <span>
                <strong className="optin-label">
                  Account and referral notifications
                </strong>
                <span className="optin-fine">
                  By checking this box, I consent to receive transactional
                  messages from CaseLink, Inc. related to my account or the
                  services I have requested. These messages may include
                  referral notifications, case updates, and account
                  notifications among others. Message frequency may vary.
                  Message &amp; Data rates may apply. Reply HELP for help or
                  STOP to opt-out.
                </span>
              </span>
            </label>
            <label className="check-row optin-row">
              <input type="checkbox" name="marketing_consent" value="yes" />
              <span>
                <strong className="optin-label">Product news and offers</strong>
                <span className="optin-fine">
                  By checking this box, I consent to receive marketing and
                  promotional messages from CaseLink, Inc., including new
                  product updates, special offers, and discounts among others.
                  Consent is not a condition of purchase. Message frequency
                  may vary. Message &amp; Data rates may apply. Reply HELP for
                  help or STOP to opt-out.
                </span>
              </span>
            </label>
            <p className="optin-foot">
              See our <a href="/privacy">Privacy Policy</a> and{" "}
              <a href="/terms">Terms</a>. You can unsubscribe from marketing
              email any time using the link in the footer.
            </p>
          </div>
          <div className="h-captcha" data-captcha="true" />
          {captchaMissing && (
            <p
              role="alert"
              style={{
                color: "#B4231A",
                fontSize: 13,
                marginTop: -4,
                marginBottom: 4,
              }}
            >
              Please complete the captcha before sending.
            </p>
          )}
          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Sending" : "Send message"}
            {!submitting && <ArrowRight width={16} height={16} />}
          </button>
        </form>
      )}
      <Script
        src="https://web3forms.com/client/script.js"
        strategy="afterInteractive"
        async
        defer
      />
    </div>
  );
}
