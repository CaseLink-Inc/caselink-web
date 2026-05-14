import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot">
          <div>
            <Link href="/" className="logo" aria-label="CaseLink">
              <Image src="/logo-primary.svg" width={150} height={34} alt="CaseLink" />
            </Link>
            <p className="foot-tag">
              A secure referral and collaboration network for general dentists
              and specialists. Built in Washington, DC.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><Link href="/#how">How it works</Link></li>
              <li><Link href="/#network">Network</Link></li>
              <li><Link href="/#who">For practices</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href="mailto:hello@caselink.net">hello@caselink.net</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 CaseLink, Inc.</span>
        </div>
      </div>
    </footer>
  );
}
