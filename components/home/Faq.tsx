import { Plus } from "@/components/icons";

export const faqs = [
  {
    q: "Is CaseLink HIPAA compliant?",
    a: "Yes. CaseLink is HIPAA compliant from the foundation, with end-to-end encryption on every referral, message, and file, audit logs on every action, role-based access controls, and automatic session timeouts. We sign a Business Associate Agreement on signup.",
  },
  {
    q: "How is CaseLink different from sending referrals by fax or email?",
    a: "Fax and email lose visibility the moment they leave your office. Roughly 30% of dental referrals never reach treatment, often without either practice knowing. CaseLink keeps every referral in one workspace with full clinical context, real-time status, and outcome reports that move in minutes instead of days.",
  },
  {
    q: "How much does CaseLink cost?",
    a: "The general dentist plan is free with unlimited referrals, secure file sharing, HIPAA compliance, and real-time updates. The specialist plan is $299 per month, or $269 per month on yearly billing. DSO and multi-location pricing is custom.",
  },
  {
    q: "Can general dentists use CaseLink for free?",
    a: "Yes. The general dentist plan is free and includes unlimited referrals, secure file sharing, encrypted messaging, and real-time updates. There is no setup fee and no contract.",
  },
  {
    q: "What clinical information can I attach to a referral?",
    a: "Patient details, x-rays, insurance information, treatment notes, and supporting attachments. The specialist receives each case with the clinical context already in place, so they can start work without chasing missing details.",
  },
  {
    q: "Do you sign a Business Associate Agreement?",
    a: "Yes. CaseLink signs a BAA on signup with every practice that holds Protected Health Information, in accordance with HIPAA.",
  },
];

export default function Faq() {
  return (
    <section className="faq-sec" id="faq">
      <div className="wrap">
        <div className="faq-head reveal">
          <span className="eyebrow">FAQ</span>
          <h2>
            The questions we hear most,
            <br />
            <span className="grad-text">answered.</span>
          </h2>
          <p className="faq-lede">
            Short answers to what comes up first. If yours is not here, we
            are one email away.
          </p>
        </div>

        <div className="faq-list reveal">
          {faqs.map((f, i) => (
            <details key={f.q} className="faq-item" open={i === 0}>
              <summary>
                <span className="faq-q">{f.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <Plus width={18} height={18} stroke="#1A1F1E" strokeWidth={2} />
                </span>
              </summary>
              <div className="faq-answer">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
