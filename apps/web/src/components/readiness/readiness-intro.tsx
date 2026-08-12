"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Clock, Lock } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Breadcrumbs,
  PageHeader,
  PageLayout,
  PageShell,
  RailPanel,
} from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  CATEGORIES,
  FORMULA_VERSION,
  QUESTION_VERSION,
  TOTAL_QUESTIONS,
} from "@/lib/mock/readiness";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * S14 — Readiness intro.
 *
 * FR-04-11 / RDY-04 — the result MUST NEVER be presented as lending approval.
 * `[H1]` p.9: "A guidance score and action plan, not a credit score,
 * pre-approval or guarantee."
 *
 * That disclaimer is the reason this screen exists as its own step rather than a
 * line above question one. It is stated before the user invests any effort, in
 * the largest type on the page after the title, and it names the three things
 * this is not. Putting it at the end would be a dark pattern.
 *
 * The six categories are listed with the exact topics `[H1]` p.9 specifies, so
 * the user knows the shape of what they are agreeing to before starting
 * (FR-02-07 — assumptions shown).
 */
export function ReadinessIntro({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const { readiness, startReadiness, retakeReadiness } = useJourneyStore();

  const inProgress = readiness && !readiness.completedAt;
  const completed = readiness?.completedAt ? readiness : undefined;

  const begin = () => {
    const id = startReadiness();
    void id;
    router.push(
      routes.readinessStep(journeyId, String(readiness?.currentStep ?? 1)),
    );
  };

  const retake = () => {
    retakeReadiness();
    router.push(routes.readinessStep(journeyId, "1"));
  };

  return (
    <PageShell className="max-w-5xl">
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: "Buyer readiness" },
        ]}
      />

      <PageHeader
        className="mt-6"
        eyebrow="Step four"
        title="How ready are you to buy?"
        subtitle="Six short areas, about twenty questions, roughly five minutes. You'll get back a plain list of what's done, what needs attention and what can wait."
      />

      <PageLayout
        rail={
          <div className="space-y-5">
            <RailPanel title="What you'll get" tone="sunken">
              <ul className="space-y-3 text-body-sm text-fg-secondary">
                <li>A state for each of the six areas.</li>
                <li>An action plan you can tick off as you go.</li>
                <li>One recommended next step.</li>
              </ul>
              <p className="mt-4 flex items-center gap-2 border-t border-line-subtle pt-4 text-body-sm text-fg-muted">
                <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                About 5 minutes. Stop any time.
              </p>
            </RailPanel>

            <RailPanel tone="wash">
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                <Lock
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-action"
                />
                <span>
                  Your answers stay in your own record. No lender, broker or
                  professional sees them, and nothing here is an application.
                </span>
              </p>
            </RailPanel>

            {/* FR-04-08 transparency, and the open question stated honestly */}
            <RailPanel title="How this is worked out">
              <p className="text-body-sm text-fg-secondary">
                Every answer maps to <em>ready</em>, <em>partly there</em> or{" "}
                <em>needs attention</em>. An area is ready when all its answers
                are. There is no hidden total and no number.
              </p>
              <dl className="mt-4 space-y-1 border-t border-line-subtle pt-4 text-caption text-fg-muted">
                <div className="flex justify-between gap-3">
                  <dt>Questions</dt>
                  <dd className="tabular">{QUESTION_VERSION}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Formula</dt>
                  <dd className="tabular">{FORMULA_VERSION}</dd>
                </div>
              </dl>
            </RailPanel>
          </div>
        }
      >
        {/* =============================================== the disclaimer first
            FR-04-11 · RDY-04. Stated before any effort is asked for. */}
        <Reveal>
          <section
            aria-labelledby="not-approval-heading"
            className="rounded-2xl border border-attention-line bg-attention-bg p-6 md:p-7"
          >
            <p className="flex items-start gap-3">
              <AlertTriangle
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-attention-fg"
              />
              <span>
                <span
                  id="not-approval-heading"
                  className="block text-h3 text-fg-heading"
                >
                  This is guidance, not approval
                </span>
                <span className="measure mt-3 block text-body text-fg-secondary">
                  It is not a credit score, not a pre-approval and not a
                  guarantee. We are not a lender, a broker or a financial
                  adviser, and nothing here affects what anyone will lend you.
                  It is a checklist that tells you what to sort out next.
                </span>
              </span>
            </p>
          </section>
        </Reveal>

        {/* -------------------------------------------------- resume / retake */}
        {(inProgress || completed) && (
          <Reveal>
            <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-line-subtle bg-surface-card p-6">
              <div className="min-w-0">
                <StatusChip tone={completed ? "success" : "info"}>
                  {completed ? "Completed" : "In progress"}
                </StatusChip>
                <p className="mt-3 text-body text-fg-secondary">
                  {completed ? (
                    <>
                      You completed this{" "}
                      {formatRelative(completed.completedAt as string)}.
                    </>
                  ) : (
                    <>
                      You&apos;re part-way through — question{" "}
                      {Object.keys(readiness?.answers ?? {}).length + 1} of{" "}
                      {TOTAL_QUESTIONS}. Nothing was lost.
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {completed ? (
                  <>
                    <ButtonLink
                      href={routes.readinessResult(journeyId)}
                      variant="primary"
                    >
                      See your result
                    </ButtonLink>
                    {/* FR-04-13 · RDY-06 */}
                    <Button variant="secondary" onClick={retake}>
                      Take it again
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={begin} className="group">
                    Continue where you left off
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </Button>
                )}
              </div>
            </section>
          </Reveal>
        )}

        {/* ------------------------------------------------------ the six areas
            Listed with [H1] p.9's exact topics — an editorial numbered list,
            not six cards. */}
        <section aria-labelledby="areas-heading" className="mt-12">
          <h2 id="areas-heading" className="text-h3 text-fg-heading">
            The six areas
          </h2>
          <RevealGroup
            className="mt-6 divide-y divide-line-subtle border-y border-line-subtle"
            stagger={0.05}
          >
            {CATEGORIES.map((category) => (
              <RevealItem key={category.key}>
                <div className="grid gap-2 py-5 md:grid-cols-[auto_1fr_1fr] md:gap-8">
                  <p
                    aria-hidden="true"
                    className="tabular text-body-sm font-semibold text-line-strong md:pt-0.5"
                  >
                    {String(category.step).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <h3 className="text-body font-semibold text-fg-heading">
                      {category.label}
                    </h3>
                    <p className="mt-1 text-body-sm text-fg-secondary">
                      {category.lede}
                    </p>
                  </div>
                  {/* Verbatim from [H1] p.9 */}
                  <p className="text-body-sm text-fg-muted md:pt-0.5">
                    {category.covers}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {!inProgress && !completed && (
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" onClick={begin} className="group">
              Start Buyer Readiness
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              />
            </Button>
            <p className="text-body-sm text-fg-muted">
              You can stop after any area and come back.
            </p>
          </div>
        )}
      </PageLayout>
    </PageShell>
  );
}
