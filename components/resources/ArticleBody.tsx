import { Fragment } from "react";
import Image from "next/image";
import Markdown from "react-markdown";

export type ArticleInsert = {
  section: number; // 1-based H2 index this insert attaches to
  node: React.ReactNode;
  after?: boolean; // render after the heading (e.g. side images) vs before it
};

/**
 * Renders an article's markdown body.
 *
 * The two structures an article leans on both start with a bold lead
 * sentence in the markdown, so both can be lifted out of the prose without
 * the writer doing anything differently:
 * - a paragraph opening in bold becomes a callout card, with an icon tile
 *   when the article supplies `pointIcons`,
 * - an ordered list becomes numbered step cards.
 *
 * Inserts (pull-quotes, images, sliders) drop in before or after a given
 * H2 so each article's flow can differ, and external links open in a new
 * tab.
 */
export default function ArticleBody({
  markdown,
  accent = "#3E8EFF",
  inserts = [],
  pointIcons = [],
}: {
  markdown: string;
  accent?: string;
  inserts?: ArticleInsert[];
  pointIcons?: string[];
}) {
  let h2Index = 0;
  let pointIndex = 0;

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
            if (!isPoint) return <p>{children}</p>;
            /* Short icon lists repeat their last entry rather than
               leaving later cards with an empty tile. */
            const icon =
              pointIcons[pointIndex] ?? pointIcons[pointIcons.length - 1];
            pointIndex += 1;
            /* The content needs its own box so the card can be a grid:
               a marker column and a text column, each centred against
               the other. Bare text nodes would become separate grid
               items and the layout would come apart. */
            return (
              <p className={`res-point${icon ? " res-point--ic" : ""}`}>
                {icon && (
                  <span className="res-point-ic" aria-hidden="true">
                    <Image
                      src={`/ds/icons/${icon}.svg`}
                      alt=""
                      width={38}
                      height={38}
                    />
                  </span>
                )}
                <span className="res-point-body">{children}</span>
              </p>
            );
          },
          ol({ children }) {
            return <ol className="res-steps">{children}</ol>;
          },
          /* Same reason as the callout: the step card is a grid, and
             without this wrapper each text node between the inline tags
             would become its own grid item and the card would come
             apart. Harmless inside a plain <ul>. */
          li({ children }) {
            return (
              <li>
                <span className="res-li-body">{children}</span>
              </li>
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
