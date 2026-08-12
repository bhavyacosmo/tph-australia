"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { isBuilt, routes } from "@/lib/routes";
import { useJourneyStore } from "@/lib/store/journey-store";
import type { MilestoneKey } from "@/lib/mock/types";

/**
 * JourneyStageBar — docs/03-experience/05-navigation-structure.md §3
 *
 * Five WAYFINDING stages over the eight Progress Map Lite milestones.
 *
 * [C-18] is the trap this component exists to avoid: the mockup showed a
 * six-stage strip labelled "4 of 8", two competing progress models on one
 * screen. Here the five stages are navigation only and carry NO count of their
 * own; the single counter always reads "n of 8" from the milestones, which are
 * the one source of truth for completion.
 */

const STAGES: {
  key: string;
  label: string;
  /** Which milestones this stage covers — nav §3 */
  covers: MilestoneKey[];
  href: (journeyId: string) => string;
}[] = [
  {
    key: "setup",
    label: "Setup",
    covers: ["journey_started"],
    href: (j) => `/journey/${j}/setup`,
  },
  {
    key: "shortlist",
    label: "Shortlist",
    covers: ["first_property_saved"],
    href: (j) => `/journey/${j}/shortlist`,
  },
  {
    key: "compare",
    label: "Compare",
    covers: ["comparison_completed"],
    href: (j) => `/journey/${j}/compare`,
  },
  {
    key: "readiness",
    label: "Readiness",
    covers: ["readiness_completed"],
    href: (j) => `/journey/${j}/readiness`,
  },
  {
    key: "connect",
    label: "Connect",
    covers: [
      "professional_selected",
      "trust_link_authorised",
      "output_received",
      "ready_for_next_action",
    ],
    href: () => `/professionals`,
  },
];

export function JourneyStageBar() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { journey, milestones, activeProperties } = useJourneyStore();

  const done = (key: MilestoneKey) =>
    milestones.find((m) => m.key === key)?.state === "done";

  const completedCount = milestones.filter((m) => m.state === "done").length;

  return (
    <div className="border-b border-line-subtle bg-surface-card">
      <div className="mx-auto flex w-full max-w-(--container-content) flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:justify-between md:px-8 xl:px-10">
        {/* ------------------------------------------------ journey identity */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/journey/${journey.id}`}
            className="flex min-h-11 min-w-0 items-center gap-2 text-body-sm font-semibold text-fg-heading underline-offset-4 hover:underline"
          >
            <span className="truncate">{journey.name}</span>
          </Link>
          <span
            className="hidden shrink-0 text-caption text-fg-muted sm:inline"
            title={journey.lastSavedAt}
          >
            Saved {formatRelative(journey.lastSavedAt)}
          </span>
        </div>

        {/* ------------------------------------------------------- the stages */}
        <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:overflow-visible md:px-0">
          <nav aria-label="Journey stages" className="flex items-center gap-1">
            {STAGES.map((stage) => {
              const complete = stage.covers.every(done);
              const href = stage.href(journey.id);
              const built = isBuilt(href);
              const active =
                pathname === href ||
                (stage.key === "shortlist" && pathname.includes("/shortlist")) ||
                (stage.key === "readiness" && pathname.includes("/readiness")) ||
                (stage.key === "connect" &&
                  (pathname.startsWith("/professionals") ||
                    pathname.includes("/trust-link")));

              const inner = (
                <>
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "stage-pill"}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 -z-10 rounded-full bg-surface-sunken"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border",
                      complete
                        ? "border-action bg-action text-white"
                        : "border-line",
                    )}
                  >
                    {complete && <Check className="size-2.5" />}
                  </span>
                  {stage.label}
                  {stage.key === "shortlist" && activeProperties.length > 0 && (
                    <span className="tabular text-caption text-fg-muted">
                      {activeProperties.length}
                    </span>
                  )}
                </>
              );

              const shell = cn(
                "relative flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-body-sm whitespace-nowrap",
                "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                active
                  ? "text-fg-heading"
                  : "text-fg-secondary hover:text-fg-heading",
              );

              /*
                A stage whose screen has not been built yet renders inert rather
                than as a link to a 404 — `ENT-01`. See src/lib/routes.ts.
              */
              if (!built) {
                return (
                  <span
                    key={stage.key}
                    aria-disabled="true"
                    title="Arrives in the next phase of this prototype"
                    className={cn(shell, "cursor-default text-fg-muted hover:text-fg-muted")}
                  >
                    {inner}
                  </span>
                );
              }

              return (
                <Link
                  key={stage.key}
                  href={href}
                  aria-current={active ? "step" : undefined}
                  className={shell}
                >
                  {inner}
                </Link>
              );
            })}
          </nav>
        </div>

        {/*
          The ONE counter. Always the eight milestones ([C-18]). The five stages
          above must never display a competing count.
        */}
        <Link
          href={isBuilt(routes.propIdProgress()) ? routes.propIdProgress() : routes.propId()}
          className="flex min-h-11 shrink-0 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg-heading hover:underline"
        >
          <span className="tabular font-semibold text-fg-heading">
            {completedCount} of {milestones.length}
          </span>
          steps
        </Link>
      </div>
    </div>
  );
}
