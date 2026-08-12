"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, User, UserCog } from "lucide-react";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { TransactionMap } from "@/components/prop-id/transaction-map";
import { useJourneyStore } from "@/lib/store/journey-store";
import { resolveNextAction } from "@/components/journey/next-action";
import { formatDate, formatRelative } from "@/lib/format";
import { isBuilt, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/lib/mock/types";

/**
 * S18 — Progress Map Lite. Reference R10.
 *
 * FR-09-01  the eight milestones — [H1] p.14 exactly
 * FR-09-02  milestone state AND owner
 * FR-09-03  the next action is named
 * FR-09-04  progression is visible at a glance
 *
 * [C-18] is the constraint that shapes this screen: **one progress model only.**
 * R10's stepper includes Offer, Contract and Settlement stages, which sit beyond
 * Stage 1 and would imply the product tracks a transaction it has no visibility
 * of. They are not here. The five-stage bar in Home Compass is wayfinding over
 * these same eight milestones and never shows a count of its own.
 *
 * Composition: a vertical connected path, deliberately NOT the horizontal
 * stepper the homepage already uses for the same eight milestones. The record
 * needs room per milestone for its owner, its date and its detail; the homepage
 * needed a single glance. Same data, different job.
 *
 * The path's fill is driven by completion, so arriving at this screen after
 * finishing something shows the line advance.
 */
export default function PropIdProgressPage() {
  const reduce = useReducedMotion();
  const { journey, milestones } = useJourneyStore();

  const next = resolveNextAction(milestones, journey.id);
  const completed = milestones.filter((m) => m.state === "done").length;
  const currentIndex = milestones.findIndex((m) => m.state !== "done");

  return (
    <div>
      <RecordHeader
        title="Progress Map"
        subtitle="Where you are in the purchase itself — and, below it, where you are in getting organised."
      />

      {/* ===================================================== the purchase
          Progress Map v2. The client asked for the real transaction journey and
          called it the heart of the product (transcript L785). It comes first
          because it is what he wants a user to see. */}
      <section aria-labelledby="transaction-heading" className="mt-10">
        <h2 id="transaction-heading" className="sr-only">
          Your purchase
        </h2>
        <TransactionMap />
      </section>

      {/* ================================================ the Home Compass steps
          FR-09-01's eight milestones, kept. [C-18] says one progress model, and
          this respects that by NOT merging the two: they measure different
          things, and the eight-step counter is still the only counter that
          appears in the journey chrome. */}
      <div className="mt-16 border-t border-line-subtle pt-12">
        <h2 className="text-h2 text-fg-heading">Getting organised</h2>
        <p className="measure mt-3 text-body text-fg-secondary">
          The eight steps of your Home Compass journey. These are about your
          preparation, not the transaction — which is why they are counted
          separately.
        </p>
      </div>

      {/* ============================================================ summary */}
      <Reveal>
        <section className="mt-10 rounded-3xl border border-line-subtle bg-surface-card p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-baseline gap-2">
                <span className="tabular text-display font-bold leading-none text-fg-heading">
                  <AnimatedNumber value={completed} />
                </span>
                <span className="text-h3 text-fg-muted">
                  / {milestones.length}
                </span>
              </p>
              <p className="mt-3 text-body text-fg-secondary">
                steps complete · last activity{" "}
                {formatRelative(journey.lastSavedAt)}
              </p>
            </div>

            <div className="min-w-0 max-w-sm">
              <p className="text-overline uppercase text-fg-muted">
                {/* FR-09-03 */}
                Your next step
              </p>
              <p className="mt-2 text-body font-medium text-fg-heading">
                {next.title}
              </p>
              {next.pending || !isBuilt(next.href(journey.id)) ? (
                <p className="mt-3 text-body-sm text-fg-muted">
                  Arrives in the next phase of this prototype.
                </p>
              ) : (
                <ButtonLink
                  href={next.href(journey.id)}
                  variant="secondary"
                  className="mt-4 group"
                >
                  {next.cta}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </ButtonLink>
              )}
            </div>
          </div>

          {/* Overall progression — FR-09-04 */}
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-line-subtle">
            <motion.div
              initial={reduce ? undefined : { scaleX: 0 }}
              animate={{ scaleX: completed / milestones.length }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0 }}
              className="h-full w-full rounded-full bg-action"
            />
          </div>
        </section>
      </Reveal>

      {/* =============================================================== path */}
      <ol className="relative mt-12">
        {/* The rule the nodes sit on, and its completed portion drawn over it */}
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[1.4375rem] top-6 w-0.5 bg-line-subtle"
        />
        <motion.span
          aria-hidden="true"
          initial={reduce ? undefined : { scaleY: 0 }}
          animate={{
            scaleY:
              milestones.length > 1
                ? Math.max(0, completed - 0.5) / (milestones.length - 1)
                : 0,
          }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ originY: 0 }}
          className="absolute bottom-6 left-[1.4375rem] top-6 w-0.5 bg-action"
        />

        {milestones.map((milestone, i) => (
          <MilestoneRow
            key={milestone.key}
            milestone={milestone}
            index={i}
            isCurrent={i === currentIndex}
            journeyId={journey.id}
            reduce={Boolean(reduce)}
          />
        ))}
      </ol>

      <p className="mt-10 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        Steps after the sixth depend on a professional you authorise. Nothing
        moves without you — and nothing here is a commitment to buy.
      </p>
    </div>
  );
}

