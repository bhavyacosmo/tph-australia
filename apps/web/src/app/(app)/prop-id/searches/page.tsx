"use client";

import Link from "next/link";
import { ArrowRight, Search, Trash2 } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { buildSearchHref, PRICE_OPTIONS } from "@/components/search/property-search-bar";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * Saved searches.
 *
 * Transcript L223: *"He saves property whatever he search for, if he decide to,
 * he wanna save it, **save that search**. That search can go to pro file
 * basically straight away."*
 *
 * So this is a distinct object from a saved property: it stores the criteria, and
 * it lives in Prop ID ("pro file"). Re-running one drops you back into the search
 * with the same filters.
 */
export default function PropIdSearchesPage() {
  const { savedSearches, removeSavedSearch } = useJourneyStore();

  return (
    <div>
      <RecordHeader
        title="Saved searches"
        count={savedSearches.length > 0 ? `${savedSearches.length}` : undefined}
        subtitle="The criteria you were looking with, kept so you can pick the search back up rather than rebuild it."
        actions={
          <ButtonLink href={routes.search()} variant="secondary">
            <Search aria-hidden="true" className="size-4" />
            New search
          </ButtonLink>
        }
      />

      {savedSearches.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Search className="size-5" />}
            title="No saved searches"
            body="When you find a set of filters that works — a suburb, a type, a budget — save the search and it waits here. Different from saving a property: this keeps the criteria, not the home."
            action={
              <ButtonLink href={routes.search()} variant="primary">
                Search properties
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.05}>
          {savedSearches.map((search) => {
            const price = PRICE_OPTIONS.find((p) => p.value === search.price);
            const criteria = [
              search.mode === "rent" ? "To rent" : "For sale",
              search.propertyType !== "Any type" ? search.propertyType : null,
              search.beds !== "Any" ? `${search.beds} beds` : null,
              price && price.value !== "any" ? price.label : null,
            ].filter(Boolean) as string[];

            return (
              <RevealItem key={search.id}>
                <article className="rounded-2xl border border-line-subtle bg-surface-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-h4 text-fg-heading">
                        {search.where || "Anywhere in Brisbane"}
                      </h2>
                      <p className="mt-1 text-body-sm text-fg-muted">
                        Saved {formatRelative(search.createdAt)} ·{" "}
                        {search.resultCount}{" "}
                        {search.resultCount === 1 ? "match" : "matches"} at the
                        time
                      </p>
                    </div>
                    <Button
                      variant="tertiary"
                      size="icon"
                      onClick={() => removeSavedSearch(search.id)}
                      aria-label={`Remove saved search for ${search.where || "anywhere"}`}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-2 border-t border-line-subtle pt-4">
                    {criteria.map((c) => (
                      <li key={c}>
                        <StatusChip tone="neutral">{c}</StatusChip>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5">
                    <Link
                      href={buildSearchHref({
                        where: search.where,
                        mode: search.mode,
                        type: search.propertyType,
                        beds: search.beds,
                        price: search.price,
                      })}
                      className="group inline-flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
                    >
                      Run this search again
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                      />
                    </Link>
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
