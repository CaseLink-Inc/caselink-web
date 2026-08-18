import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subprocessors",
  description:
    "Third-party service providers CaseLink uses to operate the platform, and how we ensure they meet HIPAA and Business Associate obligations.",
  alternates: { canonical: "/subprocessors" },
  openGraph: {
    title: "Subprocessors · CaseLink",
    description:
      "Third-party service providers CaseLink uses to operate the platform, and how we ensure they meet HIPAA and Business Associate obligations.",
    url: "https://www.caselink.net/subprocessors",
    type: "website",
  },
};

const sections = [
  { id: "commitments", n: "1", title: "Our Commitments" },
  { id: "with-phi", n: "2", title: "Subprocessors with PHI Access" },
  { id: "without-phi", n: "3", title: "Subprocessors without PHI Access" },
  { id: "changes", n: "4", title: "Changes to This List" },
  { id: "data-region", n: "5", title: "Where PHI Is Processed" },
  { id: "legal-note", n: "6", title: "How This Page Fits" },
  { id: "contact", n: "7", title: "Questions" },
];

const withPhi = [
  {
    category: "Cloud Infrastructure and Hosting",
    purpose:
      "Compute, storage, database, and network services that host the CaseLink Service and Customer Content.",
    region: "United States",
    baa: "Yes",
  },
  {
    category: "Application Development Platform",
    purpose:
      "Low-code application platform used to build and operate the CaseLink Service.",
    region: "United States",
    baa: "Yes",
  },
  {
    category: "Transactional Email and Notifications",
    purpose:
      "Delivery of referral notifications, account confirmations, invitations, password resets, and other operational messages.",
    region: "United States",
    baa: "Yes",
  },
  {
    category: "Application Monitoring and Error Reporting",
    purpose:
      "Uptime monitoring, performance metrics, and error tracing to keep the Service reliable and to investigate issues.",
    region: "United States",
    baa: "Yes",
  },
  {
    category: "Customer Support Tooling",
    purpose:
      "Support ticketing and communication with customers, including handling of support conversations that may contain PHI.",
    region: "United States",
    baa: "Yes",
  },
  {
    category: "Data Backup and Recovery",
    purpose:
      "Encrypted backups of Customer Content and disaster recovery capabilities.",
    region: "United States",
    baa: "Yes",
  },
];

const withoutPhi = [
  {
    category: "Website Hosting and CMS",
    purpose: "Hosts the public marketing website at caselink.net.",
    region: "United States",
    phi: "None",
  },
  {
    category: "Domain and DNS",
    purpose: "Domain registration and DNS management for CaseLink domains.",
    region: "United States",
    phi: "None",
  },
  {
    category: "Website Analytics",
    purpose:
      "Aggregate usage analytics for the public marketing website only.",
    region: "United States",
    phi: "None",
  },
  {
    category: "Payment Processing",
    purpose:
      "Processing of subscription payments. Full payment card details are collected and processed by the payment processor and are not stored by CaseLink.",
    region: "United States",
    phi: "None",
  },
  {
    category: "Business Productivity",
    purpose:
      "Internal collaboration tools such as email, calendar, and document storage used by the CaseLink team. Not used to store Customer PHI.",
    region: "United States",
    phi: "None",
  },
];

