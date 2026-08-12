"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Whether scroll choreography should run.
 *
 * Two reasons it may not, and both are deliberate design positions rather
 * than fallbacks (docs/03-experience/19-homepage-art-direction.md §7):
 *
 *  - `prefers-reduced-motion` — the reader gets the COMPLETED final state of
 *    every act, so the page reads as a well-composed static document.
 *  - below `lg` — pinned scroll storytelling is a desktop affordance. On a
 *    phone each act renders as its own resolved scene. The story survives;
 *    only the choreography stops.
 *
 * Returns false during SSR and the first client render, so the server and
 * client markup agree and the static composition is what paints first.
 */
export function useChoreography(): boolean | null {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setWide(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setWide(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // `null` until resolved. Returning `false` too early makes a consumer paint
  // its RESOLVED state and then snap back once choreography turns on — a
  // visible flash of the wrong narrative moment. Callers must treat null as
  // "not yet known" and render the opening state, not the end state.
  if (wide === null) return null;
  return wide && !reduce;
}
