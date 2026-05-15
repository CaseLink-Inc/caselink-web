import ContactForm from "@/components/contact/ContactForm";
import { Mail, Phone, Calendar } from "@/components/icons";
import BookCallButton from "@/components/BookCallButton";

export default function ContactPage() {
  return (
    <>
      <section className="contact-hero">
        <div className="contact-hero-bg" />
        <div className="wrap contact-hero-inner">
          <span className="eyebrow">Get in touch</span>
          <h1>
            Let us show you how<br />
            <span className="grad-text">CaseLink fits your practice.</span>
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
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Mail width={20} height={20} stroke="#3E8EFF" /></div>
                <div><h4>Email</h4><div className="info-sub">For everything</div></div>
              </div>
              <p>The fastest way to reach a real person on our team.</p>
              <a href="mailto:support@caselink.net">support@CaseLink.net</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Phone width={20} height={20} stroke="#FFA940" /></div>
                <div><h4>Phone</h4><div className="info-sub">Office hours, ET</div></div>
              </div>
              <p>Prefer a call. Reach our team Monday through Friday, 9 to 5.</p>
              <a href="tel:+17035543449">+1 (703) 554-3449</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Calendar width={20} height={20} stroke="#3DBD6B" /></div>
                <div><h4>CaseLink Overview</h4><div className="info-sub">15 minutes, online</div></div>
              </div>
              <p>Pick a time that works for you. We will walk through a real referral end to end.</p>
              <BookCallButton className="info-card-link">Pick a time</BookCallButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
