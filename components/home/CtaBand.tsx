import Link from "next/link";
import { ArrowRight } from "@/components/icons";

type Props = {
  title: React.ReactNode;
  body: string;
  primary: { href: string; label: string; external?: boolean };
  secondary: { href: string; label: string; external?: boolean };
};

export default function CtaBand({ title, body, primary, secondary }: Props) {
  const externalProps = {
    target: "_blank",
    rel: "noopener noreferrer",
  } as const;

  return (
    <section className="cta-sec">
      <div className="cta-bg" />
      <div className="wrap" style={{ position: "relative" }}>
        <h2 className="reveal">{title}</h2>
        <p className="reveal">{body}</p>
        <div className="cta-buttons reveal">
          {primary.external ? (
            <a href={primary.href} className="btn btn-primary" {...externalProps}>
              {primary.label}
              <ArrowRight width={14} height={14} />
            </a>
          ) : (
            <Link href={primary.href} className="btn btn-primary">
              {primary.label}
              <ArrowRight width={14} height={14} />
            </Link>
          )}
          {secondary.external ? (
            <a href={secondary.href} className="btn btn-ghost" {...externalProps}>
              {secondary.label}
            </a>
          ) : (
            <Link href={secondary.href} className="btn btn-ghost">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
