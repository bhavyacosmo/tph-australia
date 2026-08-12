"use client";

import { Columns3 } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { CRITERIA } from "@/lib/mock/seed";
import { formatDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * S17 — Prop ID comparisons. FR-05-05.
 *
 * **The criteria version is shown on every saved comparison** (FR-03-23,
 * FR-05-05, `RDY-03`'s sibling requirement for comparisons). A returning user
 * needs to know whether the basis of a comparison has changed since they saved
 * it — otherwise "we compared these" quietly stops meaning what it meant.
 */
export default function PropIdComparisonsPage() {
  const { state, journey, getProperty } = useJourneyStore();

  const comparisons = state.comparisons.filter((c) => c.journeyId === journey.id);

  return (
    <div>
      <RecordHeader
        title="Comparisons"
        count={`${comparisons.length}`}
        subtitle="Each saved comparison records which properties it covered and which version of the criteria set it used."
      />

      {comparisons.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Columns3 className="size-5" />}
            title="No comparisons saved"
            body="Put two or more of your saved homes side by side, and the result is kept here so you can come back to it."
            action={
              <ButtonLink href={routes.compare(journey.id)} variant="primary">
                Compare your properties
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.05}>
          {comparisons.map((comparison) => {
            const properties = comparison.propertyIds
              .map((id) => getProperty(id))
              .filter(Boolean);

            return (
              <RevealItem key={comparison.id}>
                <article className="rounded-2xl border border-line-subtle bg-surface-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-h4 text-fg-heading">
                        {properties.length} properties compared
                      </h2>
                      <p className="mt-2 text-body-sm text-fg-muted">
                        {comparison.completedAt ? (
                          <>
                            Saved {formatRelative(comparison.completedAt)} ·{" "}
                            {formatDate(comparison.completedAt)}
                          </>
                        ) : (
                          <>
                            Started {formatRelative(comparison.updatedAt)} — not
                            saved yet
                          </>
                        )}
                      </p>
                    </div>
                    <StatusChip
                      tone={comparison.completedAt ? "success" : "info"}
                    >
                      {comparison.completedAt ? "Saved" : "In progress"}
                    </StatusChip>
                  </div>

                  <ul className="mt-5 flex flex-wrap gap-2 border-t border-line-subtle pt-5">
                    {properties.map((p) => (
                      <li key={p!.id}>
                        <span className="inline-flex items-center rounded-full border border-line-subtle px-3 py-1 text-body-sm text-fg-secondary">
                          {p!.address}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-body-sm">
                    <div className="flex items-baseline gap-2">
                      <dt className="text-fg-muted">Criteria set</dt>
                      {/* FR-03-23 / FR-05-05 — the version, shown */}
                      <dd className="tabular font-medium text-fg">
                        {comparison.criteriaVersion}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="text-fg-muted">Criteria</dt>
                      <dd className="tabular font-medium text-fg">
                        {CRITERIA.length}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <ButtonLink
                      href={routes.compare(journey.id)}
                      variant="secondary"
                    >
                      Open the comparison
                    </ButtonLink>
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
