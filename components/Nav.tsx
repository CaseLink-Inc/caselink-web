"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/#how", label: "How it works" },
  { href: "/#network", label: "Network" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mob-open", open);
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (href.includes("#")) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  };

  const arrowSvg = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" stroke="currentColor">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );

  return (
    <>
      <nav className="site-nav">
        <div className="nav-inner">
          <Link href="/" className="logo" aria-label="CaseLink">
            <Image src="/logo-primary.svg" width={142} height={32} alt="CaseLink" priority />
          </Link>
          <div className="nav-links">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l.href, l.exact) ? "active" : ""}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="nav-cta">
            <Link href="/contact" className="btn btn-primary">
              Book a demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              type="button"
              className="nav-mob"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" stroke="currentColor">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mob-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`mob-drawer ${open ? "open" : ""}`}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>
                {l.label}
                {arrowSvg}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/contact" className="mob-cta">Book a demo</Link>
      </aside>
    </>
  );
}
