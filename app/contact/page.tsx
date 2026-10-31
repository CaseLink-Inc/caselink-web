import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/contact/ContactForm";
import BookCallButton from "@/components/BookCallButton";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: { absolute: "Contact CaseLink · Talk to our team" },
  description:
    "Book a 15-minute walkthrough, send a message, or call us. CaseLink is based in Washington, DC, and replies to most enquiries the same business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact CaseLink",
    description:
      "Book a 15-minute walkthrough or send the team a message. We reply same day.",
    url: "https://www.caselink.net/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "Contact", path: "/contact" }]} />
      <section className="contact-hero">
        {/* Sub-page hero: G10 ground with a brand visual masked in from the
            right, which is what the website card set specifies. Without it
            the right half of this hero was empty gradient. */}
        <Image
          className="contact-art"
          src="/ds/brand-satin-curve.png"
          alt=""
          width={1122}
          height={1402}
          aria-hidden="true"
          priority
        />
        <div className="wrap contact-hero-inner">
          <span className="eyebrow">Get in touch</span>
          <h1>
            Let us show you how<br />
            <span className="cl-landing">CaseLink fits your practice.</span>
          </h1>
          <p className="lead">
            A fifteen minute call is enough to see whether CaseLink is right
            for you. We will walk you through a real referral, answer your
            questions, and let you decide from there.
          </p>
        </div>
      </section>

      <section className="contact-main">
        <div className="wrap contact-grid">
          <ContactForm />
          <div className="contact-info">
            {/* The sticky element has to be a child: the grid item itself
                stretches to the row, so it has no range of its own to
                travel in. */}
            <div className="contact-info-stick">
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Image src="/ds/icons/caselink-email.svg" alt="An envelope in frosted glass: email the CaseLink team." width={44} height={44} /></div>
                <div><h4>Email</h4><div className="info-sub">For everything</div></div>
              </div>
              <p>The fastest way to reach a real person on our team.</p>
              <a href="mailto:support@caselink.net">support@CaseLink.net</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Image src="/ds/icons/caselink-call.svg" alt="A handset in frosted glass: call the CaseLink team." width={44} height={44} /></div>
                <div><h4>Phone</h4><div className="info-sub">Office hours, ET</div></div>
              </div>
              <p>Prefer a call. Reach our team Monday through Friday, 9 to 5.</p>
              <a href="tel:+17035543449">+1 (703) 554-3449</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Image src="/ds/icons/caselink-appointment.svg" alt="A calendar in frosted glass: book a CaseLink overview call." width={44} height={44} /></div>
                <div><h4>CaseLink Overview</h4><div className="info-sub">15 minutes, online</div></div>
              </div>
              <p>Pick a time that works for you. We will walk through a real referral end to end.</p>
              <BookCallButton className="info-card-link">Pick a time</BookCallButton>
            </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