function MilestoneRow({
  milestone,
  index,
  isCurrent,
  journeyId,
  reduce,
}: {
  milestone: Milestone;
  index: number;
  isCurrent: boolean;
  journeyId: string;
  reduce: boolean;
}) {
  const done = milestone.state === "done";
  const inProgress = milestone.state === "in_progress";

  return (
    <motion.li
      initial={reduce ? undefined : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index, 8) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex gap-6 pb-8 last:pb-0"
    >
      {/* node */}
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 mt-0.5 grid size-12 shrink-0 place-items-center rounded-full border-2 bg-surface-page transition-colors duration-[var(--duration-base)]",
          done && "border-action bg-action text-white",
          inProgress && "border-action bg-surface-card text-action",
          !done && !inProgress && "border-line bg-surface-card text-fg-muted",
        )}
      >
        {done ? (
          <Check className="size-5" />
        ) : (
          <span className="tabular text-body-sm font-semibold">{index + 1}</span>
        )}
      </span>

      {/* body */}
      <div
        className={cn(
          "min-w-0 flex-1 rounded-2xl border p-5 transition-colors duration-[var(--duration-base)]",
          isCurrent
            ? "border-action/40 bg-trustlink-wash"
            : "border-line-subtle bg-surface-card",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className={cn(
                "text-body font-semibold",
                done || isCurrent ? "text-fg-heading" : "text-fg-secondary",
              )}
            >
              {milestone.label}
            </h2>
            <p className="mt-1.5 text-body-sm text-fg-secondary">
              {milestone.detail}
            </p>
          </div>

          <StatusChip
            tone={done ? "success" : inProgress ? "info" : "neutral"}
            icon={
              done ? (
                <Check aria-hidden="true" className="size-3" />
              ) : (
                <Clock aria-hidden="true" className="size-3" />
              )
            }
          >
            {done ? "Complete" : inProgress ? "In progress" : "To do"}
          </StatusChip>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-subtle pt-3.5 text-body-sm text-fg-muted">
          {/* FR-09-02 — state AND owner */}
          <span className="flex items-center gap-1.5">
            {milestone.owner === "professional" ? (
              <UserCog aria-hidden="true" className="size-3.5" />
            ) : (
              <User aria-hidden="true" className="size-3.5" />
            )}
            {milestone.owner === "professional"
              ? "With the professional"
              : "Yours to do"}
          </span>
          {milestone.completedAt && (
            <span>{formatDate(milestone.completedAt)}</span>
          )}
        </div>

        {isCurrent && (
          <div className="mt-4">
            <MilestoneAction milestone={milestone} journeyId={journeyId} />
          </div>
        )}
      </div>
    </motion.li>
  );
}

/** The current milestone is the only one that offers a route onward. */
function MilestoneAction({
  milestone,
  journeyId,
}: {
  milestone: Milestone;
  journeyId: string;
}) {
  const HREF: Partial<Record<Milestone["key"], { label: string; href: string }>> =
    {
      journey_started: {
        label: "Set up your journey",
        href: routes.journeySetup(journeyId),
      },
      first_property_saved: {
        label: "Add a property",
        href: routes.addProperty(journeyId),
      },
      comparison_completed: {
        label: "Compare your properties",
        href: routes.compare(journeyId),
      },
      readiness_completed: {
        label: "Start Buyer Readiness",
        href: routes.readiness(journeyId),
      },
      professional_selected: {
        label: "Find a professional",
        href: routes.professionals(),
      },
    };

  const action = HREF[milestone.key];
  if (!action) {
    return (
      <p className="text-body-sm text-fg-muted">
        This one depends on the professional, not you.
      </p>
    );
  }

  if (!isBuilt(action.href)) {
    return (
      <p className="text-body-sm text-fg-muted">
        {action.label} — arrives in the next phase of this prototype.
      </p>
    );
  }

  return (
    <Link
      href={action.href}
      className="inline-flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
    >
      {action.label}
      <ArrowRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
