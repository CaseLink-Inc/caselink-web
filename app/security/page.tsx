import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How CaseLink protects Protected Health Information: encryption, access controls, audit logging, MFA, workforce training, and risk management.",
  alternates: { canonical: "/security" },
  openGraph: {
    title: "Security · CaseLink",
    description:
      "How CaseLink protects Protected Health Information: encryption, access controls, audit logging, MFA, workforce training, and risk management.",
    url: "https://www.caselink.net/security",
    type: "website",
  },
};

const sections = [
  { id: "encryption", n: "1", title: "Encryption" },
  { id: "access", n: "2", title: "Access Controls" },
  { id: "authentication", n: "3", title: "Authentication and Session Management" },
  { id: "audit", n: "4", title: "Audit Logging" },
  { id: "workforce", n: "5", title: "Workforce Training and Sanctions" },
  { id: "risk", n: "6", title: "Risk Management" },
  { id: "infrastructure", n: "7", title: "Infrastructure and Physical Security" },
  { id: "subprocessors", n: "8", title: "Subprocessors" },
  { id: "incident-response", n: "9", title: "Incident Response and Breach Notification" },
  { id: "continuity", n: "10", title: "Backup and Business Continuity" },
  { id: "disclosure", n: "11", title: "Responsible Disclosure" },
  { id: "legal-note", n: "12", title: "How This Page Fits" },
  { id: "contact", n: "13", title: "Questions" },
];

