import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CaseLink collects, uses, and protects personal information when you visit caselink.net or use the CaseLink referral and clinical communication platform.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy · CaseLink",
    description:
      "How CaseLink collects, uses, and protects personal information when you visit caselink.net or use the CaseLink platform.",
    url: "https://www.caselink.net/privacy",
    type: "website",
  },
};

const sections = [
  { id: "scope", n: "1", title: "Scope of This Policy" },
  { id: "collect", n: "2", title: "Information We Collect" },
  { id: "use", n: "3", title: "How We Use Information" },
  { id: "share", n: "4", title: "How We Share Information" },
  { id: "phi", n: "5", title: "PHI and HIPAA" },
  { id: "cookies", n: "6", title: "Cookies and Your Choices" },
  { id: "security", n: "7", title: "Data Security" },
  { id: "retention", n: "8", title: "Data Retention" },
  { id: "rights", n: "9", title: "Your Rights and Choices" },
  { id: "children", n: "10", title: "Children’s Privacy" },
  { id: "international", n: "11", title: "International Users" },
  { id: "thirdparty", n: "12", title: "Third-Party Links" },
  { id: "changes", n: "13", title: "Changes to This Policy" },
  { id: "contact", n: "14", title: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="privacy-hero">
        <div className="privacy-hero-bg" />
        <div className="wrap privacy-hero-inner">
          <span className="eyebrow">Legal</span>
          <h1>Privacy Policy</h1>
          <p className="lead">
            How CaseLink collects, uses, and protects personal information when
            you visit caselink.net or use the CaseLink referral and clinical
            communication platform.
          </p>
          <p className="privacy-effective">
            <strong>Effective:</strong> 18 May 2026
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
              CaseLink, Inc. (
              <strong>
                &ldquo;CaseLink,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
              </strong>{" "}
              or <strong>&ldquo;our&rdquo;</strong>) respects your privacy. This
              Privacy Policy (the <strong>&ldquo;Policy&rdquo;</strong>)
              explains how we collect, use, share, and protect personal
              information when you visit our website at{" "}
              <a href="https://www.caselink.net">caselink.net</a> (the{" "}
              <strong>&ldquo;Website&rdquo;</strong>) or use the CaseLink
              referral and clinical communication platform (the{" "}
              <strong>&ldquo;Service&rdquo;</strong>).
            </p>

            <section id="scope" className="privacy-section">
              <h2>1. Scope of This Policy</h2>
              <p>This Policy applies to:</p>
              <ul>
                <li>visitors to the Website,</li>
                <li>account holders and authorized users of the Service, and</li>
                <li>
                  individuals who contact us, sign up for marketing
                  communications, or request a demonstration of the Service.
                </li>
              </ul>
              <p>This Policy does not apply to:</p>
              <ul>
                <li>
                  Protected Health Information (
                  <strong>&ldquo;PHI&rdquo;</strong>) that CaseLink processes on
                  behalf of a dental practice or other Covered Entity. PHI is
                  governed by the Health Insurance Portability and
                  Accountability Act of 1996, as amended (
                  <strong>&ldquo;HIPAA&rdquo;</strong>), and by the Business
                  Associate Agreement (the <strong>&ldquo;BAA&rdquo;</strong>)
                  executed between CaseLink and the Covered Entity. In the
                  event of any conflict between this Policy and an executed BAA
                  with respect to PHI, the BAA prevails.
                </li>
                <li>
                  third-party websites or services linked from the Website or
                  the Service. Their practices are governed by their own
                  policies.
                </li>
              </ul>
            </section>

            <section id="collect" className="privacy-section">
              <h2>2. Information We Collect</h2>

              <h3>2.1 Information You Provide</h3>
              <p>
                We collect information you submit directly to us, including:
              </p>
              <ul>
                <li>
                  <strong>Account and practice information.</strong> Name, email
                  address, phone number, practice name, role, specialty,
                  National Provider Identifier (NPI), Tax ID, and practice
                  address.
                </li>
                <li>
                  <strong>Marketing and contact information.</strong>{" "}
                  Information submitted through demonstration requests, contact
                  forms, newsletter signups, or similar interactions on the
                  Website.
                </li>
                <li>
                  <strong>Payment information.</strong> When you subscribe to a
                  paid plan, billing details such as billing address and the
                  last four digits of your card. Full payment card information
                  is collected and processed by our payment processor and is
                  not stored by CaseLink.
                </li>
                <li>
                  <strong>Support and communications.</strong> Information you
                  provide when you contact our support team or correspond with
                  us.
                </li>
              </ul>

              <h3>2.2 Information Collected Automatically</h3>
              <p>
                When you visit the Website or use the Service, we and our
                service providers may automatically collect:
              </p>
              <ul>
                <li>
                  <strong>Device and connection data.</strong> IP address,
                  browser type, operating system, device identifiers, and
                  language settings.
                </li>
                <li>
                  <strong>Usage data.</strong> Pages viewed, features used,
                  links clicked, time spent in the Service, and referral
                  source.
                </li>
                <li>
                  <strong>Log data.</strong> Access logs, error logs, and
                  similar records used for security and troubleshooting.
                </li>
              </ul>

              <h3>2.3 Cookies and Similar Technologies</h3>
              <p>
                We use cookies and similar technologies to operate and improve
                the Website and the Service. See{" "}
                <a href="#cookies">Section 6</a> for details and your choices.
              </p>

              <h3>2.4 Information from Third Parties</h3>
              <p>We may receive information about you from third parties, including:</p>
              <ul>
                <li>practices that invite you to join the Service,</li>
                <li>
                  marketing partners, conference organizers, or list providers,
                  where permitted by law, and
                </li>
                <li>
                  public sources, such as state dental board directories or NPI
                  registry data.
                </li>
              </ul>
            </section>

            <section id="use" className="privacy-section">
              <h2>3. How We Use Information</h2>
              <p>We use personal information to:</p>
              <ul>
                <li>provide and operate the Website and the Service,</li>
                <li>create, manage, and authenticate accounts,</li>
                <li>process payments and manage subscriptions,</li>
                <li>
                  send transactional messages such as referral notifications,
                  account confirmations, and password resets,
                </li>
                <li>provide customer support and respond to inquiries,</li>
                <li>
                  improve the Service, including measuring usage and developing
                  new features,
                </li>
                <li>
                  send marketing communications about CaseLink, where permitted
                  by law and subject to your preferences,
                </li>
                <li>
                  detect, investigate, and prevent fraud, abuse, security
                  incidents, and violations of any applicable terms,
                </li>
                <li>
                  comply with applicable law and respond to lawful requests,
                  and
                </li>
                <li>
                  generate de-identified or aggregated information, which is no
                  longer personal information and may be used for any lawful
                  purpose.
                </li>
              </ul>
              <div className="privacy-callout">
                <strong>What we do not do.</strong> CaseLink does not sell
                personal information. CaseLink does not use personal
                information for advertising directed at individuals on the
                basis of their health information.
              </div>
            </section>

            <section id="share" className="privacy-section">
              <h2>4. How We Share Information</h2>
              <p>We share information only as described in this Section.</p>

              <h3>4.1 Within Your Practice and Network</h3>
              <p>
                When you use the Service to send a referral, share a case, or
                send a message, the information you submit is shared with the
                recipient practice and its authorized users. Your practice
                profile, including name, specialty, and address, may also
                appear in the Service&rsquo;s network directory unless you opt
                out in Practice Settings.
              </p>

              <h3>4.2 With Service Providers and Subprocessors</h3>
              <p>
                We share information with third-party service providers that
                help us operate the Website and the Service, including
                providers of:
              </p>
              <ul>
                <li>cloud hosting and platform infrastructure,</li>
                <li>email and notification delivery,</li>
                <li>payment processing,</li>
                <li>customer support tooling,</li>
                <li>analytics and product monitoring, and</li>
                <li>security and fraud prevention.</li>
              </ul>
              <p>
                These providers act on our instructions and are bound by
                confidentiality and security obligations. A current list of
                subprocessors with access to PHI is available on request and
                is referenced in the BAA where one has been executed.
              </p>

              <h3>4.3 For Legal Reasons</h3>
              <p>
                We may disclose information when we believe in good faith that
                disclosure is necessary to:
              </p>
              <ul>
                <li>
                  comply with applicable law, court orders, subpoenas, or other
                  legal process,
                </li>
                <li>
                  protect the rights, property, or safety of CaseLink, our
                  users, or others,
                </li>
                <li>enforce our agreements or this Policy, or</li>
                <li>investigate suspected fraud or violations.</li>
              </ul>

              <h3>4.4 Business Transfers</h3>
              <p>
                If CaseLink is involved in a merger, acquisition, financing, or
                sale of all or part of its business, personal information may
                be transferred as part of that transaction. We will notify
                affected users where required by law.
              </p>

              <h3>4.5 With Your Direction</h3>
              <p>
                We share information at your direction or with your consent,
                including when you choose to integrate the Service with a
                third-party tool.
              </p>
            </section>

            <section id="phi" className="privacy-section">
              <h2>5. PHI and HIPAA</h2>
              <p>
                Where the Service is used to transmit Protected Health
                Information, that information is handled in accordance with
                HIPAA and the BAA between CaseLink and the Covered Entity.
                This Policy does not modify the protections, rights, or
                remedies available under HIPAA or any executed BAA. Patient
                rights regarding PHI, including access, amendment, and
                accounting of disclosures, are addressed through the Covered
                Entity in accordance with HIPAA.
              </p>
            </section>

            <section id="cookies" className="privacy-section">
              <h2>6. Cookies and Your Choices</h2>
              <p>
                The Website and the Service use the following categories of
                cookies and similar technologies:
              </p>
              <ul>
                <li>
                  <strong>Strictly necessary.</strong> Required for
                  authentication, session management, and core functionality,
                  including the hCaptcha challenge cookies that protect our
                  contact form from automated abuse. These cannot be disabled.
                </li>
                <li>
                  <strong>Embedded scheduling.</strong> When you open the
                  Calendly booking widget on the Website, Calendly sets cookies
                  to manage your scheduling session. Calendly&rsquo;s privacy
                  practices apply to those cookies.
                </li>
                <li>
                  <strong>Analytics.</strong> We use Google Analytics 4 to
                  understand how the Website is used so we can improve it. Google
                  sets cookies to measure traffic and engagement, and
                  Google&rsquo;s privacy practices apply to those cookies. You
                  can opt out using Google&rsquo;s available tools.
                </li>
                <li>
                  <strong>Preference.</strong> Remember your settings, such as
                  language or interface preferences.
                </li>
              </ul>
              <p>
                You may control cookies through your browser settings,
                including blocking or deleting cookies. Disabling certain
                cookies may affect the functionality of the Website or the
                Service. Where we use analytics from a third-party provider,
                you may also opt out through that provider&rsquo;s tools where
                available.
              </p>
            </section>

            <section id="security" className="privacy-section">
              <h2>7. Data Security</h2>
              <p>
                We implement administrative, physical, and technical safeguards
                designed to protect personal information, including:
              </p>
              <ul>
                <li>Transport Layer Security for data in transit,</li>
                <li>industry-standard encryption for data at rest,</li>
                <li>role-based access controls,</li>
                <li>activity logging and audit trails, and</li>
                <li>workforce training on privacy and security.</li>
              </ul>
              <p>
                No method of transmission or storage is completely secure. We
                cannot guarantee absolute security but we work continuously to
                maintain and improve our safeguards.
              </p>
            </section>

            <section id="retention" className="privacy-section">
              <h2>8. Data Retention</h2>
              <p>
                We retain personal information for as long as needed to provide
                the Website and the Service, comply with our legal obligations,
                resolve disputes, and enforce our agreements. Retention periods
                depend on the type of information and the context, including:
              </p>
              <ul>
                <li>
                  account information is retained for the duration of your
                  account plus a reasonable period afterward for legal,
                  accounting, and security purposes,
                </li>
                <li>
                  Customer Content held in the Service is retained for the
                  term of your subscription. After termination, the retention
                  and deletion rules in any executed BAA apply,
                </li>
                <li>
                  marketing information is retained until you opt out or for a
                  reasonable period after your last interaction, and
                </li>
                <li>
                  log and security data is retained for limited periods
                  consistent with our security needs.
                </li>
              </ul>
            </section>

            <section id="rights" className="privacy-section">
              <h2>9. Your Rights and Choices</h2>

              <h3>9.1 Access and Update</h3>
              <p>
                You can access and update most account information directly in
                the Service. If you need help, contact us at{" "}
                <a href="mailto:support@caselink.net">support@caselink.net</a>.
              </p>

              <h3>9.2 Marketing Communications</h3>
              <p>
                You may opt out of marketing emails by clicking the unsubscribe
                link in any marketing message or by contacting us. Transactional
                and account-related messages, such as referral notifications
                and security alerts, will continue.
              </p>

              <h3>9.3 Cookie Choices</h3>
              <p>
                You can control cookies as described in{" "}
                <a href="#cookies">Section 6</a>.
              </p>

              <h3>9.4 State Privacy Rights</h3>
              <p>
                Residents of certain U.S. states may have additional rights
                under state privacy laws, including the right to:
              </p>
              <ul>
                <li>
                  know what personal information we have collected about them,
                </li>
                <li>
                  request correction or deletion of personal information,
                </li>
                <li>
                  opt out of the sale or sharing of personal information
                  (CaseLink does not sell personal information),
                </li>
                <li>limit the use of sensitive personal information, and</li>
                <li>
                  not be discriminated against for exercising these rights.
                </li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a href="mailto:support@caselink.net">support@caselink.net</a>.
                We may need to verify your identity before completing your
                request. You may also designate an authorized agent to act on
                your behalf where permitted by law.
              </p>

              <h3>9.5 HIPAA Rights</h3>
              <p>
                Rights regarding PHI are addressed through your healthcare
                provider in accordance with HIPAA and the BAA between CaseLink
                and the Covered Entity.
              </p>
            </section>

            <section id="children" className="privacy-section">
              <h2>10. Children&rsquo;s Privacy</h2>
              <p>
                The Website and the Service are intended for licensed dental
                professionals and their authorized staff. We do not knowingly
                collect personal information from children under 13. If we
                learn that we have collected personal information from a child
                under 13 without verified parental consent, we will delete it
                promptly. PHI relating to pediatric patients that is processed
                on behalf of a dental practice is handled under HIPAA and the
                BAA.
              </p>
            </section>

            <section id="international" className="privacy-section">
              <h2>11. International Users</h2>
              <p>
                CaseLink is based in the United States. If you access the
                Website or the Service from outside the United States, your
                information will be transferred to, processed, and stored in
                the United States. By using the Website or the Service, you
                understand that your information may be processed in the
                United States, which may have data protection laws that differ
                from those in your country.
              </p>
            </section>

            <section id="thirdparty" className="privacy-section">
              <h2>12. Third-Party Links</h2>
              <p>
                The Website and the Service may contain links to third-party
                websites or integrate with third-party services. We are not
                responsible for the privacy practices of those third parties.
                We encourage you to review the privacy policies of any
                third-party services before providing them with personal
                information.
              </p>
            </section>

            <section id="changes" className="privacy-section">
              <h2>13. Changes to This Policy</h2>
              <p>
                We may update this Policy from time to time. If a change is
                material, we will provide reasonable notice by posting an
                updated effective date at the top of this Policy and, where
                appropriate, by notifying you through the Website, the
                Service, or by email. Your continued use of the Website or the
                Service after the effective date constitutes acceptance of the
                updated Policy.
              </p>
            </section>

            <section id="contact" className="privacy-section">
              <h2>14. Contact Us</h2>
              <p>
                If you have questions about this Policy or our privacy
                practices, contact us at:
              </p>
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
