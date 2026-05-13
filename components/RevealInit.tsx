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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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
