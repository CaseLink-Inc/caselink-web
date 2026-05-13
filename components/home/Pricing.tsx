"use client";

import Link from "next/link";
import { useState } from "react";

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const specPrice = annual ? "$239" : "$299";

  return (
    <section id="pricing" className="pricing-sec">
      <div className="wrap">
        <div className="pricing-head reveal">
          <span className="eyebrow">Pricing</span>
          <h2>Simple plans for<br />every kind of practice.</h2>
          <p>
            General dentists send referrals for free. Specialists pay a flat
            monthly fee that is typically covered by a single new case per
            month.
          </p>
          <div className="bill-toggle">
            <button className={!annual ? "on" : ""} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? "on" : ""} onClick={() => setAnnual(true)}>
              Annual<span className="save">Save 20%</span>
            </button>
          </div>
        </div>
        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="price-plan-name">General dentist</div>
            <h3>Free</h3>
            <p className="desc">Built for GPs who want full visibility into every referral they send.</p>
            <div className="price-amt"><span className="num">$0</span><span className="per">per month</span></div>
            <div className="price-bill">No card required</div>
            <ul className="price-features">
              <li>Unlimited outbound referrals</li>
              <li>Real-time case tracking</li>
              <li>Secure messaging with specialists</li>
              <li>Up to 3 staff users</li>
              <li>Standard email support</li>
            </ul>
            <Link href="/contact" className="price-cta">Get started</Link>
          </div>
          <div className="price-card featured reveal" style={{ transitionDelay: ".1s" }}>
            <span className="price-tag-badge">Most popular</span>
            <div className="price-plan-name">Specialist</div>
            <h3>For receiving practices</h3>
            <p className="desc">Triage, accept, and close referrals from any GP on the network.</p>
            <div className="price-amt"><span className="num">{specPrice}</span><span className="per">per month</span></div>
            <div className="price-bill">
              {annual ? "$2,870 per year, two months free" : "Monthly billing, cancel anytime"}
            </div>
            <ul className="price-features">
              <li>Unlimited inbound referrals</li>
              <li>Smart routing and triage</li>
              <li>Advanced analytics and reporting</li>
              <li>Unlimited staff users</li>
              <li>Custom practice branding</li>
              <li>Priority support</li>
            </ul>
            <Link href="/contact" className="price-cta">Start 14-day trial</Link>
          </div>
          <div className="price-card reveal" style={{ transitionDelay: ".2s" }}>
            <div className="price-plan-name">Enterprise</div>
            <h3>For groups and DSOs</h3>
            <p className="desc">Multi-location support with the controls a larger organization needs.</p>
            <div className="price-amt"><span className="num">Custom</span></div>
            <div className="price-bill">Annual contract</div>
            <ul className="price-features">
              <li>Multi-location and DSO support</li>
              <li>Single sign-on and SAML</li>
              <li>Dentrix and Open Dental integration</li>
              <li>Dedicated account manager</li>
              <li>Service level agreement</li>
              <li>Volume pricing</li>
            </ul>
            <Link href="/contact" className="price-cta">Talk to sales</Link>
          </div>
        </div>
        <p className="pricing-note">
          All plans include HIPAA compliance, BAA on signup, and unlimited case storage.
        </p>
      </div>
    </section>
  );
}
