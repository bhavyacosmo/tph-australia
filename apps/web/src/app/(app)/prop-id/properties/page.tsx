"use client";

import Link from "next/link";
import { Home, Plus } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { PropertyCard } from "@/components/domain/property-card";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SHORTLIST_LIMIT } from "@/lib/mock/seed";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * S17 — Prop ID properties. FR-05-04.
 *
 * Every property the user has saved, across journeys, including archived ones —
 * the shortlist view is the working list, this is the record. Archived
 * properties are kept and shown here because FR-03-08 makes archiving the safe
 * alternative to deletion, and a record that hides what you archived is not a
 * record.
 */
export default function PropIdPropertiesPage() {
  const { journey, activeProperties, archivedProperties } = useJourneyStore();

  return (
    <div>
      <RecordHeader
        title="Properties"
        count={`${activeProperties.length} of ${SHORTLIST_LIMIT} saved`}
        subtitle="Your own records — the homes you're considering, with your notes, status and ranking."
        actions={
          activeProperties.length < SHORTLIST_LIMIT ? (
            <ButtonLink
              href={routes.addProperty(journey.id)}
              variant="secondary"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add
            </ButtonLink>
          ) : undefined
        }
      />

      {activeProperties.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Home className="size-5" />}
            title="No properties saved"
            body="When you save a home you're considering, its record lives here — with your note, your status and anything a professional sends back about it."
            action={
              <ButtonLink href={routes.addProperty(journey.id)} variant="primary">
                Add your first property
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.05}>
          {activeProperties.map((property, i) => (
            <RevealItem key={property.id}>
              <PropertyCard
                property={property}
                rank={i + 1}
                href={routes.property(journey.id, property.id)}
                actions={
                  <>
                    <p className="text-body-sm text-fg-muted">
                      Updated {formatRelative(property.updatedAt)}
                    </p>
                    <Link
                      href={routes.property(journey.id, property.id)}
                      className="ml-auto flex min-h-11 items-center text-body-sm text-fg-link underline-offset-4 hover:underline"
                    >
                      Open the record
                    </Link>
                  </>
                }
              />
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {archivedProperties.length > 0 && (
        <section aria-labelledby="archived-heading" className="mt-12">
          <h2 id="archived-heading" className="text-h4 text-fg-heading">
            Archived
          </h2>
          <p className="mt-2 text-body-sm text-fg-secondary">
            Kept, not deleted. Restore one from your shortlist whenever you like.
          </p>
          <ul className="mt-5 space-y-3">
            {archivedProperties.map((property) => (
              <li key={property.id}>
                <Link href={routes.property(journey.id, property.id)}>
                  <PropertyCard property={property} variant="summary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
