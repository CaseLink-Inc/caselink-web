import Link from "next/link";
import { ArrowRight } from "@/components/icons";

type Props = {
  title: React.ReactNode;
  body: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

export default function CtaBand({ title, body, primary, secondary }: Props) {
  return (
    <section className="cta-sec">
      <div className="cta-bg" />
      <div className="wrap" style={{ position: "relative" }}>
        <h2 className="reveal">{title}</h2>
        <p className="reveal">{body}</p>
        <div className="cta-buttons reveal">
          <Link href={primary.href} className="btn btn-primary">
            {primary.label}
            <ArrowRight width={14} height={14} />
          </Link>
          <Link href={secondary.href} className="btn btn-ghost">{secondary.label}</Link>
        </div>
      </div>
    </section>
  );
}
