"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { Container } from "@/components/ui/section";
import { MILESTONES } from "./story-data";
import { cn } from "@/lib/utils";

/**
 * Act V — "Continues".
 * docs/03-experience/19-homepage-art-direction.md §4, section 6
 *
 * The eight Progress Map Lite milestones from [H1] p.14 — NOT a six-stage
 * lifecycle, and not the manager reference's Offer / Contract / Settlement
 * stages, which sit beyond the Stage 1 loop ([C-18], [C-M]).
 *
 * Hovering or focusing a milestone surfaces what it refers to, closing the
 * loop back to the objects used earlier on the page.
 */

const DETAIL: Record<string, string> = {
  journey_started: "You told us your area, timing and what help you wanted.",
  first_property_saved: "12 Green Street, Carindale — with your own note.",
  comparison_completed: "Four homes, side by side, on eleven criteria.",
  readiness_completed: "Six areas checked, with a short action plan.",
  professional_selected: "You chose BuildCheck. Nothing sent yet.",
  trust_link_authorised: "You chose what to share, and for how long.",
  output_received: "The inspection report, against the right property.",
  ready_for_next_action: "Add another home, or connect a conveyancer.",
};

export function ActContinue() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const completed = MILESTONES.filter((m) => m.done).length;

  return (
    <section
      aria-labelledby="act-continue-heading"
      className="overflow-hidden bg-trustlink-wash"
    >
      <Container className="py-20 md:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-overline uppercase text-fg-muted">Your progress</p>
          <h2
            id="act-continue-heading"
            className="mt-5 text-h1 text-fg-heading"
          >
            Leave for a month. Come back to exactly this.
          </h2>
          <p className="measure mt-5 text-body-lg text-fg-secondary">
            Your journey waits where you left it, and tells you what comes next.
          </p>
        </div>

        {/* Detail panel sits ABOVE the path so hovering never covers the node */}
        <div className="mt-14 min-h-24">
          <AnimatePresence mode="wait">
            {active !== null ? (
              <motion.div
                key={active}
                initial={reduce ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-lg rounded-xl border border-line-subtle bg-surface-card p-5 shadow-elev-1"
              >
                <p className="text-body-sm font-semibold text-fg-heading">
                  {MILESTONES[active].label}
                </p>
                <p className="mt-1.5 text-body-sm text-fg-secondary">
                  {DETAIL[MILESTONES[active].key]}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={reduce ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-body-sm text-fg-muted"
              >
                <span className="tabular font-semibold text-action">
                  {completed} of {MILESTONES.length}
                </span>{" "}
                steps complete — hover a step to see what it holds.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------------ path */}
        <div className="relative mt-10 overflow-x-auto pb-2">
          {/* The rule the nodes sit on, drawn left to right */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-4 h-px bg-line-subtle"
          />
          <motion.div
            aria-hidden="true"
            initial={reduce ? undefined : { scaleX: 0 }}
            whileInView={reduce ? undefined : { scaleX: completed / MILESTONES.length }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
            className="absolute left-0 right-0 top-4 h-px bg-action"
          />

          <ol className="relative flex min-w-[46rem] gap-2">
            {MILESTONES.map((m, i) => (
              <motion.li
                key={m.key}
                initial={reduce ? undefined : { opacity: 0, y: 10 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.075,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex-1"
              >
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(i)}
                  aria-describedby="act-continue-heading"
                  className="group flex w-full flex-col items-start gap-3 rounded-lg pt-0 text-left"
                >
                  <span
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full border-2 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:scale-110 group-focus-visible:scale-110",
                      m.done
                        ? "border-action bg-action text-white"
                        : "border-line bg-surface-card text-fg-muted",
                    )}
                  >
                    {m.done ? (
                      <Check aria-hidden="true" className="size-3.5" />
                    ) : (
                      <span className="tabular text-caption font-semibold">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-caption leading-tight transition-colors",
                      m.done
                        ? "font-medium text-fg-heading"
                        : "text-fg-secondary",
                      "group-hover:text-fg-heading group-focus-visible:text-fg-heading",
                    )}
                  >
                    {m.label}
                  </span>
                </button>
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
