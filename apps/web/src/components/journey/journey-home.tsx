"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Columns3,
  Compass,
  Link2,
  Lock,
  Map,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserSearch,
} from "lucide-react";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, PageLayout, PageShell, RailPanel } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  BUYING_STAGE_LABEL,
  HELP_WANTED_LABEL,
  SHORTLIST_LIMIT,
  TIMING_LABEL,
} from "@/lib/mock/seed";
import { isBuilt, routes } from "@/lib/routes";
import { BAND } from "@/lib/mock/readiness";
import { formatPrice, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { resolveNextAction } from "./next-action";

/**
 * S09 — Buyer journey home. Reference R8.
 *
 * FR-02-02 requires SIX things on this screen: journey name and status · next
 * recommended action · saved property and comparison counts · readiness
 * completion state · active Trust Link status · basic Progress Map milestones.
 *
 * FR-02-03 requires exactly ONE dominant next action.
 *
 * Those two pull against each other, and resolving that tension is the whole
 * design problem here — it is why this screen is ranked #8 highest-risk in the
 * inventory. The resolution:
 *
 *   · the next action is a full-width navy panel with the only filled button on
 *     the screen — impossible to miss, impossible to confuse with anything else
 *   · the four state counts are a hairline-separated strip, not four cards, so
 *     they read as one status line rather than four competing calls to action
 *   · the tools are a quiet 2×2 grid below the fold of attention
 *   · the eight milestones live in the rail, compressed
 *
 * Nothing else on this page uses a filled button.
 */
export function JourneyHome({ journeyId }: { journeyId: string }) {
  const reduce = useReducedMotion();
  const {
    journey,
    activeProperties,
    comparison,
    readiness,
    milestones,
    hydrated,
  } = useJourneyStore();

  const next = resolveNextAction(milestones, journeyId);
  const completed = milestones.filter((m) => m.state === "done").length;

  const trustLinkState = milestones.find(
    (m) => m.key === "trust_link_authorised",
  )?.state;

  const stats = [
    {
      label: "Saved properties",
      value: activeProperties.length,
      of: SHORTLIST_LIMIT,
      href: routes.shortlist(journeyId),
    },
    {
      label: "Comparison",
      text: comparison?.completedAt
        ? `Saved ${formatRelative(comparison.completedAt)}`
        : comparison
          ? "In progress"
          : "Not started",
      href: routes.compare(journeyId),
    },
    {
      label: "Buyer readiness",
      /*
        Reads the assessment itself, not only the milestone, so the band the user
        actually got is what appears here — the working area and the record must
        never disagree.
      */
      text: readiness?.result
        ? BAND[readiness.result.band].label
        : readiness
          ? "In progress"
          : "Not started",
      href: routes.readiness(journeyId),
    },
    {
      label: "Trust Links",
      text:
        trustLinkState === "done"
          ? "1 active"
          : trustLinkState === "in_progress"
            ? "In progress"
            : "None yet",
      href: routes.propIdTrustLinks(),
    },
  ];

  /**
   * The buyer's tools — PM wireframe §8 wants Prop ID, Properties, Comparison,
   * Readiness, Connections, Home Compass, Progress Map and Profile all reachable.
   * Search is first because the client's highest-volume visitor arrives looking
   * for properties (transcript L235-243).
   */
  const tools = [
    {
      label: "Property search",
      body: "Find homes and save the ones worth considering.",
      href: routes.search(),
      icon: Search,
      tint: "bg-info-bg text-info-fg",
    },
    {
      label: "Shortlist",
      body: "Add, rank and organise up to eight homes.",
      href: routes.shortlist(journeyId),
      icon: SlidersHorizontal,
      tint: "bg-neutral-bg text-neutral-fg",
    },
    {
      label: "Compare",
      body: "Side by side, on the criteria you choose.",
      href: routes.compare(journeyId),
      icon: Columns3,
      tint: "bg-trustlink-wash text-action",
    },
    {
      label: "Buyer readiness",
      body: "Six areas, then a short action plan.",
      href: routes.readiness(journeyId),
      icon: ClipboardCheck,
      tint: "bg-attention-bg text-attention-fg",
    },
    {
      label: "Find a professional",
      body: "Read profiles privately. Nothing is sent.",
      href: routes.professionals(),
      icon: UserSearch,
      tint: "bg-neutral-bg text-neutral-fg",
    },
    {
      label: "Your connections",
      body: "Trust Links you've authorised, and what each shares.",
      href: routes.propIdTrustLinks(),
      icon: Link2,
      tint: "bg-trustlink-wash text-action",
    },
    {
      label: "Progress Map",
      body: "Where you are across the whole purchase.",
      href: routes.propIdProgress(),
      icon: Map,
      tint: "bg-info-bg text-info-fg",
    },
    {
      label: "Your Prop ID",
      body: "Properties, notes, decisions and documents in one record.",
      href: routes.propId(),
      icon: Lock,
      tint: "bg-propid-surface text-propid-surface-fg",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Compass aria-hidden="true" className="size-3.5" />
            Home Compass
          </span>
        }
        title={journey.name}
        subtitle={
          <>
            {journey.stage ? BUYING_STAGE_LABEL[journey.stage] : "Getting started"}
            {journey.targetArea && ` · ${journey.targetArea}`}
            {journey.timing && ` · ${TIMING_LABEL[journey.timing]}`}
          </>
        }
        actions={
          <StatusChip tone="success">
            {completed} of {milestones.length} steps done
          </StatusChip>
        }
      />

      <PageLayout
        rail={
          <div className="space-y-5">
            {/* ------------------------------------ Progress Map Lite (rail) */}
            <RailPanel title="Your progress">
              <ol className="space-y-0">
                {milestones.map((m, i) => (
                  <li
                    key={m.key}
                    className="flex items-start gap-3 border-b border-line-subtle py-2.5 last:border-0 last:pb-0 first:pt-0"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[0.625rem] font-semibold",
                        m.state === "done" && "border-action bg-action text-white",
                        m.state === "in_progress" &&
                          "border-action bg-surface-card text-action",
                        m.state === "todo" &&
                          "border-line bg-surface-card text-fg-muted",
                      )}
                    >
                      {m.state === "done" ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="tabular">{i + 1}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-body-sm",
                          m.state === "todo"
                            ? "text-fg-secondary"
                            : "font-medium text-fg-heading",
                        )}
                      >
                        {m.label}
                      </span>
                      {m.state === "in_progress" && (
                        <span className="text-caption text-action">
                          In progress
                        </span>
                      )}
                      {/* FR-09-02 — milestone state AND owner */}
                      {m.owner === "professional" && m.state !== "done" && (
                        <span className="text-caption text-fg-muted">
                          With the professional
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              {isBuilt(routes.propIdProgress()) && (
                <Link
                  href={routes.propIdProgress()}
                  className="mt-4 flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
                >
                  Open the Progress Map
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              )}
            </RailPanel>

            {/* ------------------------------------------------ journey setup */}
            <RailPanel title="Your journey" tone="sunken">
              <dl className="space-y-3 text-body-sm">
                <div>
                  <dt className="text-fg-muted">Area</dt>
                  <dd className="mt-0.5 text-fg">
                    {journey.targetArea || "Not set"}
                  </dd>
                </div>
                {/* PM wireframe §2 — the new setup answers, made visible */}
                <div>
                  <dt className="text-fg-muted">Looking for</dt>
                  <dd className="mt-0.5 text-fg">
                    {journey.requirements.propertyTypes.length > 0
                      ? journey.requirements.propertyTypes.join(", ")
                      : "Not set"}
                    {journey.requirements.minBeds !== null &&
                      ` · ${journey.requirements.minBeds}+ beds`}
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted">Budget</dt>
                  <dd className="mt-0.5 text-fg">
                    {journey.budget.max
                      ? `Up to ${formatPrice(journey.budget.max)}`
                      : "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted">What you wanted help with</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {journey.helpWanted.length === 0 ? (
                      <span className="text-fg">Not set</span>
                    ) : (
                      journey.helpWanted.map((h) => (
                        <StatusChip key={h} tone="neutral">
                          {HELP_WANTED_LABEL[h]}
                        </StatusChip>
                      ))
                    )}
                  </dd>
                </div>
              </dl>
              <Link
                href={routes.journeySetup(journeyId)}
                className="mt-4 flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
              >
                Change your answers
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </RailPanel>

            {/* -------------------------------------------------- reassurance */}
            <RailPanel tone="wash">
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-action"
                />
                <span>
                  Nothing here is visible to anyone else. No professional sees
                  your details until you authorise a Trust Link — and you choose
                  what it contains.
                </span>
              </p>
            </RailPanel>
          </div>
        }
      >
        {/* ============================================= THE dominant action */}
        <Reveal>
          <section
            aria-labelledby="next-action-heading"
            className="relative isolate overflow-hidden rounded-3xl bg-brand p-7 text-white md:p-9"
          >
            <div aria-hidden="true" className="grain absolute inset-0" />
            <div className="relative">
              <p className="text-overline uppercase text-white/60">
                {next.eyebrow}
              </p>
              <h2
                id="next-action-heading"
                className="mt-4 max-w-xl text-h2 text-white"
              >
                {next.title}
              </h2>
              <p className="measure mt-4 text-body text-white/75">{next.body}</p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {next.pending ? (
                  /*
                    The action is real but its screen arrives in a later phase of
                    this prototype. Rendering an inert control with an honest
                    label beats linking to a 404 (`ENT-01`).
                  */
                  <span className="inline-flex min-h-13 items-center rounded-md border border-white/20 bg-white/10 px-7 text-body text-white/70">
                    {next.cta} — arrives in the next phase
                  </span>
                ) : (
                  <ButtonLink
                    href={next.href(journeyId)}
                    variant="primary"
                    size="lg"
                    className="group"
                  >
                    {next.cta}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </ButtonLink>
                )}
                <p className="text-body-sm text-white/55">
                  One step at a time. Everything saves as you go.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ================================================== state, at a glance
            FR-02-02's counts. A hairline strip, not four cards — four cards here
            would compete with the action above and break FR-02-03. */}
        <RevealGroup
          className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle lg:grid-cols-4"
          stagger={0.05}
        >
          {stats.map((stat) => {
            const built = isBuilt(stat.href);
            const body = (
              <>
                <dt className="text-overline uppercase text-fg-muted">
                  {stat.label}
                </dt>
                <dd className="mt-2 flex items-baseline gap-1.5">
                  {stat.value !== undefined ? (
                    <>
                      <span className="tabular text-h2 font-bold text-fg-heading">
                        {hydrated ? (
                          <AnimatedNumber value={stat.value} />
                        ) : (
                          stat.value
                        )}
                      </span>
                      <span className="text-body-sm text-fg-muted">
                        of {stat.of}
                      </span>
                    </>
                  ) : (
                    <span className="text-body font-medium text-fg-heading">
                      {stat.text}
                    </span>
                  )}
                </dd>
              </>
            );

            return (
              <RevealItem key={stat.label}>
                {built ? (
                  <Link
                    href={stat.href}
                    className="block h-full bg-surface-card p-5 transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken"
                  >
                    <dl>{body}</dl>
                  </Link>
                ) : (
                  <div className="h-full bg-surface-card p-5">
                    <dl>{body}</dl>
                  </div>
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* ========================================================== tools
            R8's tool launcher. Secondary by construction: no filled buttons,
            quieter type, pastel icon tiles. */}
        <section aria-labelledby="tools-heading" className="mt-12">
          <h2 id="tools-heading" className="text-h3 text-fg-heading">
            Your tools
          </h2>
          <RevealGroup
            className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            stagger={0.05}
          >
            {tools.map((tool) => {
              const built = isBuilt(tool.href);
              const inner = (
                <>
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full",
                      tool.tint,
                    )}
                  >
                    <tool.icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-body font-semibold text-fg-heading">
                      {tool.label}
                      {!built && (
                        <span className="text-caption font-normal text-fg-muted">
                          next phase
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-body-sm text-fg-secondary">
                      {tool.body}
                    </span>
                  </span>
                  {built && (
                    <ArrowRight
                      aria-hidden="true"
                      className="ml-auto size-4 shrink-0 self-center text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/tool:translate-x-0.5"
                    />
                  )}
                </>
              );

              const shell =
                "group/tool flex items-start gap-4 rounded-2xl border p-5 transition-[border-color,box-shadow,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]";

              return (
                <RevealItem key={tool.label}>
                  {built ? (
                    <Link
                      href={tool.href}
                      className={cn(
                        shell,
                        "border-line-subtle bg-surface-card hover:border-line hover:shadow-elev-2",
                      )}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      aria-disabled="true"
                      className={cn(shell, "border-dashed border-line-subtle bg-surface-card opacity-70")}
                    >
                      {inner}
                    </div>
                  )}
                </RevealItem>
              );
            })}
          </RevealGroup>
        </section>

        {/* ------------------------------------------------- role boundary */}
        <p className="mt-12 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Home Compass helps you organise and decide. It isn&apos;t lending,
            legal or valuation advice, and nothing here is a guarantee of an
            outcome.
          </span>
        </p>
      </PageLayout>
    </PageShell>
  );
}
