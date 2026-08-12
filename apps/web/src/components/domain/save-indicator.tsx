"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Cloud } from "lucide-react";

import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * SaveIndicator — docs/03-experience/11-component-library.md §3.14
 *
 * FR-03-21 — saving must be autosave OR explicit, and in either case it must
 * carry **visible confirmation**. FR-05-13 — the system must show WHEN data was
 * last saved.
 *
 * Two states, one component: a transient "Saved" acknowledgement immediately
 * after a write, settling back to the persistent "Saved <when>" line. The
 * transient state is what makes an autosave trustworthy — without it the user
 * cannot tell the difference between saved and lost.
 */
export function SaveIndicator({
  lastSavedAt,
  /** Set true for ~2s immediately after a write */
  justSaved = false,
  className,
}: {
  lastSavedAt: string;
  justSaved?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <p
      aria-live="polite"
      title={lastSavedAt}
      className={cn(
        "flex items-center gap-1.5 text-body-sm text-fg-muted",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {justSaved ? (
          <motion.span
            key="saved"
            initial={reduce ? undefined : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 font-medium text-success-fg"
          >
            <Check aria-hidden="true" className="size-3.5" />
            Saved
          </motion.span>
        ) : (
          <motion.span
            key="when"
            initial={reduce ? undefined : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5"
          >
            <Cloud aria-hidden="true" className="size-3.5" />
            Saved {formatRelative(lastSavedAt)}
          </motion.span>
        )}
      </AnimatePresence>
    </p>
  );
}

/**
 * Fires `justSaved` for a short window after a write, then clears itself.
 * Returns `[flag, trigger]`.
 */
export function useJustSaved(ms = 1800): [boolean, () => void] {
  const [flag, setFlag] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    setFlag(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlag(false), ms);
  }, [ms]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return [flag, trigger];
}
