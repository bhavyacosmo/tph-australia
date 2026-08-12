"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Bookmark, Check, Info, SearchX } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { ListingCard } from "@/components/domain/listing-card";
import { PropertySearchBar } from "@/components/search/property-search-bar";
import { useJourneyStore } from "@/lib/store/journey-store";
import { LISTINGS } from "@/lib/mock/marketplace";
import { SHORTLIST_LIMIT } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";
import type { Listing } from "@/lib/mock/types";

/**
 * Search results.
 *
 * The composition deliberately avoids the portal default of a dense grid with a
 * map rail: results sit on the page surface with generous rhythm, and the
 * saving affordance is on every card because saving — not enquiring — is what
 * this product wants you to do next.
 *
 * ⚠️ Demo index of eight properties. A banner says so, because a reviewer
 * showing this onward should never be able to mistake it for a live feed.
 */
export function SearchResults({
  where,
  mode,
  type,
  beds,
  price,
}: {
  where: string;
  mode: "buy" | "rent";
  type: string;
  beds: string;
  price: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const {
    saveListing,
    savedListingIds,
    activeProperties,
    session,
    saveSearch,
    savedSearches,
  } = useJourneyStore();
  const [limitHit, setLimitHit] = useState(false);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  /* Already-saved detection, so the control reflects reality on return */
  const alreadySaved = savedSearches.some(
    (s) =>
      s.where.trim().toLowerCase() === where.trim().toLowerCase() &&
      s.mode === mode &&
      s.propertyType === type &&
      s.beds === beds &&
      s.price === price,
  );
  const [searchSavedLocal, setSearchSaved] = useState(false);
  const searchSaved = alreadySaved || searchSavedLocal;

  const results = filterListings(LISTINGS, { where, mode, type, beds, price });

  const onSave = (listing: Listing) => {
    /* Saving is the moment a browser becomes a user — so it is the moment we
       ask them to sign in, and we bring them back to the listing afterwards. */
    if (!session) {
      router.push(
        `/sign-in?next=${encodeURIComponent(routes.listing(listing.id))}`,
      );
      return;
    }

    const result = saveListing(listing);
    if (!result.ok) {
      setLimitHit(true);
      return;
    }
    setJustSaved(listing.id);
    window.setTimeout(() => setJustSaved(null), 2600);
  };

  return (
    <PublicShell>
      {/* ------------------------------------------------------- search bar */}
      <div className="border-b border-line-subtle bg-surface-card">
        <Container className="py-6">
          <PropertySearchBar
            tone="page"
            initial={{ where, mode, type, beds, price }}
          />
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        {/* --------------------------------------------------- demo notice */}
        <p className="flex items-start gap-3 rounded-xl border border-attention-line bg-attention-bg px-4 py-3 text-body-sm text-fg-secondary">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-attention-fg" />
          <span>
            <span className="font-medium text-fg-heading">
              Demonstration listings.
            </span>{" "}
            This prototype searches a small set of example properties. It is not
            connected to a live listing feed.
          </span>
        </p>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h1 text-fg-heading">
              {where ? `Properties in ${where}` : "Properties in Brisbane"}
            </h1>
            {/* Transcript L223 — "save that search" */}
            <div className="mt-4">
              {session ? (
                <Button
                  variant={searchSaved ? "secondary" : "tertiary"}
                  size="sm"
                  onClick={() => {
                    saveSearch({
                      where,
                      mode,
                      propertyType: type,
                      beds,
                      price,
                      resultCount: results.length,
                    });
                    setSearchSaved(true);
                  }}
                  aria-pressed={searchSaved}
                >
                  {searchSaved ? (
                    <>
                      <Check aria-hidden="true" className="size-3.5" />
                      Search saved to your Prop ID
                    </>
                  ) : (
                    <>
                      <Bookmark aria-hidden="true" className="size-3.5" />
                      Save this search
                    </>
                  )}
                </Button>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-link underline-offset-4 hover:underline"
                >
                  <Bookmark aria-hidden="true" className="size-3.5" />
                  Sign in to save this search
                </Link>
              )}
            </div>
            <p className="mt-3 text-body-lg text-fg-secondary">
              <span className="tabular font-medium text-fg-heading">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "property" : "properties"}{" "}
              {mode === "rent" ? "to rent" : "for sale"}
              {type !== "Any type" && ` · ${type}`}
              {beds !== "Any" && ` · ${beds} beds`}
            </p>
          </div>
          <p className="text-body-sm text-fg-muted">
            {activeProperties.length} of {SHORTLIST_LIMIT} saved to your shortlist
          </p>
        </div>

        {/* FR-03-07 — the eight-property limit is explained, never silent */}
        <AnimatePresence>
          {limitHit && (
            <motion.div
              key="limit"
              initial={reduce ? undefined : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-attention-line bg-attention-bg px-4 py-3"
              role="alert"
            >
              <p className="flex items-start gap-2.5 text-body-sm text-fg-secondary">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-attention-fg"
                />
                Your shortlist already holds the maximum of {SHORTLIST_LIMIT}.
                Archive one you&apos;ve ruled out to free a slot — nothing is
                deleted.
              </p>
              <ButtonLink
                href={routes.shortlist("j1")}
                variant="secondary"
                size="sm"
              >
                Open your shortlist
              </ButtonLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------- results */}
        {results.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title="Nothing matches that search"
              body="This prototype only holds a handful of example properties around Brisbane's inner south and north. Try Carindale, Camp Hill, Coorparoo or Clayfield."
              action={
                <ButtonLink href={routes.search()} variant="primary">
                  Clear the filters
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((listing, i) => (
              <motion.li
                key={listing.id}
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(i, 6) * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                <ListingCard
                  listing={listing}
                  href={routes.listing(listing.id)}
                  saved={savedListingIds.includes(listing.id)}
                  onSave={() => onSave(listing)}
                  priority={i < 2}
                />

                {/* Saving is the point of this screen, so it gets an
                    acknowledgement rather than a silent state flip */}
                <AnimatePresence>
                  {justSaved === listing.id && (
                    <motion.p
                      key="saved"
                      initial={reduce ? undefined : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-body-sm text-white shadow-elev-2"
                    >
                      <Check aria-hidden="true" className="size-3.5" />
                      Saved to your properties
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </ul>
        )}

        <p className="mt-12 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
          We don&apos;t value property and we don&apos;t take listings from other
          sites. A price shown here is the guide the seller published — when you
          save a property it becomes your own record, with your notes on it.{" "}
          <Link
            href={routes.shortlist("j1")}
            className="text-fg-link underline underline-offset-4 hover:no-underline"
          >
            See what you&apos;ve saved
          </Link>
          .
        </p>
      </Container>
    </PublicShell>
  );
}

/** Plain, inspectable filtering over the demo index. */
function filterListings(
  listings: Listing[],
  f: { where: string; mode: string; type: string; beds: string; price: string },
): Listing[] {
  const where = f.where.trim().toLowerCase();
  const minBeds = f.beds === "Any" ? 0 : Number(f.beds.replace("+", ""));
  const maxPrice = f.price === "any" ? Infinity : Number(f.price);

  return listings.filter((l) => {
    if (l.listingType !== f.mode) return false;
    if (where && !`${l.suburb} ${l.postcode} ${l.address}`.toLowerCase().includes(where))
      return false;
    if (f.type !== "Any type" && l.propertyType !== f.type) return false;
    if (l.beds < minBeds) return false;
    if (f.mode === "buy" && l.priceValue > maxPrice) return false;
    return true;
  });
}
