import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="notfound-sec">
      <div className="wrap notfound-inner">
        <div className="notfound-code">
          <span className="grad-text">404</span>
        </div>
        <h1>
          We can&apos;t find that page.
        </h1>
        <p className="lead">
          The link may be broken, or the page may have moved. Head back to
          the home page or get in touch if you were looking for something
          specific.
        </p>
        <div className="hero-cta">
          <Link href="/" className="btn btn-primary">
            Back to home
            <ArrowRight width={14} height={14} />
          </Link>
          <Link href="/contact" className="btn btn-ghost">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
