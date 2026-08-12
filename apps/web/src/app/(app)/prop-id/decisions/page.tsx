"use client";

import Link from "next/link";
import { ArrowRight, Scale, Star } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { PROPERTY_STATUS_TONE, StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { PROPERTY_STATUS_LABEL } from "@/lib/mock/seed";
import { formatPrice, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Property decisions — PM wireframe §4 ("Property decisions").
 *
 * Not a new object. A decision, in this product, is the position the buyer has
 * already taken on a property: where it sits in their order, what rating they
 * gave it, and what status they set (FR-03-16, FR-03-17). This page gathers those
 * so the buyer can see their own thinking in one view instead of one card at a
 * time — which is what makes it a decision surface rather than a list.
 */
export default function PropIdDecisionsPage() {
  const { activeProperties, archivedProperties, journey, comparison } =
    useJourneyStore();

  const ranked = [...activeProperties].sort(
    (a, b) => (b.ranking ?? 0) - (a.ranking ?? 0),
  );

  if (activeProperties.length === 0 && archivedProperties.length === 0) {
    return (
      <div>
        <RecordHeader
          title="Decisions"
          subtitle="Where you've landed on each property — your order, your rating, and what you decided to do next."
        />
        <div className="mt-8">
          <EmptyState
            icon={<Scale className="size-5" />}
            title="Nothing decided yet"
            body="Once you've saved a few homes, this is where your own position on each one lives — ranked, rated, and with the status you set."
            action={
              <ButtonLink href={routes.search()} variant="primary">
                Find a property
              </ButtonLink>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <RecordHeader
        title="Decisions"
        subtitle="Where you've landed on each property — your order, your rating, and the status you set. All of it yours, none of it shared."
        actions={
          activeProperties.length >= 2 ? (
            <ButtonLink href={routes.compare(journey.id)} variant="secondary">
              Compare them
            </ButtonLink>
          ) : undefined
        }
      />

      {/* ------------------------------------------------ your order, ranked */}
      <section aria-labelledby="ranked-heading" className="mt-10">
        <h2 id="ranked-heading" className="text-h3 text-fg-heading">
          Your order
        </h2>
        <p className="measure mt-2 text-body-sm text-fg-muted">
          Highest rating first. Your shortlist order is separate and lives on the
          shortlist itself.
        </p>

        <RevealGroup className="mt-6 space-y-3" stagger={0.05}>
          {ranked.map((property, i) => (
            <RevealItem key={property.id}>
              <article
                className={cn(
                  "flex flex-wrap items-center gap-4 rounded-2xl border p-5",
                  i === 0 && property.ranking
                    ? "border-action/40 bg-trustlink-wash"
                    : "border-line-subtle bg-surface-card",
                )}
              >
                <span
                  aria-hidden="true"
                  className="tabular grid size-9 shrink-0 place-items-center rounded-full bg-surface-sunken text-body-sm font-semibold text-fg-muted"
                >
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={routes.property(journey.id, property.id)}
                    className="text-body font-semibold text-fg-heading underline-offset-4 hover:underline"
                  >
                    {property.address}
                  </Link>
                  <p className="text-body-sm text-fg-muted">
                    {property.suburb} · {formatPrice(property.askingPrice)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {property.ranking !== null ? (
                    <>
                      {Array.from({ length: 5 }, (_, s) => (
                        <Star
                          key={s}
                          aria-hidden="true"
                          className={cn(
                            "size-3.5",
                            s < property.ranking!
                              ? "fill-action text-action"
                              : "text-line-strong",
                          )}
                        />
                      ))}
                      <span className="sr-only">
                        {property.ranking} out of 5
                      </span>
                    </>
                  ) : (
                    <span className="text-body-sm text-fg-muted">
                      Not rated
                    </span>
                  )}
                </div>

                <StatusChip tone={PROPERTY_STATUS_TONE[property.status]}>
                  {PROPERTY_STATUS_LABEL[property.status]}
                </StatusChip>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ------------------------------------------------------- ruled out */}
      {archivedProperties.length > 0 && (
        <section aria-labelledby="ruled-heading" className="mt-14">
          <h2 id="ruled-heading" className="text-h4 text-fg-heading">
            Ruled out
          </h2>
          <p className="mt-2 text-body-sm text-fg-secondary">
            Archived, not deleted — the reasoning stays with them.
          </p>
          <ul className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
            {archivedProperties.map((property) => (
              <li
                key={property.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <span className="min-w-0">
                  <Link
                    href={routes.property(journey.id, property.id)}
                    className="block text-body font-medium text-fg-heading underline-offset-4 hover:underline"
                  >
                    {property.address}
                  </Link>
                  {property.note && (
                    <span className="mt-0.5 block text-body-sm italic text-fg-muted">
                      &ldquo;{property.note}&rdquo;
                    </span>
                  )}
                </span>
                <StatusChip tone="neutral">Archived</StatusChip>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --------------------------------------------------- the comparison */}
      {comparison?.completedAt && (
        <section className="mt-14 rounded-2xl border border-line-subtle bg-surface-card p-6">
          <h2 className="text-h4 text-fg-heading">Your comparison</h2>
          <p className="mt-2 text-body-sm text-fg-secondary">
            Saved {formatRelative(comparison.completedAt)}, covering{" "}
            {comparison.propertyIds.length} properties on the criteria set{" "}
            <span className="tabular">{comparison.criteriaVersion}</span>.
          </p>
          <Link
            href={routes.compare(journey.id)}
            className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
          >
            Open the comparison
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Link>
        </section>
      )}
    </div>
  );
}
