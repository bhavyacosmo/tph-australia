"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  CATEGORIES,
  CATEGORY_STATE_LABEL,
  type CategoryKey,
  type CategoryState,
} from "@/lib/mock/readiness";
import { cn } from "@/lib/utils";

/**
 * The readiness dial.
 *
 * Adapted from the score-ring pattern in manager reference R4, with one change
 * that matters: **there is no number in it.**
 *
 * `[VB]` p.8 shows "Buyer Readiness Score 81 / 100". `[H1]` p.9 — the Stage 1
 * document, which outranks it — says "score band" and "must never be presented
 * as lending approval". [OQ-20] records the conflict. A percentage arc invites
 * exactly the credit-score reading FR-04-11 forbids, so instead of one arc
 * measuring a total, this draws **six arcs, one per category**, each coloured by
 * that category's own state. The picture is the data rather than a derivation of
 * it, and the centre carries the band label in words.
 *
 * Each arc draws in on arrival, staggered, so the reader watches their six areas
 * resolve one at a time — which is the moment the assessment pays off.
 */

const SIZE = 220;
const R = 92;
const CENTRE = SIZE / 2;
const GAP_DEG = 7;
const SEG_DEG = 360 / CATEGORIES.length;

const STATE_COLOUR: Record<CategoryState, string> = {
  ready: "var(--color-action)",
  attention: "var(--color-attention-fg)",
  can_wait: "var(--color-info-fg)",
  unanswered: "var(--color-line)",
};

function polar(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTRE + R * Math.cos(rad),
    y: CENTRE + R * Math.sin(rad),
  };
}

function arc(index: number): string {
  const start = index * SEG_DEG + GAP_DEG / 2;
  const end = (index + 1) * SEG_DEG - GAP_DEG / 2;
  const a = polar(start);
  const b = polar(end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export function ReadinessDial({
  categoryStates,
  bandLabel,
  className,
}: {
  categoryStates: Record<CategoryKey, CategoryState>;
  bandLabel: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[13.75rem]"
        role="img"
        aria-label={`Readiness by area: ${CATEGORIES.map(
          (c) => `${c.label} — ${CATEGORY_STATE_LABEL[categoryStates[c.key]]}`,
        ).join("; ")}`}
      >
        {CATEGORIES.map((category, i) => (
          <g key={category.key}>
            {/* The track, so an unanswered area still reads as a segment */}
            <path
              d={arc(i)}
              fill="none"
              stroke="var(--color-line-subtle)"
              strokeWidth={12}
              strokeLinecap="round"
            />
            <motion.path
              d={arc(i)}
              fill="none"
              stroke={STATE_COLOUR[categoryStates[category.key]]}
              strokeWidth={12}
              strokeLinecap="round"
              initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: reduce ? 0 : 0.25 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </g>
        ))}
      </svg>

      {/* The band, in words. Never a numeral. */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="max-w-[8rem] text-center"
        >
          <p className="text-overline uppercase text-fg-muted">You are</p>
          <p className="mt-1.5 text-h3 leading-tight text-fg-heading">
            {bandLabel}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/** The dial's key. Colour alone never carries the meaning (WCAG 1.4.1). */
export function DialLegend({
  categoryStates,
}: {
  categoryStates: Record<CategoryKey, CategoryState>;
}) {
  return (
    <ul className="space-y-2.5">
      {CATEGORIES.map((category) => {
        const state = categoryStates[category.key];
        return (
          <li
            key={category.key}
            className="flex items-baseline justify-between gap-4 text-body-sm"
          >
            <span className="flex items-center gap-2.5 text-fg-secondary">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ background: STATE_COLOUR[state] }}
              />
              {category.label}
            </span>
            <span className="shrink-0 font-medium text-fg-heading">
              {CATEGORY_STATE_LABEL[state]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
