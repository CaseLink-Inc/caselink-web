"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      // Release each element shortly BEFORE it reaches the viewport, so it
      // has finished arriving by the time it is actually looked at.
      //
      // The old gate was threshold 0.12 with the root shrunk 40px at the
      // bottom. On a ~500px card that meant waiting for 60px of it to clear
      // a 773px line: measured, every card in "Built for both sides" was
      // released with its top at 714px of an 813px viewport, 99px above the
      // fold. The 550ms fade then ran while the reader was still scrolling
      // the card into view, which is what read as the section loading late.
      //
      // Any pixel will do now, and the root is grown 20% past the bottom
      // edge instead of shrunk, so a card is already fading before it can
      // be seen. Elements that start on screen are handled by scan() below.
      { threshold: 0, rootMargin: "0px 0px 20% 0px" }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in");
        } else {
          observer.observe(el);
        }
      });
    };

    // Scan immediately for elements already in DOM, then again after a tick
    // to catch anything that mounts asynchronously.
    scan();
    const t1 = setTimeout(scan, 60);
    const t2 = setTimeout(scan, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
