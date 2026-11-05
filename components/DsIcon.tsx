import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A design system icon, inlined rather than loaded through <img>.
 *
 * The icons are glass: a coloured gradient blob, a frosted body clipped to
 * the subject's shape, a white outline, and a white accent on top. None of
 * that is reachable from CSS while the file is an <img> src, because an SVG
 * loaded that way is an opaque resource with its own document. Inlining it
 * puts the four layers in the page, where they can be animated.
 *
 * Every one of the 34 icons in /public/ds/icons is built the same way:
 *
 *   defs > blob > glass > outline > accent
 *
 * so the layers are tagged by position and one stylesheet drives the whole
 * library. The structure is asserted at build time: an icon that does not
 * match throws rather than rendering something subtly wrong.
 *
 * Ids inside the files are already namespaced per icon (general-dentist-bk,
 * specialist-clip). The same icon twice on one page therefore repeats a set
 * of identical ids, which browsers resolve to the first match. Because the
 * duplicates are byte-identical that is harmless, and animation targets the
 * elements rather than the defs, so instances still animate independently.
 */

const LAYERS = ["blob", "glass", "outline", "accent"] as const;

const cache = new Map<string, string>();

/** Split the markup after </defs> into its top-level <g> elements. */
function topLevelGroups(body: string): { start: number; end: number }[] {
  const groups: { start: number; end: number }[] = [];
  let depth = 0;
  let start = -1;
  const tag = /<(\/?)g\b[^>]*?(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(body))) {
    const closing = m[1] === "/";
    const selfClosing = m[2] === "/";
    if (selfClosing) continue;
    if (!closing) {
      if (depth === 0) start = m.index;
      depth++;
    } else {
      depth--;
      if (depth === 0 && start >= 0) {
        groups.push({ start, end: tag.lastIndex });
        start = -1;
      }
    }
  }
  return groups;
}

function buildMarkup(name: string): string {
  const file = join(process.cwd(), "public", "ds", "icons", `${name}.svg`);
  let svg: string;
  try {
    svg = readFileSync(file, "utf8");
  } catch {
    throw new Error(`DsIcon: no such icon /ds/icons/${name}.svg`);
  }

  const defsEnd = svg.indexOf("</defs>");
  if (defsEnd === -1) throw new Error(`DsIcon: ${name}.svg has no <defs>`);
  const head = svg.slice(0, defsEnd + "</defs>".length);
  const body = svg.slice(defsEnd + "</defs>".length);

  const groups = topLevelGroups(body);
  if (groups.length !== LAYERS.length) {
    throw new Error(
      `DsIcon: ${name}.svg has ${groups.length} top-level groups, expected ${LAYERS.length} (${LAYERS.join(", ")})`
    );
  }

  // Walk backwards so earlier offsets stay valid as we insert.
  let out = body;
  for (let i = groups.length - 1; i >= 0; i--) {
    const { start } = groups[i];
    out =
      out.slice(0, start + 2) +
      ` class="cl-ai-${LAYERS[i]}"` +
      out.slice(start + 2);
  }

  // The file carries width/height of 500; the wrapper sizes it instead.
  // Strip those from the ROOT TAG ONLY. Running the replace over the whole
  // document also takes width/height off the blob's <rect> and off the rects
  // inside the clip and the mask, and a rect without dimensions draws
  // nothing, which silently empties the icon of all its colour.
  const full = head + out;
  const rootEnd = full.indexOf(">");
  if (rootEnd === -1) throw new Error(`DsIcon: ${name}.svg has no root tag`);
  const rootTag = full
    .slice(0, rootEnd)
    .replace(/\s(?:width|height)="[^"]*"/g, "")
    // Each file carries its own role="img" aria-label="...". Through <img>
    // that was inert, but inlined it is live, so a decorative icon would
    // announce itself and one with real alt text would be read twice. The
    // wrapper decides the semantics instead.
    .replace(/\s(?:role|aria-label)="[^"]*"/g, "")
    .replace("<svg", '<svg class="cl-ai-svg" aria-hidden="true" focusable="false"');
  return rootTag + full.slice(rootEnd);
}

function markup(name: string): string {
  let m = cache.get(name);
  if (!m) {
    m = buildMarkup(name);
    cache.set(name, m);
  }
  return m;
}

export default function DsIcon({
  name,
  size = 52,
  alt = "",
  className = "",
}: {
  /** File name under /public/ds/icons, without the extension. */
  name: string;
  size?: number;
  /**
   * Describe the icon when it carries meaning of its own. Leave it out for
   * one that only decorates a heading the reader already has, which is most
   * of them.
   */
  alt?: string;
  className?: string;
}) {
  const semantics = alt
    ? { role: "img" as const, "aria-label": alt }
    : { "aria-hidden": true as const };
  return (
    <span
      className={`cl-ai ${className}`.trim()}
      style={{ width: size, height: size }}
      {...semantics}
      dangerouslySetInnerHTML={{ __html: markup(name) }}
    />
  );
}
