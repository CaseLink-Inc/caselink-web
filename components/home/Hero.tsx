import Image from "next/image";
import Link from "next/link";
import { SIGNUP_URL } from "@/lib/urls";

/**
 * Home hero, restyled onto the design system's WebsiteHero (step 8).
 *
 * Structure, type sizes, colours and treatments come from the design system
 * card: the Horizon light ground with the copy held above the arc, product
 * glass for the announcement pill and the two floating chips, the headline
 * in Regular 400 with one landing phrase in grad-text-landing, and the trust
 * row along the bottom.
 *
 * Every word here is the wording that was already on the site. The keyword
 * line, the headline, the lede, the chips and the trust items are unchanged.
 */
export default function Hero() {
  return (
    <section className="clhero">
      <Image
        className="clhero-bg"
        src="/ds/horizon-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        /* A smooth gradient shows banding long before a photograph does,
           and the optimiser's default q=75 was visible in the arc. */
        quality={92}
      />

      <div className="clhero-copy">
        <span className="clhero-ann cl-glass cl-glass--thin">
          <i className="clhero-ann-dot" aria-hidden="true" />
          Built in Washington, DC
        </span>

        <h1 className="clhero-h1">
          <span className="clhero-kicker">
            Dental referral management for GPs and specialists
          </span>
          Your link to{" "}
          <span className="cl-landing">better patient care.</span>
        </h1>

        <p className="clhero-lede">
          A secure referral and collaboration network for general dentists and
          specialists. Send cases, share records, and track every outcome in
          one workspace your team will actually use.
        </p>

        <div className="clhero-cta">
          <a
            href={SIGNUP_URL}
            className="cl-btn cl-btn--lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get started free
          </a>
          <Link href="/#intro-video" className="cl-btn cl-btn--lg cl-btn--white">
            See how it works
          </Link>
        </div>
      </div>

      <div className="clhero-toast clhero-toast--l cl-glass cl-glass--thin">
        <Image
          src="/ds/icon-referral-sent.png"
          alt=""
          width={44}
          height={44}
        />
        <div>
          <b>X-ray attached</b>
          <span>Panoramic, 2.4 MB</span>
        </div>
      </div>

      <div className="clhero-toast clhero-toast--r cl-glass cl-glass--thin">
        <Image src="/ds/icon-scheduled.png" alt="" width={44} height={44} />
        <div>
          <b>Dr. Lee replied</b>
          <span>Reviewing the case</span>
        </div>
      </div>

      <div className="clhero-trust">
        <span>
          <i aria-hidden="true" />
          <strong>HIPAA</strong> compliant by design
        </span>
        <span>
          <i aria-hidden="true" />
          <strong>Under 3 min</strong> to send a referral
        </span>
        <span>
          <i aria-hidden="true" />
          <strong>Free</strong> for general dentists
        </span>
      </div>
    </section>
  );
}
