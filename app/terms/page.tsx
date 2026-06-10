import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of the CaseLink website and the CaseLink referral and case-collaboration platform for dental practices.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service · CaseLink",
    description:
      "The terms that govern use of the CaseLink website and the CaseLink referral and case-collaboration platform for dental practices.",
    url: "https://www.caselink.net/terms",
    type: "website",
  },
};

const sections = [
  { id: "agreement", n: "1", title: "Agreement to These Terms" },
  { id: "service", n: "2", title: "The Service" },
  { id: "accounts", n: "3", title: "Eligibility and Accounts" },
  { id: "fees", n: "4", title: "Plans, Fees, and Billing" },
  { id: "phi", n: "5", title: "PHI and HIPAA" },
  { id: "acceptable", n: "6", title: "Acceptable Use" },
  { id: "content", n: "7", title: "Your Content and Data" },
  { id: "ip", n: "8", title: "Intellectual Property" },
  { id: "thirdparty", n: "9", title: "Third-Party Services" },
  { id: "termination", n: "10", title: "Term, Suspension, and Termination" },
  { id: "disclaimers", n: "11", title: "Disclaimers" },
  { id: "liability", n: "12", title: "Limitation of Liability" },
  { id: "indemnification", n: "13", title: "Indemnification" },
  { id: "law", n: "14", title: "Governing Law and Disputes" },
  { id: "changes", n: "15", title: "Changes to These Terms" },
  { id: "contact", n: "16", title: "Contact Us" },
];

