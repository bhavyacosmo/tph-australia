"use client";

import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * Notes — PM wireframe §4.
 *
 * ⚠️ [OQ-24] is unresolved: are notes per-property only, or is there a
 * journey-level notes concept? `[MU1]`'s Prop ID card showed a standalone
 * "Notes 4" count, which implies the latter.
 *
 * This page takes the answer the data already gives: notes belong to properties,
 * and this is every note in one place. It adds no new object, so if the client
 * later wants free-standing notes it is an addition rather than a migration. The
 * ambiguity is stated at the bottom of the page rather than hidden.
 */
export default function PropIdNotesPage() {
  const { activeProperties, archivedProperties, journey } = useJourneyStore();

  const all = [...activeProperties, ...archivedProperties];
  const withNotes = all.filter((p) => p.note.trim().length > 0);

  return (
    <div>
      <RecordHeader
        title="Notes"
        count={withNotes.length > 0 ? `${withNotes.length}` : undefined}
        subtitle="Everything you've written about the homes you're considering, in one place. Your words stay marked as yours wherever they appear."
      />

      {withNotes.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<PenLine className="size-5" />}
            title="No notes yet"
            body="The note you write standing in a driveway is the thing you'll actually rely on three weeks later. Open a property and add one."
            action={
              activeProperties.length > 0 ? (
                <ButtonLink
                  href={routes.property(journey.id, activeProperties[0].id)}
                  variant="primary"
                >
                  Open a property
                </ButtonLink>
              ) : (
                <ButtonLink href={routes.search()} variant="primary">
                  Find a property
                </ButtonLink>
              )
            }
          />
        </div>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.05}>
          {withNotes.map((property) => (
            <RevealItem key={property.id}>
              <article className="rounded-2xl border border-line-subtle bg-surface-card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={routes.property(journey.id, property.id)}
                      className="text-h4 text-fg-heading underline-offset-4 hover:underline"
                    >
                      {property.address}
                    </Link>
                    <p className="text-body-sm text-fg-muted">
                      {property.suburb} QLD {property.postcode}
                    </p>
                  </div>
                  <p className="text-caption text-fg-muted">
                    Updated {formatRelative(property.updatedAt)}
                  </p>
                </div>

                <p className="measure mt-4 flex items-start gap-3 border-t border-line-subtle pt-4 text-body italic text-fg-secondary">
                  <PenLine
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 not-italic text-fg-muted"
                  />
                  <span>{property.note}</span>
                </p>

                <Link
                  href={routes.property(journey.id, property.id)}
                  className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline-offset-4 hover:underline"
                >
                  Edit on the property
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </Link>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      <p className="mt-10 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        Notes belong to a property. Whether there should also be free-standing
        journey notes is still an open question with the client, so nothing here
        pretends to answer it.
      </p>
    </div>
  );
}