export default function SecurityPage() {
  return (
    <>
      <section className="privacy-hero">
        <div className="privacy-hero-bg" />
        <div className="wrap privacy-hero-inner">
          <span className="eyebrow">Trust</span>
          <h1>Security at CaseLink</h1>
          <p className="lead">
            The administrative, physical, and technical safeguards CaseLink
            uses to protect Protected Health Information. This page is
            incorporated by reference into every executed Business Associate
            Agreement.
          </p>
          <p className="privacy-effective">
            <strong>Last Updated:</strong> July 3, 2026
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
              CaseLink is built for the exchange of Protected Health
              Information (<strong>&ldquo;PHI&rdquo;</strong>) between dental
              providers. That places clear obligations on us under the Health
              Insurance Portability and Accountability Act of 1996, as amended
              (<strong>&ldquo;HIPAA&rdquo;</strong>). This page describes the
              safeguards we maintain to meet those obligations, in accordance
              with 45 CFR 164.308, 164.310, 164.312, and 164.316.
            </p>
            <p>
              The controls described here are the baseline commitments
              incorporated by reference into every CaseLink{" "}
              <a href="/baa">Business Associate Agreement</a>. We will provide
              reasonable advance notice of any material reduction in scope.
            </p>

            <section id="encryption" className="privacy-section">
              <h2>Encryption</h2>
              <h3>In transit</h3>
              <p>
                All connections to the CaseLink Service use Transport Layer
                Security (TLS) 1.2 or higher. TLS 1.3 is in use across
                supported endpoints as of the date above. Certificates are
                managed through automated renewal and are audited for expiry.
              </p>
              <h3>At rest</h3>
              <p>
                Stored electronic PHI (ePHI) is encrypted using AES-256 or an
                equivalent industry-standard algorithm. Encryption keys are
                managed in a dedicated key management service, are separated
                from the data they protect, and are rotated on a defined
                schedule.
              </p>
            </section>

            <section id="access" className="privacy-section">
              <h2>Access Controls</h2>
              <p>
                Access to PHI within the Service is governed by role-based
                access controls (RBAC). Users are granted the minimum access
                necessary for their role within their practice, consistent with
                the HIPAA minimum necessary standard at 45 CFR 164.502(b).
              </p>
              <p>
                CaseLink workforce members may access Covered Entity PHI only
                where required for support, security, or service operations,
                and only under documented controls that include:
              </p>
              <ul>
                <li>role-based permissions tied to job function,</li>
                <li>
                  separation of production and non-production environments,
                </li>
                <li>time-bounded, purpose-scoped access for support tasks, and</li>
                <li>logging of every access event.</li>
              </ul>
            </section>

            <section id="authentication" className="privacy-section">
              <h2>Authentication and Session Management</h2>
              <p>
                User accounts require strong authentication credentials.{" "}
                <strong>
                  Multi-factor authentication (MFA) is required for all accounts
                  with access to PHI
                </strong>{" "}
                and is enforced through technical controls. PHI access is not
                permitted for any account with MFA disabled.
              </p>
              <p>
                Sessions expire after a period of inactivity. Password resets
                and MFA changes trigger security notifications to the account
                owner.
              </p>
            </section>

            <section id="audit" className="privacy-section">
              <h2>Audit Logging</h2>
              <p>
                The Service maintains a record of access and material actions
                taken on PHI, including:
              </p>
              <ul>
                <li>the user performing the action,</li>
                <li>the resource acted upon,</li>
                <li>the action taken,</li>
                <li>the timestamp, and</li>
                <li>the source IP address.</li>
              </ul>
              <p>
                Audit records are retained for at least{" "}
                <strong>six (6) years</strong>, consistent with the HIPAA
                documentation retention requirement at 45 CFR 164.316(b)(2).
                Audit records are protected against unauthorized modification.
              </p>
            </section>

            <section id="workforce" className="privacy-section">
              <h2>Workforce Training and Sanctions</h2>
              <p>
                All CaseLink workforce members with access to PHI complete
                HIPAA Privacy and Security training at hire and on a recurring
                basis. Training records are retained. CaseLink maintains a
                sanctions policy for workforce members who fail to comply with
                our privacy and security policies, consistent with 45 CFR
                164.308(a)(1)(ii)(C).
              </p>
            </section>

            <section id="risk" className="privacy-section">
              <h2>Risk Management</h2>
              <p>
                CaseLink conducts periodic risk assessments and documents
                corrective actions, consistent with 45 CFR 164.308(a)(1)(ii)(A)
                and (B). Risk assessments cover:
              </p>
              <ul>
                <li>
                  threats to the confidentiality, integrity, and availability of
                  ePHI,
                </li>
                <li>
                  vulnerabilities in systems that create, receive, maintain, or
                  transmit ePHI,
                </li>
                <li>
                  the likelihood and potential impact of identified risks, and
                </li>
                <li>remediation plans and their status.</li>
              </ul>
            </section>

            <section id="infrastructure" className="privacy-section">
              <h2>Infrastructure and Physical Security</h2>
              <p>
                CaseLink runs on cloud infrastructure and platform providers
                whose data centers maintain physical security controls that
                meet or exceed industry standards, including access controls,
                environmental monitoring, and continuous physical surveillance.
                Physical safeguards for the underlying facilities are the
                responsibility of those providers under their own
                certifications and audits.
              </p>
              <p>Data processed by CaseLink is stored in the United States.</p>
            </section>

            <section id="subprocessors" className="privacy-section">
              <h2>Subprocessors</h2>
              <p>
                CaseLink uses third-party service providers to operate the
                Service. Any subprocessor with access to PHI is contractually
                bound to substantially the same restrictions and requirements
                that apply to CaseLink under an executed Business Associate
                Agreement, consistent with 45 CFR 164.502(e)(1)(ii) and
                164.308(b)(2).
              </p>
              <p>
                The current list of subprocessor categories with access to PHI
                is maintained at{" "}
                <a href="/subprocessors">caselink.net/subprocessors</a>.
              </p>
            </section>

            <section id="incident-response" className="privacy-section">
              <h2>Incident Response and Breach Notification</h2>
              <p>
                CaseLink maintains a documented incident response process. In
                the event of a confirmed Security Incident involving ePHI or a
                Breach of Unsecured PHI:
              </p>
              <ul>
                <li>we investigate promptly,</li>
                <li>take reasonable steps to contain and mitigate impact,</li>
                <li>
                  notify affected Covered Entities without unreasonable delay,
                  and no later than the timelines set out in the applicable
                  Business Associate Agreement, and
                </li>
                <li>
                  cooperate reasonably in any required investigation and
                  notifications.
                </li>
              </ul>
              <p>
                Consistent with 45 CFR 164.410, unsuccessful Security Incidents
                that do not result in unauthorized access, use, disclosure,
                modification, or destruction of ePHI (such as pings, denied
                login attempts, and similar routine events) are addressed
                through automated safeguards and monitoring, and do not trigger
                individual notifications.
              </p>
            </section>

            <section id="continuity" className="privacy-section">
              <h2>Backup and Business Continuity</h2>
              <p>
                CaseLink maintains backups of Customer Content on a defined
                schedule. Backups are encrypted at rest and are subject to the
                same access controls as production data. CaseLink maintains and
                periodically tests contingency plans covering data backup,
                disaster recovery, and emergency mode operations, consistent
                with 45 CFR 164.308(a)(7).
              </p>
            </section>

            <section id="disclosure" className="privacy-section">
              <h2>Responsible Disclosure</h2>
              <p>
                If you believe you have found a security vulnerability in the
                CaseLink Service, please report it to us so we can investigate
                and remediate. We appreciate coordinated disclosure and will
                work in good faith with researchers acting in good faith.
              </p>
              <div className="privacy-contact-card">
                <p className="name">Security contact</p>
                <p>
                  <a href="mailto:support@caselink.net">
                    support@caselink.net
                  </a>
                </p>
                <p>
                  Please include a description of the issue, steps to reproduce,
                  and your contact information. Do not access or modify data
                  belonging to others, and do not test in production against
                  real PHI.
                </p>
              </div>
            </section>

            <section id="legal-note" className="privacy-section">
              <h2>How This Page Fits</h2>
              <p>
                <strong>Incorporated by reference.</strong> This Security page
                is incorporated by reference into every executed CaseLink
                Business Associate Agreement. The controls described here are
                the baseline commitments CaseLink makes to Covered Entities.
                Material reductions in scope will be communicated with
                reasonable advance notice. Nothing on this page modifies the
                rights, obligations, or remedies set out in the BAA or under
                HIPAA.
              </p>
            </section>

            <section id="contact" className="privacy-section">
              <h2>Questions</h2>
              <p>
                Compliance, procurement, or diligence questions can be sent to
                our team.
              </p>
              <div className="privacy-contact-card">
                <p className="name">CaseLink, Inc.</p>
                <p>124 S Wise St, Arlington, VA 22204</p>
                <p>
                  <a href="mailto:support@caselink.net">
                    support@caselink.net
                  </a>
                </p>
              </div>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
