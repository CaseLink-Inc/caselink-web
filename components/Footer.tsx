"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, LinkedIn } from "@/components/icons";

const socials = [
  { href: "https://www.facebook.com/caselink.net", label: "Facebook", Icon: Facebook },
  { href: "https://www.instagram.com/caselinkinc/", label: "Instagram", Icon: Instagram },
  { href: "https://www.linkedin.com/company/caselinknet/", label: "LinkedIn", Icon: LinkedIn },
];

export default function Footer() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <footer className="site-footer cl-grain">
      <div className="wrap">
        {/* A floating panel of product glass, inset from the page edges,
            the same material as the nav pill: glass floats, cards sit, and
            the page now opens and closes on the same material. */}
        <div className="foot-panel cl-glass cl-glass--dark">
          <div className="foot">
          <div className="foot-brand">
            <Link href="/" className="logo" aria-label="CaseLink">
              <Image
                src="/logo-primary-white.svg"
                width={170}
                height={38}
                alt="CaseLink"
              />
            </Link>
          </div>
          {/* Four named groups rather than two lists flowed into two
              columns each. The flow split the groups at whatever item fell
              halfway, so Contact landed under FAQs and the three audience
              pages sat in different columns. Each group now carries its
              own heading and the order inside it is deliberate. */}
          <div className="foot-col">
            <h5>Pages</h5>
            <ul>
              <li><Link href="/" className={isActive("/") ? "on" : ""}>Home</Link></li>
              <li><Link href="/about" className={isActive("/about") ? "on" : ""}>About</Link></li>
              <li><Link href="/pricing" className={isActive("/pricing") ? "on" : ""}>Pricing</Link></li>
              <li><Link href="/contact" className={isActive("/contact") ? "on" : ""}>Contact</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Solutions</h5>
            <ul>
              <li><Link href="/dental-referral-management" className={isActive("/dental-referral-management") ? "on" : ""}>Referral management</Link></li>
              <li><Link href="/referral-software/general-dentists" className={isActive("/referral-software/general-dentists") ? "on" : ""}>For general dentists</Link></li>
              <li><Link href="/referral-software" className={isActive("/referral-software") || /^\/referral-software\/(?!general-dentists|dso)/.test(pathname) ? "on" : ""}>For specialists</Link></li>
              <li><Link href="/referral-software/dso" className={isActive("/referral-software/dso") ? "on" : ""}>For DSOs</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>More</h5>
            <ul>
              <li><Link href="/faqs" className={isActive("/faqs") ? "on" : ""}>FAQs</Link></li>
              {/* The articles have been live and indexed all along; only
                  the footer link was held back. `on` also covers the
                  article pages, not just the index. */}
              <li><Link href="/resources" className={pathname.startsWith("/resources") ? "on" : ""}>Resources</Link></li>
              <li><Link href="/dental-referral-platform-dc" className={isActive("/dental-referral-platform-dc") ? "on" : ""}>CaseLink in DC</Link></li>
              {/* <wbr> gives the address its one sensible break point, so
                  on a narrow column it splits after the @ instead of
                  mid-word. */}
              <li><a href="mailto:support@caselink.net">support@<wbr />CaseLink.net</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Legal</h5>
            <ul>
              <li><Link href="/privacy" className={isActive("/privacy") ? "on" : ""}>Privacy</Link></li>
              <li><Link href="/terms" className={isActive("/terms") ? "on" : ""}>Terms</Link></li>
              <li><Link href="/security" className={isActive("/security") ? "on" : ""}>Security</Link></li>
              <li><Link href="/subprocessors" className={isActive("/subprocessors") ? "on" : ""}>Subprocessors</Link></li>
            </ul>
          </div>
        </div>
          <div className="foot-divider" />
          {/* The social row moved down here: it left a tall empty gap under
              the logo, and the closing row was a lone centred line. Now the
              bar carries the notice on one side and the follow row on the
              other, and the panel fills evenly. */}
          <div className="foot-bot">
            <span>© 2026 <strong>CaseLink.</strong> All rights reserved.</span>
            <div className="foot-follow">
              <span className="foot-social-label">Follow us on:</span>
              <div className="foot-social-row">
                {socials.map(({ href, label, Icon }, i) => (
                  <span key={label} className="foot-social-cell">
                    <a
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="foot-social"
                    >
                      <Icon width={16} height={16} />
                    </a>
                    {i < socials.length - 1 && (
                      <span className="foot-social-sep" aria-hidden="true" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
