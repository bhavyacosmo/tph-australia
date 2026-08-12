"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Columns3,
  FileText,
  Home,
  Link2,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { PropertyCard } from "@/components/domain/property-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { resolveNextAction } from "@/components/journey/next-action";
import { BAND } from "@/lib/mock/readiness";
import { formatDate, formatRelative } from "@/lib/format";
import { SHORTLIST_LIMIT } from "@/lib/mock/seed";
import { isBuilt, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * S19 — Prop ID overview. **The return surface**, ranked #4 highest-risk.
 * Reference R9 — stat tiles and an activity timeline.
 *
 * FR-05-10  shows the most recently active journey
 * FR-05-11  surfaces the next unfinished action AND any returned output
 * FR-05-12  continue from the last saved state
 * FR-05-13  shows when data was last saved
 *
 * The test is "100% of returning users resume without help". So the resume block
 * comes first and carries the only filled button; the counts and the timeline
 * answer the *second* question a returning user has — what changed — not the
 * first.
 */
export function PropIdOverview() {
  const reduce = useReducedMotion();
  const {
    state,
    journey,
    activeProperties,
    comparison,
    readiness,
    milestones,
    activity,
  } = useJourneyStore();

  const next = resolveNextAction(milestones, journey.id);
  const completed = milestones.filter((m) => m.state === "done").length;
  const result = readiness?.result;

  const tiles = [
    {
      label: "Saved properties",
      value: activeProperties.length,
      suffix: `of ${SHORTLIST_LIMIT}`,
      icon: Home,
      href: routes.propIdProperties(),
    },
    {
      label: "Comparisons",
      value: state.comparisons.filter((c) => c.completedAt).length,
      icon: Columns3,
      href: routes.propIdComparisons(),
    },
    {
      label: "Trust Links",
      value: 0,
      icon: Link2,
      href: routes.propIdTrustLinks(),
    },
    {
      label: "Reports received",
      value: 0,
      icon: FileText,
      href: routes.propIdOutputs(),
    },
  ];

  return (
    <div>
      {/* ================================================= resume, first thing */}
      <Reveal>
        <section
          aria-labelledby="resume-heading"
          className="rounded-3xl border border-line-subtle bg-surface-card p-6 md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-overline uppercase text-fg-muted">
                Where you were
              </p>
              <h1 id="resume-heading" className="mt-3 text-h2 text-fg-heading">
                {journey.name}
              </h1>
              <p className="mt-2 text-body text-fg-secondary">
                {/* FR-05-13 */}
                Last saved {formatRelative(journey.lastSavedAt)}
                <span className="text-fg-muted">
                  {" "}
                  · {formatDate(journey.lastSavedAt)}
                </span>
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-overline uppercase text-fg-muted">Progress</p>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tabular text-h1 font-bold text-fg-heading">
                  <AnimatedNumber value={completed} />
                </span>
                <span className="text-body text-fg-muted">
                  of {milestones.length} steps
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line-subtle pt-6">
            {next.pending ? (
              <span className="inline-flex min-h-11 items-center rounded-md border border-line-subtle bg-surface-sunken px-5 text-body-sm text-fg-muted">
                {next.cta} — arrives in the next phase
              </span>
            ) : (
              <ButtonLink
                href={next.href(journey.id)}
                variant="primary"
                className="group"
              >
                {next.cta}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                />
              </ButtonLink>
            )}
            <p className="text-body-sm text-fg-secondary">
              {/* FR-05-11 — the next unfinished action, named */}
              Next: {next.title.toLowerCase()}
            </p>
          </div>
        </section>
      </Reveal>

      {/* ============================================================== tiles */}
      <RevealGroup
        className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle lg:grid-cols-4"
        stagger={0.05}
      >
        {tiles.map((tile) => (
          <RevealItem key={tile.label}>
            <Link
              href={tile.href}
              className="block h-full bg-surface-card p-5 transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken"
            >
              <tile.icon aria-hidden="true" className="size-4 text-fg-muted" />
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tabular text-h2 font-bold text-fg-heading">
                  <AnimatedNumber value={tile.value} />
                </span>
                {tile.suffix && (
                  <span className="text-body-sm text-fg-muted">
                    {tile.suffix}
                  </span>
                )}
              </p>
              <p className="mt-1 text-body-sm text-fg-secondary">{tile.label}</p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* ================================= readiness + activity, side by side */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* ------------------------------------------------------- readiness */}
        <section
          aria-labelledby="readiness-summary"
          className="rounded-2xl border border-line-subtle bg-surface-card p-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="readiness-summary" className="text-h4 text-fg-heading">
              Buyer readiness
            </h2>
            <Link
              href={routes.propIdReadiness()}
              className="text-body-sm text-fg-link underline-offset-4 hover:underline"
            >
              History
            </Link>
          </div>

          {result ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <StatusChip tone="success">Completed</StatusChip>
                <p className="text-body font-medium text-fg-heading">
                  {BAND[result.band].label}
                </p>
              </div>
              <p className="measure mt-3 text-body-sm text-fg-secondary">
                {BAND[result.band].lede}
              </p>
              <p className="mt-4 text-body-sm text-fg-muted">
                {result.actions.filter((a) =>
                  readiness?.actionsDone.includes(a.id),
                ).length}{" "}
                of {result.actions.length} action items done
              </p>
              <Link
                href={routes.readinessResult(journey.id)}
                className="mt-4 flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
              >
                Open your action plan
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </>
          ) : (
            <>
              <div className="mt-4">
                <StatusChip tone={readiness ? "info" : "neutral"}>
                  {readiness ? "In progress" : "Not started"}
                </StatusChip>
              </div>
              <p className="measure mt-3 text-body-sm text-fg-secondary">
                Six short areas, then a plain list of what&apos;s done, what needs
                attention and what can wait. Guidance, not approval.
              </p>
              <Link
                href={routes.readiness(journey.id)}
                className="mt-4 flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
              >
                {readiness ? "Continue the assessment" : "Start Buyer Readiness"}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </>
          )}
        </section>

        {/* ------------------------- FR-05-11 — what changed since last time */}
        <section
          aria-labelledby="activity-summary"
          className="rounded-2xl border border-line-subtle bg-surface-card p-6"
        >
          <h2 id="activity-summary" className="text-h4 text-fg-heading">
            What changed
          </h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-body-sm text-fg-muted">
              Nothing yet. Your activity appears here as you go.
            </p>
          ) : (
            <ol className="relative mt-5 space-y-4">
              <span
                aria-hidden="true"
                className="absolute bottom-2 left-[0.3125rem] top-2 w-px bg-line-subtle"
              />
              {activity.slice(0, 6).map((entry, i) => (
                <motion.li
                  key={entry.id}
                  initial={reduce ? undefined : { opacity: 0, x: -6 }}
                  whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.34,
                    delay: i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative flex gap-3"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-surface-card",
                      i === 0 ? "bg-action" : "bg-line-strong",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-body-sm text-fg">
                      {entry.what}
                    </span>
                    <span className="block text-caption text-fg-muted">
                      {formatRelative(entry.at)}
                    </span>
                  </span>
                </motion.li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* ==================================== professional connection state
          FR-05-07 — the Trust Link record. Empty for this user, and that emptiness
          is the product's promise rather than a gap, so it is stated positively. */}
      <Reveal>
        <section
          aria-labelledby="connections-heading"
          className="mt-10 rounded-2xl border border-transparent bg-trustlink-wash p-6 md:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 id="connections-heading" className="text-h4 text-fg-heading">
                Professional connections
              </h2>
              <p className="measure mt-3 flex items-start gap-3 text-body text-fg-secondary">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-action"
                />
                <span>
                  You have no active Trust Links, so nobody outside this record
                  can see any of it. When you connect with a professional you
                  choose exactly what they see and for how long — and you can
                  withdraw it.
                </span>
              </p>
            </div>
            <div className="shrink-0">
              {isBuilt(routes.professionals()) ? (
                <ButtonLink href={routes.professionals()} variant="secondary">
                  Find a professional
                </ButtonLink>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-md border border-dashed border-line px-4 text-body-sm text-fg-muted">
                  Finding a professional arrives next phase
                </span>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ==================================================== saved properties */}
      <section aria-labelledby="saved-heading" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="saved-heading" className="text-h3 text-fg-heading">
            Saved properties
          </h2>
          <Link
            href={routes.propIdProperties()}
            className="flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
          >
            See all
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        {activeProperties.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-surface-card px-5 py-8 text-center text-body-sm text-fg-muted">
            Nothing saved yet. Properties you save appear here.
          </p>
        ) : (
          <RevealGroup className="mt-5 space-y-3" stagger={0.05}>
            {activeProperties.slice(0, 4).map((property) => (
              <RevealItem key={property.id}>
                <Link
                  href={routes.property(journey.id, property.id)}
                  className="block rounded-xl transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
                >
                  <PropertyCard property={property} variant="summary" />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>

      {/* FR-05-14/15 — the boundary, stated on the record screen itself */}
      <p className="mt-12 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          Prop ID holds your journey, not your paperwork. It isn&apos;t a document
          vault, and the only files kept here are ones a professional you
          authorised sent back to you.
        </span>
      </p>
    </div>
  );
}