export default function TermsPage() {
  return (
    <>
      <section className="privacy-hero">
        <div className="privacy-hero-bg" />
        <div className="wrap privacy-hero-inner">
          <span className="eyebrow">Legal</span>
          <h1>Terms of Service</h1>
          <p className="lead">
            The terms that govern your use of the CaseLink website and the
            CaseLink referral and case-collaboration platform.
          </p>
          <p className="privacy-effective">
            <strong>Effective:</strong> 11 June 2026
          </p>
        </div>
      </section>

      <section className="privacy-main">
        <div className="wrap privacy-inner">
          <nav className="privacy-toc" aria-label="Table of contents">
            <div className="privacy-toc-card">
              <p className="privacy-toc-label">On this page</p>
              <ol className="privacy-toc-list">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <span className="privacy-toc-num">{s.n}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="privacy-body">
            <p>
              These Terms of Service (the <strong>&ldquo;Terms&rdquo;</strong>)
              are an agreement between CaseLink, Inc. (
              <strong>
                &ldquo;CaseLink,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
              </strong>{" "}
              or <strong>&ldquo;our&rdquo;</strong>) and you. They govern your
              use of our website at{" "}
              <a href="https://www.caselink.net">caselink.net</a> (the{" "}
              <strong>&ldquo;Website&rdquo;</strong>) and the CaseLink referral
              and case-collaboration platform available at{" "}
              <a
                href="https://app.caselink.net"
                target="_blank"
                rel="noopener noreferrer"
              >
                app.caselink.net
              </a>{" "}
              (the <strong>&ldquo;Service&rdquo;</strong>).
            </p>

            <section id="agreement" className="privacy-section">
              <h2>1. Agreement to These Terms</h2>
              <p>
                By creating an account, accessing the Service, or using the
                Website, you agree to these Terms and to our{" "}
                <a href="/privacy">Privacy Policy</a>. If you use the Service
                on behalf of a dental practice or other organization, you
                represent that you have authority to bind that organization,
                and <strong>&ldquo;you&rdquo;</strong> includes that
                organization. If you do not agree to these Terms, do not use
                the Website or the Service.
              </p>
            </section>

            <section id="service" className="privacy-section">
              <h2>2. The Service</h2>
              <p>
                CaseLink is a referral and case-collaboration platform for
                dental practices. The Service lets general dentists send
                structured referrals to specialists, lets both offices share
                files and messages about a case, and shows both offices the
                same referral status from creation through completion.
              </p>
              <p>For clarity, the Service is not:</p>
              <ul>
                <li>
                  <strong>A practice management system.</strong> The Service
                  works alongside systems such as Dentrix, Eaglesoft, and Open
                  Dental and does not replace scheduling, charting, or billing
                  software.
                </li>
                <li>
                  <strong>A provider of dental or medical care.</strong> The
                  Service is a communication and coordination tool. All
                  clinical decisions, diagnoses, treatment plans, and patient
                  relationships remain solely with the dental professionals
                  using the Service. CaseLink does not practice dentistry and
                  does not provide medical or dental advice.
                </li>
                <li>
                  <strong>A guarantee of outcomes.</strong> CaseLink does not
                  guarantee that any referral will result in an appointment,
                  treatment, or any particular clinical or business outcome.
                </li>
              </ul>
            </section>

            <section id="accounts" className="privacy-section">
              <h2>3. Eligibility and Accounts</h2>
              <p>
                The Service is intended for licensed dental professionals and
                the staff of dental practices, acting in a professional
                capacity. The Service is not directed to patients or
                consumers. You must be at least 18 years old to use the
                Service.
              </p>
              <p>You agree to:</p>
              <ul>
                <li>
                  provide accurate, current, and complete information when
                  creating an account and keep it up to date,
                </li>
                <li>
                  keep your login credentials confidential and not share
                  individual accounts between people,
                </li>
                <li>
                  ensure that every person who uses the Service under your
                  practice account is authorized to do so and complies with
                  these Terms, and
                </li>
                <li>
                  notify us promptly at{" "}
                  <a href="mailto:support@caselink.net">
                    support@caselink.net
                  </a>{" "}
                  if you suspect unauthorized access to your account.
                </li>
              </ul>
            </section>

            <section id="fees" className="privacy-section">
              <h2>4. Plans, Fees, and Billing</h2>
              <p>The Service is offered on the following plans:</p>
              <ul>
                <li>
                  <strong>General dentist plan.</strong> Free. No payment
                  method is required.
                </li>
                <li>
                  <strong>Specialist plan.</strong> A paid subscription billed
                  monthly, or annually at a discount, at the prices published
                  on the Website at the time of purchase.
                </li>
                <li>
                  <strong>Enterprise plans.</strong> Custom pricing for DSOs
                  and multi-location groups, as agreed in a separate order
                  form.
                </li>
              </ul>
              <p>
                Paid subscriptions renew automatically at the end of each
                billing period unless cancelled before renewal. Fees are
                charged to the payment method on file. Except where required
                by law or expressly stated otherwise, fees are non-refundable.
                Prices may change with reasonable advance notice, and changes
                take effect at your next renewal. You are responsible for any
                applicable taxes. If a payment fails and is not corrected
                within a reasonable period after notice, we may downgrade or
                suspend the affected account.
              </p>
            </section>

            <section id="phi" className="privacy-section">
              <h2>5. PHI and HIPAA</h2>
              <p>
                The Service is designed to handle Protected Health Information
                (<strong>&ldquo;PHI&rdquo;</strong>) in connection with
                referrals between dental practices. Where CaseLink acts as a
                business associate of a practice that is a Covered Entity
                under HIPAA, the parties&rsquo; obligations with respect to
                PHI are governed by the Business Associate Agreement (the{" "}
                <strong>&ldquo;BAA&rdquo;</strong>) executed between CaseLink
                and that practice. Business Associate Agreements are available
                to subscribed specialist practices. In the event of a conflict
                between these Terms and an executed BAA with respect to PHI,
                the BAA prevails.
              </p>
              <p>You agree to:</p>
              <ul>
                <li>
                  use the Service to share patient information only for
                  treatment, referral, and care-coordination purposes
                  permitted by law,
                </li>
                <li>
                  limit the PHI you submit to what is reasonably necessary for
                  the referral or case at hand, and
                </li>
                <li>
                  comply with your own obligations under HIPAA and other
                  applicable privacy laws, including obtaining any required
                  patient authorizations.
                </li>
              </ul>
            </section>

            <section id="acceptable" className="privacy-section">
              <h2>6. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>
                  use the Service in violation of any law or professional
                  regulation,
                </li>
                <li>
                  submit information about patients you are not treating,
                  referring, or receiving in a professional capacity,
                </li>
                <li>
                  impersonate another person or practice, or misrepresent your
                  affiliation or credentials,
                </li>
                <li>
                  upload malicious code, attempt to probe or breach the
                  Service&rsquo;s security, or access data belonging to other
                  practices without authorization,
                </li>
                <li>
                  scrape, harvest, or bulk-export data from the Service except
                  through features we provide for that purpose,
                </li>
                <li>
                  reverse engineer, copy, resell, or sublicense the Service,
                  or use it to build a competing product, or
                </li>
                <li>
                  use the Service to send spam or unsolicited commercial
                  communications.
                </li>
              </ul>
              <p>
                We may investigate suspected violations and may remove content
                or suspend accounts where reasonably necessary to protect the
                Service, its users, or patients.
              </p>
            </section>

            <section id="content" className="privacy-section">
              <h2>7. Your Content and Data</h2>
              <p>
                You and your practice retain all rights to the information you
                submit to the Service, including referral details, clinical
                notes, images, and messages (
                <strong>&ldquo;Customer Content&rdquo;</strong>). You grant
                CaseLink a limited license to host, process, transmit, and
                display Customer Content solely to provide, secure, support,
                and improve the Service, consistent with our{" "}
                <a href="/privacy">Privacy Policy</a> and, where applicable,
                an executed BAA.
              </p>
              <p>
                You are responsible for the accuracy and lawfulness of the
                Customer Content you submit, and you represent that you have
                the rights and permissions needed to share it through the
                Service.
              </p>
            </section>

            <section id="ip" className="privacy-section">
              <h2>8. Intellectual Property</h2>
              <p>
                The Service, the Website, and all related software, designs,
                logos, and content (other than Customer Content) are owned by
                CaseLink or its licensors and are protected by intellectual
                property laws. We grant you a limited, non-exclusive,
                non-transferable right to access and use the Service for your
                practice&rsquo;s internal business purposes during your
                subscription. No other rights are granted. The CaseLink name
                and logo may not be used without our prior written consent.
              </p>
              <p>
                If you send us feedback or suggestions about the Service, we
                may use them without restriction or obligation to you.
              </p>
            </section>

            <section id="thirdparty" className="privacy-section">
              <h2>9. Third-Party Services</h2>
              <p>
                The Website and the Service may link to or interoperate with
                third-party websites and services, such as scheduling tools or
                form providers. Those services are governed by their own terms
                and policies, and CaseLink is not responsible for them. Your
                practice management system remains entirely separate from the
                Service, and CaseLink is not responsible for its operation.
              </p>
            </section>

            <section id="termination" className="privacy-section">
              <h2>10. Term, Suspension, and Termination</h2>
              <p>
                These Terms apply from your first use of the Website or the
                Service and continue while you use them. You may stop using
                the Service or cancel your subscription at any time.
                Cancellation takes effect at the end of the current billing
                period.
              </p>
              <p>
                We may suspend or terminate access to the Service if you
                materially breach these Terms, if required by law, or if
                continued provision would create a security or legal risk. We
                will give reasonable notice where practicable. Following
                termination, we will provide a reasonable opportunity to
                export your Customer Content, subject to our legal retention
                obligations and, where applicable, the BAA. Sections of these
                Terms that by their nature should survive termination do
                survive, including Sections 7, 8, and 11 through 14.
              </p>
            </section>

            <section id="disclaimers" className="privacy-section">
              <h2>11. Disclaimers</h2>
              <p>
                The Website and the Service are provided on an &ldquo;as
                is&rdquo; and &ldquo;as available&rdquo; basis. To the fullest
                extent permitted by law, CaseLink disclaims all warranties,
                express or implied, including merchantability, fitness for a
                particular purpose, and non-infringement. We do not warrant
                that the Service will be uninterrupted, error-free, or secure,
                or that it will meet your requirements. The Service supports
                professional communication between practices. It does not
                replace clinical judgment, and CaseLink is not responsible for
                the care decisions of any provider using the Service.
              </p>
            </section>

            <section id="liability" className="privacy-section">
              <h2>12. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, CaseLink will not be
                liable for indirect, incidental, special, consequential, or
                punitive damages, or for lost profits, lost revenue, or lost
                data, arising out of or related to the Website, the Service,
                or these Terms.
              </p>
              <p>
                To the fullest extent permitted by law, CaseLink&rsquo;s total
                liability arising out of or related to these Terms will not
                exceed the amounts you paid to CaseLink for the Service in the
                twelve months before the event giving rise to the claim, or
                one hundred US dollars if you have not paid any fees. Nothing
                in these Terms limits liability that cannot be limited by law.
              </p>
            </section>

            <section id="indemnification" className="privacy-section">
              <h2>13. Indemnification</h2>
              <p>
                You will defend and indemnify CaseLink against third-party
                claims arising from your Customer Content, your violation of
                these Terms, your violation of applicable law or professional
                regulation, or the clinical services you provide, except to
                the extent the claim results from CaseLink&rsquo;s own breach
                of these Terms or applicable law.
              </p>
            </section>

            <section id="law" className="privacy-section">
              <h2>14. Governing Law and Disputes</h2>
              <p>
                These Terms are governed by the laws of the Commonwealth of
                Virginia, without regard to its conflict of laws rules. The
                state and federal courts located in Arlington County, Virginia
                have exclusive jurisdiction over disputes arising out of or
                relating to these Terms, and each party consents to venue
                there. Each party waives any right to a jury trial to the
                extent permitted by law.
              </p>
            </section>

            <section id="changes" className="privacy-section">
              <h2>15. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. If a change is
                material, we will provide reasonable notice by posting an
                updated effective date at the top of this page and, where
                appropriate, by notifying you through the Website, the
                Service, or by email. Your continued use of the Website or the
                Service after the effective date constitutes acceptance of the
                updated Terms.
              </p>
            </section>

            <section id="contact" className="privacy-section">
              <h2>16. Contact Us</h2>
              <p>Questions about these Terms can be sent to:</p>
              <div className="privacy-contact-card">
                <p className="name">CaseLink, Inc.</p>
                <p>124 S Wise St</p>
                <p>Arlington, VA 22204</p>
                <p>
                  <a href="mailto:support@caselink.net">
                    support@caselink.net
                  </a>
                </p>
                <p>
                  <a href="https://www.caselink.net">www.caselink.net</a>
                </p>
              </div>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
