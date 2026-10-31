import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/components/icons";

type Props = {
  title: React.ReactNode;
  body: string;
  primary: { href: string; label: string; external?: boolean };
  secondary: { href: string; label: string; external?: boolean };
};

/**
 * The closing CTA band, shared by twelve pages.
 *
 * The ground is the Ripple domes brand visual, used the way the graphic
 * language asks: one visual as the whole ground, cropped large, type in
 * its open space. The quiet half is the top, so the statement sits there
 * and the domes rise underneath it.
 *
 * The buttons are the system's own controls rather than the site's legacy
 * .btn, which was a near-black pill that lifted and dropped a shadow on
 * hover. Depth in this system comes from the rim, the sheen and the inner
 * lips, never from a shadow.
 */
export default function CtaBand({ title, body, primary, secondary }: Props) {
  const externalProps = {
    target: "_blank",
    rel: "noopener noreferrer",
  } as const;

  return (
    <section className="cta-sec cl-grain">
      {/* next/image rather than a CSS background so the 2738px artwork is
          served as a sized WebP instead of a 768KB JPEG. Decorative, so
          it carries no alt text. */}
      <Image
        src="/ds/cta-ripple-domes.jpg"
        alt=""
        fill
        sizes="100vw"
        className="cta-art"
        aria-hidden="true"
      />
      <div className="wrap" style={{ position: "relative" }}>
        <h2 className="reveal">{title}</h2>
        <p className="reveal">{body}</p>
        <div className="cta-buttons reveal">
          {primary.external ? (
            <a
              href={primary.href}
              className="cl-btn cl-btn--lg"
              {...externalProps}
            >
              {primary.label}
              <ArrowRight width={15} height={15} />
            </a>
          ) : (
            <Link href={primary.href} className="cl-btn cl-btn--lg">
              {primary.label}
              <ArrowRight width={15} height={15} />
            </Link>
          )}
          {secondary.external ? (
            <a
              href={secondary.href}
              className="cl-btn cl-btn--secondary cl-btn--lg"
              {...externalProps}
            >
              {secondary.label}
            </a>
          ) : (
            <Link
              href={secondary.href}
              className="cl-btn cl-btn--secondary cl-btn--lg"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
