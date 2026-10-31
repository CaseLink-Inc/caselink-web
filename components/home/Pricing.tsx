"use client";

import Link from "next/link";
import { useState } from "react";
import { SIGNUP_URL } from "@/lib/urls";

/**
 * Pricing on G11 Deep sea, the system's all-blue dark ground.
 *
 * This is the page's one dark section, which is how the system wants dark
 * used: the occasional counterpart to light, not a second theme. The three
 * plans stay solid white cards, because the card rules keep glass for what
 * floats and give lists solid white, and white on Deep sea is what makes
 * the plans the subject rather than the ground.
 *
 * The statement sits left, not centred: Deep sea is a diagonal sweep, and
 * the alignment rule centres type only over symmetric light.
 *
 * Copy is unchanged. The specialist price still switches with the billing
 * period, and the numbers here must match lib's pricing page copy.
 */
export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const specPrice = annual ? "$269" : "$299";
  const specBill = annual
    ? "Yearly billing, save $358"
    : "Monthly billing, cancel anytime";

  return (
    <section
      id="pricing"
      className={`pricing-sec cl-grain cl-on-dark${annual ? " is-annual" : ""}`}
    >
      {/* Yearly swaps the ground from G11 Deep sea to G5 Night, whose mint
          dawn rises from the bottom right. Both are locked dark grounds, so
          the saving reads as a change in the light rather than a badge. It
          is a second layer cross-fading over the first, because a
          background-image cannot transition between two gradients. */}
      <span className="pricing-night" aria-hidden="true" />
      <div className="wrap">
        <div className="pricing-head reveal">
          <span className="eyebrow">Pricing</span>
          <h2>
            Flexible plans for
            <br />
            {/* Both classes: --dark only swaps the gradient, and without
                .cl-landing there is no background-clip, so it paints a
                solid block behind the words instead of filling them. */}
            <span className="cl-landing cl-landing--dark">
              every kind of practice.
            </span>
          </h2>
          <p>
            General dentists send referrals for free. Specialists pay a flat
            monthly fee that is typically covered by a single new case per
            month.
          </p>
          {/* Segmented control: filled track, the selection carrying the
              fill and the rim. Outline never sits on outline. */}
          <div className="bill-toggle" role="group" aria-label="Billing period">
            <button
              type="button"
              className={!annual ? "is-on" : ""}
              aria-pressed={!annual}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={annual ? "is-on" : ""}
              aria-pressed={annual}
              onClick={() => setAnnual(true)}
            >
              Yearly<span className="save">10% off, save $358</span>
            </button>
          </div>
        </div>

        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="price-plan-name">General dentist</div>
            <h3>Free</h3>
            <p className="desc">
              Built for GPs who want full visibility into every referral they
              send.
            </p>
            <div className="price-amt">
              <span className="num">$0</span>
              <span className="per">per month</span>
            </div>
            <div className="price-bill">No card required</div>
            <ul className="price-features">
              <li>Unlimited referrals</li>
              <li>Secure file sharing</li>
              <li>Real-time updates</li>
              <li>HIPAA compliance</li>
            </ul>
            <a
              href={SIGNUP_URL}
              className="price-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get started
            </a>
          </div>

          {/* The popular card is the step 7 highlight: a 2px Seamless rim on
              white and a flat badge. It used to be a near-black panel, which
              on this ground would have sunk into it. */}
          <div
            className="price-card featured reveal"
            style={{ transitionDelay: ".1s" }}
          >
            <span className="price-tag-badge">Most popular</span>
            <div className="price-plan-name">Specialist</div>
            <h3>For receiving practices</h3>
            <p className="desc">
              Triage, accept, and close referrals from any GP on the network.
            </p>
            <div className="price-amt">
              <span className="num">{specPrice}</span>
              <span className="per">per month</span>
            </div>
            <div className="price-bill">{specBill}</div>
            <ul className="price-features">
              <li>Everything in the General Dentist plan</li>
              <li>Referral inbox</li>
              <li>Analytics dashboard</li>
              <li>Case timelines</li>
              <li>Scheduling integration coming soon</li>
            </ul>
            <a
              href={SIGNUP_URL}
              className="price-cta price-cta--primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start 1 month free
            </a>
          </div>

          <div
            className="price-card reveal"
            style={{ transitionDelay: ".2s" }}
          >
            <div className="price-plan-name">DSO and multi-location</div>
            <h3>For groups and DSOs</h3>
            <p className="desc">
              Multi-location support with the controls a larger organization
              needs.
            </p>
            <div className="price-amt">
              <span className="num">Custom</span>
            </div>
            <div className="price-bill">Annual contract</div>
            <ul className="price-features">
              <li>Team permissions</li>
              <li>Multi-location analytics</li>
              <li>API access</li>
              <li>Dedicated success manager</li>
            </ul>
            <Link href="/contact" className="price-cta">
              Talk to sales
            </Link>
          </div>
        </div>

        <p className="pricing-note">
          All plans include HIPAA compliance, BAA on signup, and unlimited case
          storage.
        </p>
      </div>
    </section>
  );
}
