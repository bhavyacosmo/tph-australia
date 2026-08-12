"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Breadcrumbs,
  EmptyState,
  PageHeader,
  PageLayout,
  PageShell,
  RailPanel,
} from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { resolveNextAction } from "@/components/journey/next-action";
import {
  BAND,
  CATEGORIES,
  CATEGORY_STATE_LABEL,
  type CategoryKey,
  type CategoryState,
} from "@/lib/mock/readiness";
import { serviceFor } from "@/lib/mock/marketplace";
import type { ServiceKey } from "@/lib/mock/types";
import { formatDate } from "@/lib/format";
import { isBuilt, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { DialLegend, ReadinessDial } from "./readiness-dial";

/**
 * S16 — Readiness result and action plan.
 *
 * FR-04-10 · `[H1]` p.9 + `[VB]` p.8 — the output shows what is ready, what
 *            needs attention, what can wait, and the next recommended actions.
 *            All four appear below, in that order.
 * FR-04-11 · RDY-04 — never presented as lending approval. Restated on the
 *            screen itself, not only on the intro.
 * FR-04-14 — action-plan items are individually completable.
 * FR-04-15 — the action plan IS the "checklist" surface the mockups refer to.
 * RDY-02   — the question and formula versions used are recorded and shown.
 * RDY-03   — this screen renders the STORED result. It never re-scores.
 */
export function ReadinessResult({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const {
    readiness,
    readinessHistory,
    toggleActionItem,
    retakeReadiness,
    milestones,
  } = useJourneyStore();

  const next = resolveNextAction(milestones, journeyId);

  if (!readiness?.result || !readiness.completedAt) {
    return (
      <PageShell className="max-w-3xl">
        <div className="mt-10">
          <EmptyState
            icon={<Clock className="size-5" />}
            title="No result yet"
            body="Finish the six areas and your result appears here, with an action plan you can work through."
            action={
              <ButtonLink href={routes.readiness(journeyId)} variant="primary">
                Go to Buyer Readiness
              </ButtonLink>
            }
          />
        </div>
      </PageShell>
    );
  }

  /* RDY-03 — read the stored snapshot, never recompute */
  const { result } = readiness;
  const band = BAND[result.band];

  const grouped = (state: CategoryState) =>
    CATEGORIES.filter((c) => result.categoryStates[c.key] === state);

  const now = result.actions.filter((a) => a.urgency === "now");
  const later = result.actions.filter((a) => a.urgency === "can_wait");
  const doneCount = result.actions.filter((a) =>
    readiness.actionsDone.includes(a.id),
  ).length;

  const retake = () => {
    retakeReadiness();
    router.push(routes.readinessStep(journeyId, "1"));
  };

  return (
    <PageShell>
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: "Buyer readiness", href: routes.readiness(journeyId) },
          { label: "Your result" },
        ]}
      />

      <PageHeader
        className="mt-6"
        eyebrow="Buyer readiness"
        title="Where you're up to"
        subtitle={band.lede}
      />

      {/* ================================================== the dial, revealed
          Not a card grid: an asymmetric split with the dial weighted left and
          the per-area states beside it. */}
      <Reveal>
        <section
          aria-labelledby="dial-heading"
          className="mt-10 grid items-center gap-10 rounded-3xl border border-line-subtle bg-surface-card p-7 md:grid-cols-[auto_1fr] md:gap-14 md:p-10"
        >
          <h2 id="dial-heading" className="sr-only">
            Your readiness by area
          </h2>
          <ReadinessDial
            categoryStates={result.categoryStates}
            bandLabel={band.label}
            className="mx-auto md:mx-0"
          />
          <div className="min-w-0">
            <DialLegend categoryStates={result.categoryStates} />
            <p className="mt-6 border-t border-line-subtle pt-5 text-body-sm text-fg-muted">
              Six areas, each assessed on its own answers. There is no total and
              no number — see how this was worked out in the panel below.
            </p>
          </div>
        </section>
      </Reveal>

      <PageLayout
        rail={
          <div className="space-y-5">
            {/* FR-04-11 · RDY-04 — restated where the result actually is */}
            <RailPanel tone="sunken">
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-attention-fg"
                />
                <span>
                  <span className="block font-medium text-fg-heading">
                    Guidance, not approval
                  </span>
                  This is not a credit score, a pre-approval or a guarantee, and
                  it does not affect what any lender will do.
                </span>
              </p>
            </RailPanel>

            {/* FR-04-08 transparency + RDY-02 versions */}
            <RailPanel title="How this was worked out">
              <ol className="space-y-2.5 text-body-sm text-fg-secondary">
                <li>1. Each answer maps to ready, partly there, or needs attention.</li>
                <li>2. An area is ready when every answer in it is ready, and needs attention if any answer does.</li>
                <li>3. The band comes from counting areas — never from a score.</li>
                <li>4. Each action comes from the answer you gave, with its urgency set in advance.</li>
              </ol>
              <dl className="mt-4 space-y-1 border-t border-line-subtle pt-4 text-caption text-fg-muted">
                <div className="flex justify-between gap-3">
                  <dt>Completed</dt>
                  <dd>{formatDate(readiness.completedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Questions</dt>
                  <dd className="tabular">{result.questionVersion}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Formula</dt>
                  <dd className="tabular">{result.formulaVersion}</dd>
                </div>
              </dl>
              <p className="mt-3 text-caption text-fg-muted">
                Marked <span className="tabular">draft</span> because the client
                has not yet supplied the question set or the formula — the result
                you see uses our documented placeholder.
              </p>
            </RailPanel>

            {/* FR-04-13 · RDY-06 */}
            <RailPanel title="Take it again">
              <p className="text-body-sm text-fg-secondary">
                Things change. Retaking keeps this result in your history rather
                than overwriting it.
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={retake}
                className="mt-4"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Retake the assessment
              </Button>
              {readinessHistory.length > 1 && (
                <p className="mt-3 text-caption text-fg-muted">
                  {readinessHistory.length} assessments in your history.
                </p>
              )}
            </RailPanel>
          </div>
        }
      >
        {/* ========================================= 1 · what's ready, 2 · what
            needs attention, 3 · what can wait — FR-04-10's first three states */}
        {/* PM wireframe §3 asks the result to answer four questions directly:
            what the buyer already HAS, what is MISSING, what STEPS are required,
            and what SERVICES might help. The underlying model is unchanged —
            these are the same four documented states (FR-04-10), relabelled to
            answer those questions in the buyer's own words. */}
        <div className="space-y-8">
          <StateGroup
            title="What you already have"
            tone="success"
            body="Sorted. Nothing needed here."
            categories={grouped("ready")}
            states={result.categoryStates}
            empty="Nothing is fully signed off yet — that's normal this early."
          />
          <StateGroup
            title="What's missing"
            tone="attention"
            body="Worth closing off before you make an offer."
            categories={grouped("attention")}
            states={result.categoryStates}
            empty="Nothing urgent is outstanding."
          />
          <StateGroup
            title="What can wait"
            tone="info"
            body="Real, but not blocking anything today."
            categories={grouped("can_wait")}
            states={result.categoryStates}
            empty="Nothing parked here."
          />
        </div>

        {/* Services that could help — wireframe §3's fourth item. Derived from
            which categories need attention, mapped to the four launch services.
            No new logic: it reads the states that already exist. */}
        <ServicesSuggested
          attention={grouped("attention").map((c) => c.key)}
          journeyId={journeyId}
        />

        {/* ======================================= 4 · next recommended actions
            FR-04-14/15 — the action plan, individually completable. This is the
            checklist surface. */}
        <section aria-labelledby="plan-heading" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="plan-heading" className="text-h2 text-fg-heading">
                Your action plan
              </h2>
              <p className="measure mt-3 text-body text-fg-secondary">
                Built from your answers. Tick things off as you go — it saves
                straight away.
              </p>
            </div>
            {result.actions.length > 0 && (
              <p className="tabular text-body-sm text-fg-muted">
                {doneCount} of {result.actions.length} done
              </p>
            )}
          </div>

          {/* Progress across the plan, so ticking an item visibly moves it */}
          {result.actions.length > 0 && (
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line-subtle">
              <motion.div
                initial={reduce ? undefined : { scaleX: 0 }}
                animate={{ scaleX: doneCount / result.actions.length }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ originX: 0 }}
                className="h-full w-full rounded-full bg-action"
              />
            </div>
          )}

          {result.actions.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-line-subtle bg-trustlink-wash p-6 text-body text-fg-secondary">
              Nothing to add. Every answer you gave was already in good shape —
              which means the next step is the property side, not the paperwork.
            </p>
          ) : (
            <div className="mt-8 space-y-10">
              <ActionList
                title="Do these next"
                items={now}
                done={readiness.actionsDone}
                onToggle={toggleActionItem}
              />
              <ActionList
                title="When you get to it"
                items={later}
                done={readiness.actionsDone}
                onToggle={toggleActionItem}
              />
            </div>
          )}
        </section>

        {/* ------------------------------------------------ the one next step */}
        <Reveal>
          <section className="mt-14 rounded-3xl bg-brand p-7 text-white md:p-9">
            <p className="text-overline uppercase text-white/60">
              {next.eyebrow}
            </p>
            <h2 className="mt-4 max-w-xl text-h2 text-white">{next.title}</h2>
            <p className="measure mt-4 text-body text-white/75">{next.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {next.pending || !isBuilt(next.href(journeyId)) ? (
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
              <p className="flex items-start gap-2.5 text-body-sm text-white/55">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                Your answers stay with you. Nothing here is shared with a
                professional.
              </p>
            </div>
          </section>
        </Reveal>
      </PageLayout>
    </PageShell>
  );
}

/* ---------------------------------------------------------------- services */

/**
 * "What services or professional help may be needed" — PM wireframe §3.
 *
 * Maps the categories that need attention onto the four launch services. This is
 * a suggestion, not a referral: it does not contact anyone, and creating a Trust
 * Link is still an explicit act by the buyer.
 *
 * Finance deliberately has no service attached — a broker sits outside the agreed
 * Stage 1 categories ([SG] p.5), and the copy says so rather than quietly
 * offering something we do not have.
 */
function ServicesSuggested({
  attention,
  journeyId,
}: {
  attention: CategoryKey[];
  journeyId: string;
}) {
  void journeyId;

  const MAP: Partial<Record<CategoryKey, ServiceKey>> = {
    due_diligence: "building_inspector",
    criteria: "buyers_agent",
    documents: "conveyancer",
    decision: "buyers_agent",
  };

  const suggested = Array.from(
    new Set(
      attention
        .map((key) => MAP[key])
        .filter((s): s is ServiceKey => Boolean(s)),
    ),
  );

  const financeFlagged =
    attention.includes("finances") || attention.includes("borrowing");

  if (suggested.length === 0 && !financeFlagged) return null;

  return (
    <section aria-labelledby="services-heading" className="mt-12">
      <h2 id="services-heading" className="text-h3 text-fg-heading">
        Who could help with this
      </h2>
      <p className="measure mt-2 text-body-sm text-fg-muted">
        Suggestions based on what needs attention. Nothing is sent, and nobody is
        contacted until you authorise a Trust Link.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {suggested.map((key) => {
          const service = serviceFor(key);
          return (
            <li
              key={key}
              className="rounded-2xl border border-line-subtle bg-surface-card p-5"
            >
              <p className="text-h4 text-fg-heading">{service.label}</p>
              <p className="measure mt-2 text-body-sm text-fg-secondary">
                {service.blurb}
              </p>
              {isBuilt(routes.trustLinkNew()) && (
                <ButtonLink
                  href={`${routes.trustLinkNew()}?service=${key}`}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                >
                  Find someone
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </ButtonLink>
              )}
            </li>
          );
        })}

        {financeFlagged && (
          <li className="rounded-2xl border border-dashed border-line bg-surface-card p-5">
            <p className="text-h4 text-fg-heading">Finance</p>
            <p className="measure mt-2 text-body-sm text-fg-secondary">
              A broker or lender would help here, but they are not one of the
              categories we connect at this stage — so this one is yours to
              arrange.
            </p>
          </li>
        )}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------- groups */

function StateGroup({
  title,
  tone,
  body,
  categories,
  states,
  empty,
}: {
  title: string;
  tone: "success" | "attention" | "info";
  body: string;
  categories: { key: CategoryKey; label: string; covers: string }[];
  states: Record<CategoryKey, CategoryState>;
  empty: string;
}) {
  return (
    <section aria-labelledby={`group-${title}`}>
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id={`group-${title}`} className="text-h4 text-fg-heading">
          {title}
        </h2>
        <StatusChip tone={tone}>{categories.length}</StatusChip>
        <p className="text-body-sm text-fg-muted">{body}</p>
      </div>

      {categories.length === 0 ? (
        <p className="mt-3 text-body-sm text-fg-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line-subtle border-y border-line-subtle">
          {categories.map((category) => (
            <li
              key={category.key}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
            >
              <span className="text-body font-medium text-fg-heading">
                {category.label}
              </span>
              <span className="text-body-sm text-fg-muted">
                {category.covers}
              </span>
              <span className="sr-only">
                {CATEGORY_STATE_LABEL[states[category.key]]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ actions */

function ActionList({
  title,
  items,
  done,
  onToggle,
}: {
  title: string;
  items: { id: string; text: string; category: CategoryKey }[];
  done: string[];
  onToggle: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-overline uppercase text-fg-muted">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => {
          const isDone = done.includes(item.id);
          const category = CATEGORIES.find((c) => c.key === item.category);
          return (
            <motion.li
              key={item.id}
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: Math.min(i, 6) * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={isDone}
                className={cn(
                  "group flex w-full items-start gap-3.5 rounded-xl border p-4 text-left",
                  "transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                  isDone
                    ? "border-line-subtle bg-surface-sunken"
                    : "border-line-subtle bg-surface-card hover:border-line",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[0.3rem] border-2 transition-colors duration-[var(--duration-fast)]",
                    isDone
                      ? "border-action bg-action text-white"
                      : "border-line bg-surface-card group-hover:border-line-strong",
                  )}
                >
                  {isDone && <Check className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-body",
                      isDone
                        ? "text-fg-muted line-through"
                        : "text-fg-heading",
                    )}
                  >
                    {item.text}
                  </span>
                  {category && (
                    <span className="mt-0.5 block text-caption text-fg-muted">
                      {category.label}
                    </span>
                  )}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
