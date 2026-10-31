"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* Put a new route at the top of the page, instantly.
 *
 * globals.css sets `html{scroll-behavior:smooth}` so the in-page anchors (the
 * nav's /#network, the privacy and terms contents lists) glide rather than
 * jump. The cost is that every programmatic scroll inherits it, including the
 * one the router runs on a route change. Measured on the live site, a 5000px
 * scroll takes about 2.9s to arrive, so leaving the bottom of a 10,000px page
 * means several seconds of crawling while the new page is already rendered,
 * and a single touch during that crawl cancels it and strands the reader in
 * the middle of the new page.
 *
 * The router neutralises this itself in current Chrome, which is why this is
 * belt and braces rather than the only thing standing between us and the bug,
 * but that behaviour is not something to rely on across browsers, and iOS
 * Safari has long handled programmatic smooth scrolling differently.
 *
 * A hash in the URL is somebody asking for a specific element, so leave those
 * alone: the browser's own anchor handling should win, smoothly.
 */
export default function ScrollReset() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    // The first paint is a fresh document load, which the browser already
    // positions. Resetting here would fight its scroll restoration on a back
    // or forward navigation.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.location.hash) return;

    // `behavior: "instant"` overrides the CSS for this one call and touches
    // nothing else. An earlier version of this set scroll-behavior on the
    // element and restored it a frame later, which looked equivalent and was
    // not: a second navigation arriving before the restore captured "auto" as
    // the value to put back, so the override stuck and smooth scrolling died
    // site-wide.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
