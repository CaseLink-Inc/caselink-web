"use client";

import Link from "next/link";
import { useState } from "react";
import { SIGNUP_URL } from "@/lib/urls";

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const specPrice = annual ? "$269" : "$299";
  const specBill = annual
    ? "Yearly billing, save $358"
    : "Monthly billing, cancel anytime";

  return (
    <section id="pricing" className="pricing-sec">
      <div className="wrap">
        <div className="pricing-head reveal">
          <span className="eyebrow">Pricing</span>
          <h2>Flexible plans for<br />every kind of practice.</h2>
          <p>
            General dentists send referrals for free. Specialists pay a flat
            monthly fee that is typically covered by a single new case per
            month.
          </p>
          <div className="bill-toggle">
            <button className={!annual ? "on" : ""} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? "on" : ""} onClick={() => setAnnual(true)}>
              Yearly<span className="save">10% off, save $358</span>
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
              <li>Unlimited referrals</li>
              <li>Secure file sharing</li>
              <li>Real-time updates</li>
              <li>HIPAA compliance</li>
            </ul>
            <a href={SIGNUP_URL} className="price-cta">Get started</a>
          </div>
          <div className="price-card featured reveal" style={{ transitionDelay: ".1s" }}>
            <span className="price-tag-badge">Most popular</span>
            <div className="price-plan-name">Specialist</div>
            <h3>For receiving practices</h3>
            <p className="desc">Triage, accept, and close referrals from any GP on the network.</p>
            <div className="price-amt"><span className="num">{specPrice}</span><span className="per">per month</span></div>
            <div className="price-bill">{specBill}</div>
            <ul className="price-features">
              <li>Everything in the General Dentist plan</li>
              <li>Referral inbox</li>
              <li>Analytics dashboard</li>
              <li>Case timelines</li>
              <li>Scheduling integration coming soon</li>
            </ul>
            <a href={SIGNUP_URL} className="price-cta">Start 14-day trial</a>
          </div>
          <div className="price-card reveal" style={{ transitionDelay: ".2s" }}>
            <div className="price-plan-name">DSO and multi-location</div>
            <h3>For groups and DSOs</h3>
            <p className="desc">Multi-location support with the controls a larger organization needs.</p>
            <div className="price-amt"><span className="num">Custom</span></div>
            <div className="price-bill">Annual contract</div>
            <ul className="price-features">
              <li>Team permissions</li>
              <li>Multi-location analytics</li>
              <li>API access</li>
              <li>Dedicated success manager</li>
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
