import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { getResource } from "@/lib/resources";
import type { Faq } from "@/lib/faqs";

/** Native <details> accordion (answers stay in the DOM for crawlers), with
 *  an optional link to the matching Resources article under each answer. */
export default function FaqAccordion({
  faqs,
  name = "caselink-faq-accordion",
}: {
  faqs: Faq[];
  /** Groups these <details> so opening one closes the rest. Pass a
   *  distinct value if a page ever renders two accordions. */
  name?: string;
}) {
  return (
    <div className="res-faq-list">
      {faqs.map((f) => {
        const guide = f.guide ? getResource(f.guide) : undefined;
        return (
          /* A shared name makes the group exclusive natively, with no
             JavaScript, so every answer stays server-rendered for the
             FAQPage JSON-LD. Without it every item the visitor opened
             stayed open and the list grew as they read. */
          <details key={f.q} name={name} className="res-faq-item">
            <summary>
              <span>{f.q}</span>
              <span className="res-faq-mark" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p>{f.a}</p>
            {guide && (
              <Link href={`/resources/${guide.slug}`} className="faq-guide-link">
                Read the guide: {guide.title}
                <ArrowRight width={13} height={13} />
              </Link>
            )}
          </details>
        );
      })}
    </div>
  );
}
