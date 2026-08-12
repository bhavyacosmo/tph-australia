"use client";

import { ShieldCheck } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { DialLegend } from "@/components/readiness/readiness-dial";
import { useJourneyStore } from "@/lib/store/journey-store";
import { BAND } from "@/lib/mock/readiness";
import { formatDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * S17 — Prop ID readiness history. FR-05-06.
 *
 * **The formula version is shown on every assessment.** RDY-03 requires a saved
 * assessment to stay reproducible after the formula changes, which only means
 * anything if the user can see which formula produced which result. Older
 * assessments are retained rather than overwritten (FR-04-13 · RDY-06).
 */
export default function PropIdReadinessPage() {
  const { state, journey, readiness } = useJourneyStore();

  const assessments = state.readiness.filter(
    (a) => a.journeyId === journey.id,
  );

  return (
    <div>
      <RecordHeader
        title="Buyer readiness"
        count={assessments.length > 0 ? `${assessments.length}` : undefined}
        subtitle="Guidance, not approval. Each assessment keeps the answers, the states and the versions that produced them."
      />

      {assessments.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<ShieldCheck className="size-5" />}
            title="No assessment yet"
            body="Six short areas — finances, borrowing, what you're looking for, documents, checking the property, and the decision. You get back an action plan, not a score."
            action={
              <ButtonLink href={routes.readiness(journey.id)} variant="primary">
                Start Buyer Readiness
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.05}>
          {assessments.map((assessment) => {
            const isCurrent = assessment.id === readiness?.id;
            const result = assessment.result;

            return (
              <RevealItem key={assessment.id}>
                <article className="rounded-2xl border border-line-subtle bg-surface-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-h4 text-fg-heading">
                          {result ? BAND[result.band].label : "Not finished"}
                        </h2>
                        <StatusChip
                          tone={
                            result ? (isCurrent ? "success" : "neutral") : "info"
                          }
                        >
                          {result
                            ? isCurrent
                              ? "Current"
                              : "Superseded"
                            : "In progress"}
                        </StatusChip>
                      </div>
                      <p className="mt-2 text-body-sm text-fg-muted">
                        {assessment.completedAt ? (
                          <>
                            Completed {formatDate(assessment.completedAt)} ·{" "}
                            {formatRelative(assessment.completedAt)}
                          </>
                        ) : (
                          <>Started {formatRelative(assessment.startedAt)}</>
                        )}
                      </p>
                    </div>

                    {result && (
                      <p className="tabular shrink-0 text-body-sm text-fg-muted">
                        {
                          result.actions.filter((a) =>
                            assessment.actionsDone.includes(a.id),
                          ).length
                        }{" "}
                        of {result.actions.length} actions done
                      </p>
                    )}
                  </div>

                  {result && (
                    <div className="mt-5 grid gap-6 border-t border-line-subtle pt-5 md:grid-cols-2">
                      <DialLegend categoryStates={result.categoryStates} />

                      <dl className="space-y-2 text-body-sm">
                        {/* RDY-02 — the versions used, recorded and shown */}
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-fg-muted">Questions</dt>
                          <dd className="tabular text-fg">
                            {result.questionVersion}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-fg-muted">Formula</dt>
                          <dd className="tabular text-fg">
                            {result.formulaVersion}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-fg-muted">Answers kept</dt>
                          <dd className="tabular text-fg">
                            {Object.keys(assessment.answers).length}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {isCurrent ? (
                      <ButtonLink
                        href={
                          assessment.completedAt
                            ? routes.readinessResult(journey.id)
                            : routes.readinessStep(
                                journey.id,
                                String(assessment.currentStep),
                              )
                        }
                        variant="secondary"
                      >
                        {assessment.completedAt
                          ? "Open the result"
                          : "Continue the assessment"}
                      </ButtonLink>
                    ) : (
                      <p className="text-body-sm text-fg-muted">
                        Kept for your history. Superseded by a later assessment.
                      </p>
                    )}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
