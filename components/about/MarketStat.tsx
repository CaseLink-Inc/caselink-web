"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  // For numeric counters, the value to count up to. Negative directions handled
  // by passing `direction: "down"` and using `start` larger than `target`.
  target?: number;
  // Optional starting value if you want a decreasing count.
  start?: number;
  // Optional prefix (e.g. "<") and suffix (e.g. "%") to render around the number.
  prefix?: string;
  suffix?: string;
  // For non-numeric stats (e.g. "Days"), just pass `text` and skip target.
  text?: string;
  // How long the counter takes to run, ms. Default 1400.
  duration?: number;
};

export default function MarketStat({
  target,
  start = 0,
  prefix = "",
  suffix = "",
  text,
  duration = 1400,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<number>(typeof target === "number" ? start : 0);
  const [played, setPlayed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !played) {
            setPlayed(true);
            setRevealed(true);
            if (typeof target === "number") {
              const startTime = performance.now();
              const from = start;
              const to = target;
              const tick = (now: number) => {
                const t = Math.min(1, (now - startTime) / duration);
                // ease-out cubic so the count slows as it approaches the target
                const eased = 1 - Math.pow(1 - t, 3);
                const v = from + (to - from) * eased;
                setValue(v);
                if (t < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            }
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // played intentionally not a dep — once played, stays played.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rendered =
    typeof target === "number" ? `${prefix}${Math.round(value)}${suffix}` : text;

  return (
    <div ref={ref} className={`market-stat-num ${revealed ? "in" : ""}`}>
      {rendered}
    </div>
  );
}
