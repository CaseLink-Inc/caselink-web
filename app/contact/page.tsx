import ContactForm from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, Calendar } from "@/components/icons";

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
              <a href="mailto:hello@caselink.net">hello@caselink.net</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Phone width={20} height={20} stroke="#FFA940" /></div>
                <div><h4>Phone</h4><div className="info-sub">Office hours, ET</div></div>
              </div>
              <p>Prefer a call. Reach our team Monday through Friday, 9 to 5.</p>
              <a href="tel:+12025551234">+1 (202) 555-1234</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><MapPin width={20} height={20} stroke="#3DBD6B" /></div>
                <div><h4>Office</h4><div className="info-sub">Washington, DC</div></div>
              </div>
              <p>Based in DC and happy to meet in person if you are local.</p>
              <a>1100 H Street NW<br />Washington, DC 20005</a>
            </div>
            <div className="info-card">
              <div className="info-card-head">
                <div className="info-card-icon"><Calendar width={20} height={20} stroke="#3DBD6B" /></div>
                <div><h4>Demo</h4><div className="info-sub">15 minutes, online</div></div>
              </div>
              <p>Pick a time that works for you. We will walk through a real referral end to end.</p>
              <a href="#">Pick a time</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
