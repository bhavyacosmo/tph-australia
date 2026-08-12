"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up to a real value when it enters the viewport.
 *
 * Only ever used on figures that are genuinely counts — never on a number
 * invented to look impressive ([H1] p.4: "no fake progress").
 * Under reduced motion the final value renders immediately.
 */
export function AnimatedNumber({
  value,
  duration = 900,
  className,
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  /*
    The displayed figure has to track `value` for as long as this stays mounted.
    Initialising state from `value` alone is not enough: a count that changes
    while the component is on screen — the user ticks an action off, saves a
    comparison, archives a property — would keep showing the old number, and a
    number that lies is worse than one that does not animate.
  */
  const displayRef = useRef(display);
  displayRef.current = display;

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    // Count from wherever the figure currently is, not from zero, so a change
    // mid-life reads as an increment rather than a reset.
    const from = displayRef.current;
    if (from === value) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease-out expo — settles rather than stopping abruptly
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