export default function SubprocessorsPage() {
  return (
    <>
      <section className="privacy-hero">
        <div className="privacy-hero-bg" />
        <div className="wrap privacy-hero-inner">
          <span className="eyebrow">Trust</span>
          <h1>Subprocessors</h1>
          <p className="lead">
            The third-party service providers CaseLink uses to operate the
            platform, and how we ensure they meet their obligations to protect
            Protected Health Information.
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
              CaseLink relies on a small number of third-party service
              providers (<strong>&ldquo;Subprocessors&rdquo;</strong>) to
              operate its referral and clinical communication platform. Some of
              these Subprocessors process Protected Health Information (
              <strong>&ldquo;PHI&rdquo;</strong>) on our behalf. Others support
              the platform without ever touching PHI.
            </p>
            <p>
              This page is incorporated by reference into every executed
              CaseLink Business Associate Agreement. It lists the categories
              of Subprocessors we use and describes the safeguards we require
              of each.
            </p>

            <section id="commitments" className="privacy-section">
              <h2>Our Commitments</h2>
              <p>For every Subprocessor with access to PHI, CaseLink:</p>
              <ul>
                <li>
                  executes a Business Associate Agreement, consistent with 45
                  CFR 164.502(e)(1)(ii) and 164.308(b)(2), before granting
                  access,
                </li>
                <li>
                  reviews their security posture and privacy practices before
                  onboarding,
                </li>
                <li>
                  grants only the access required for the specific function they
                  perform, and
                </li>
                <li>
                  remains responsible for their acts and omissions with respect
                  to PHI as if performed by CaseLink itself.
                </li>
              </ul>
              <p>
                For Subprocessors that do not process PHI (for example,
                marketing analytics on the public website), we still require
                confidentiality and standard commercial security commitments.
              </p>
            </section>

            <section id="with-phi" className="privacy-section">
              <h2>Subprocessors with PHI Access</h2>
              <p>
                The following categories describe Subprocessors that create,
                receive, maintain, or transmit PHI on CaseLink&rsquo;s behalf.
                Specific vendor names within each category are available on
                request from Covered Entities under an executed Business
                Associate Agreement.
              </p>
              <div className="privacy-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Data Region</th>
                      <th scope="col">BAA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withPhi.map((row) => (
                      <tr key={row.category}>
                        <td>{row.category}</td>
                        <td>{row.purpose}</td>
                        <td>{row.region}</td>
                        <td>
                          <span className="privacy-pill privacy-pill-yes">
                            {row.baa}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="without-phi" className="privacy-section">
              <h2>Subprocessors without PHI Access</h2>
              <p>
                The following categories support the CaseLink website and
                business operations but do not have access to PHI.
              </p>
              <div className="privacy-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Data Region</th>
                      <th scope="col">PHI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withoutPhi.map((row) => (
                      <tr key={row.category}>
                        <td>{row.category}</td>
                        <td>{row.purpose}</td>
                        <td>{row.region}</td>
                        <td>
                          <span className="privacy-pill privacy-pill-none">
                            {row.phi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="changes" className="privacy-section">
              <h2>Changes to This List</h2>
              <p>
                CaseLink may add, remove, or replace Subprocessors as needed to
                operate and improve the Service. When we make a material change
                to the Subprocessors that process PHI, we will:
              </p>
              <ul>
                <li>
                  update this page and revise the &ldquo;Last Updated&rdquo;
                  date,
                </li>
                <li>
                  execute a Business Associate Agreement with the new
                  Subprocessor before granting access to PHI, and
                </li>
                <li>
                  provide notice to Covered Entities through the Service, by
                  email, or as otherwise required by an executed Business
                  Associate Agreement.
                </li>
              </ul>
              <p>
                Covered Entities may request the current list of specific vendor
                names within each category by contacting us at the address
                below, subject to an executed Business Associate Agreement or a
                customary confidentiality arrangement.
              </p>
            </section>

            <section id="data-region" className="privacy-section">
              <h2>Where PHI Is Processed</h2>
              <p>
                Customer Content, including PHI, is processed and stored in the
                United States. CaseLink does not transfer PHI outside the United
                States.
              </p>
            </section>

            <section id="legal-note" className="privacy-section">
              <h2>How This Page Fits</h2>
              <p>
                <strong>Incorporated by reference.</strong> This Subprocessors
                page is incorporated by reference into every executed CaseLink
                Business Associate Agreement. Nothing on this page modifies the
                rights, obligations, or remedies set out in the BAA or under
                HIPAA. Where the BAA is silent or ambiguous with respect to
                Subprocessors, this page and the BAA are read together.
              </p>
            </section>

            <section id="contact" className="privacy-section">
              <h2>Questions</h2>
              <p>
                Requests for the current Subprocessor list, diligence
                questionnaires, and other compliance questions can be sent to
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
