"use client";

import Link from "next/link";
import { Eye, Home, MessageSquare, PlusCircle } from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { LISTING_STATUS } from "@/components/seller/listing-status";
import { useJourneyStore } from "@/lib/store/journey-store";
import { listingTint } from "@/lib/mock/media";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The seller's own stock, published and draft.
 *
 * Every row carries the one control that matters at that status — publish a
 * draft, withdraw a live listing, put a withdrawn one back. A listing removed
 * by an admin gets no control at all, and says why.
 */
export function SellerProperties() {
  const { myListings, myInterests, setListingStatus } = useJourneyStore();

  return (
    <>
      <SectionHeader
        title="My properties"
        subtitle="Everything you have listed, and where each one stands."
        count={
          myListings.length > 0
            ? `${myListings.filter((l) => l.status === "published").length} live of ${myListings.length}`
            : undefined
        }
        actions={
          <ButtonLink href="/seller/list" variant="primary" size="md">
            <PlusCircle aria-hidden="true" className="size-4" />
            List a property
          </ButtonLink>
        }
      />

      {myListings.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Home aria-hidden="true" className="size-5" />}
          title="Nothing listed yet"
          body="Add your property and it appears in buyer search the moment you publish it."
          action={
            <ButtonLink href="/seller/list" variant="primary" size="md">
              List a property
            </ButtonLink>
          }
        />
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {myListings.map((listing) => {
            const status = LISTING_STATUS[listing.status ?? "published"];
            const enquiries = myInterests.filter(
              (i) => i.listingId === listing.id,
            );
            const isLive = listing.status === "published";
            const removed = listing.status === "removed_by_admin";

            return (
              <RevealItem key={listing.id}>
                <article className="overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                    {/* Tinted tile — the same fallback the public cards use */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        "grid h-28 w-full shrink-0 place-items-center rounded-xl bg-gradient-to-br sm:w-40",
                        listingTint(listing.imageKey),
                      )}
                    >
                      <span className="px-3 text-center text-caption font-medium text-white/80">
                        {listing.suburb}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-body-lg font-semibold text-fg-heading">
                            {listing.address}
                          </h2>
                          <p className="text-body-sm text-fg-muted">
                            {listing.suburb} {listing.postcode} ·{" "}
                            {listing.propertyType} ·{" "}
                            {listing.listingType === "buy" ? "For sale" : "For rent"}
                          </p>
                        </div>
                        <StatusChip tone={status.tone}>{status.label}</StatusChip>
                      </div>

                      <p className="mt-3 text-body font-medium text-fg-heading">
                        {listing.priceGuide}
                      </p>
                      <p className="mt-1 text-body-sm text-fg-secondary">
                        {listing.beds} bed · {listing.baths} bath ·{" "}
                        {listing.cars} car
                        {listing.landSize ? ` · ${listing.landSize}` : ""}
                      </p>

                      <p className="mt-3 text-body-sm text-fg-muted">
                        {status.detail}
                        {listing.createdAt && (
                          <> Listed {formatRelative(listing.createdAt)}.</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-line-subtle bg-surface-sunken px-5 py-3.5">
                    <span className="flex items-center gap-2 text-body-sm text-fg-secondary">
                      <MessageSquare
                        aria-hidden="true"
                        className="size-4 text-fg-muted"
                      />
                      {enquiries.length}{" "}
                      {enquiries.length === 1 ? "enquiry" : "enquiries"}
                    </span>

                    {isLive && (
                      <Link
                        href={`/search/${listing.id}`}
                        className="flex min-h-11 items-center gap-2 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
                      >
                        <Eye aria-hidden="true" className="size-4" />
                        View as a buyer sees it
                      </Link>
                    )}

                    <div className="ml-auto flex flex-wrap gap-2">
                      {listing.status === "draft" && (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setListingStatus(listing.id, "published")}
                        >
                          Publish
                        </Button>
                      )}
                      {isLive && (
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => setListingStatus(listing.id, "withdrawn")}
                        >
                          Withdraw
                        </Button>
                      )}
                      {listing.status === "withdrawn" && (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setListingStatus(listing.id, "published")}
                        >
                          Republish
                        </Button>
                      )}
                      {removed && (
                        <p className="text-body-sm text-fg-muted">
                          Contact The Property Helpline to discuss this.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </>
  );
}
