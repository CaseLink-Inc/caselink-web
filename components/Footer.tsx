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
    <footer className="site-footer">
      <div className="wrap">
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
            <div className="foot-social-label">Follow us on:</div>
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
                  {i < socials.length - 1 && <span className="foot-social-sep" aria-hidden="true" />}
                </span>
              ))}
            </div>
          </div>
          <div className="foot-col">
            <h5>Pages</h5>
            <ul>
              <li><Link href="/" className={isActive("/") ? "on" : ""}>Home</Link></li>
              <li><Link href="/about" className={isActive("/about") ? "on" : ""}>About</Link></li>
              <li><Link href="/contact" className={isActive("/contact") ? "on" : ""}>Contact</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>More pages</h5>
            <ul>
              <li><Link href="/#how">How it works</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="/privacy" className={isActive("/privacy") ? "on" : ""}>Privacy</Link></li>
              <li><a href="mailto:support@caselink.net">support@CaseLink.net</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-divider" />
        <div className="foot-bot">
          <span>© 2025 <strong>CaseLink.</strong> All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
