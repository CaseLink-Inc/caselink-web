import Markdown from "react-markdown";
import { Check } from "@/components/icons";

/**
 * Renders an article's markdown body with CaseLink's design treatment:
 * - a paragraph that begins with bold text ("**The call that never
 *   happens.** ...") becomes a highlighted point block with an icon,
 * - links open safely (external links in a new tab),
 * - headings and lists inherit the .res-prose styling.
 */
export default function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="res-prose">
      <Markdown
        components={{
          p({ node, children }) {
            const first = node?.children?.[0] as
              | { type?: string; tagName?: string }
              | undefined;
            const isPoint =
              first?.type === "element" && first?.tagName === "strong";
            if (isPoint) {
              return (
                <div className="res-point">
                  <span className="res-point-ic" aria-hidden="true">
                    <Check width={14} height={14} />
                  </span>
                  <p className="res-point-body">{children}</p>
                </div>
              );
            }
            return <p>{children}</p>;
          },
          a({ href, children }) {
            const url = href ?? "#";
            const external = /^https?:\/\//.test(url);
            return (
              <a
                href={url}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
