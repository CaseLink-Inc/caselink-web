import { Fragment } from "react";
import Markdown from "react-markdown";

export type ArticleInsert = {
  section: number; // 1-based H2 index this insert attaches to
  node: React.ReactNode;
  after?: boolean; // render after the heading (e.g. side images) vs before it
};

/**
 * Renders an article's markdown body. Editorial treatment, no icon chrome:
 * - bold lead-in paragraphs become clean accent-ruled callouts (no icons),
 * - inserts (pull-quotes, images, sliders) drop in before or after a given
 *   H2 so each article's flow can differ,
 * - external links open in a new tab.
 */
export default function ArticleBody({
  markdown,
  accent = "#3E8EFF",
  inserts = [],
}: {
  markdown: string;
  accent?: string;
  inserts?: ArticleInsert[];
}) {
  let h2Index = 0;

  return (
    <div className="res-prose" style={{ "--accent": accent } as React.CSSProperties}>
      <Markdown
        components={{
          h2({ children }) {
            h2Index += 1;
            const before = inserts.filter((i) => i.section === h2Index && !i.after);
            const after = inserts.filter((i) => i.section === h2Index && i.after);
            return (
              <>
                {before.map((ins, k) => (
                  <Fragment key={`b${k}`}>{ins.node}</Fragment>
                ))}
                <h2>{children}</h2>
                {after.map((ins, k) => (
                  <Fragment key={`a${k}`}>{ins.node}</Fragment>
                ))}
              </>
            );
          },
          p({ node, children }) {
            const first = node?.children?.[0] as
              | { type?: string; tagName?: string }
              | undefined;
            const isPoint =
              first?.type === "element" && first?.tagName === "strong";
            return isPoint ? (
              <p className="res-point">{children}</p>
            ) : (
              <p>{children}</p>
            );
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
