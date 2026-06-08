import Markdown from "react-markdown";
import {
  Check,
  CreditCard,
  Clock,
  Lock,
  Users,
  Grid,
  Bolt,
} from "@/components/icons";
import ResourceFigure from "@/components/resources/ResourceFigure";

type IconType = React.ComponentType<{ width?: number; height?: number }>;

// Pick a section icon from the heading text so each H2 carries a relevant glyph.
function pickIcon(text: string): IconType {
  const t = text.toLowerCase();
  if (/cost|money|revenue|math|price|pay|worth|\$/.test(t)) return CreditCard;
  if (/follow|time|timing|window|speed|fast/.test(t)) return Clock;
  if (/secure|hipaa|complian|privacy|baa|safe/.test(t)) return Lock;
  if (/network|relationship|gp|specialist|endodont|asset/.test(t)) return Users;
  if (/measure|benchmark|conversion|rate|data|number|funnel|stage/.test(t))
    return Grid;
  return Bolt;
}

function headingText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(headingText).join(" ");
  return "";
}

/**
 * Renders an article's markdown body with CaseLink's design treatment:
 * - each H2 gets a relevant accent section icon,
 * - a paragraph that begins with bold text becomes a highlighted point block,
 * - image placeholders are inserted between longer sections,
 * - links open safely (external links in a new tab).
 */
export default function ArticleBody({
  markdown,
  accent = "#3E8EFF",
}: {
  markdown: string;
  accent?: string;
}) {
  let h2Index = 0;

  return (
    <div className="res-prose" style={{ "--accent": accent } as React.CSSProperties}>
      <Markdown
        components={{
          h2({ children }) {
            h2Index += 1;
            const Icon = pickIcon(headingText(children));
            // Drop an image placeholder between longer sections.
            const figureBefore = h2Index === 3 || h2Index === 5;
            return (
              <>
                {figureBefore && (
                  <ResourceFigure variant="inline" accent={accent} />
                )}
                <h2 className="res-h2">
                  <span className="res-h2-ic" aria-hidden="true">
                    <Icon width={17} height={17} />
                  </span>
                  <span>{children}</span>
                </h2>
              </>
            );
          },
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
