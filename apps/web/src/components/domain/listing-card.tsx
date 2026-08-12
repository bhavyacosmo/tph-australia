"use client";

import Link from "next/link";
import { Bath, BedDouble, Car, Check, Heart, Maximize } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingImage } from "@/components/domain/listing-image";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/mock/types";

/**
 * ListingCard — a demo property from the search index.
 *
 * ⚠️ Deliberately distinct from `PropertyCard`, which is the user's OWN saved
 * record. Confusing the two would be a real product failure: one is something
 * on the market, the other is something you are tracking with your own notes on
 * it. This one carries a price guide and a save action; the other carries your
 * note, status and ranking.
 *
 * Deliberately absent, and not by oversight: agent name, agency branding, "days
 * on market", auction countdowns, "hot property" flags. TPH does not represent
 * sellers, and implying a relationship it does not have would be misleading.
 */
export function ListingCard({
  listing,
  href,
  saved = false,
  onSave,
  className,
  priority = false,
}: {
  listing: Listing;
  href: string;
  saved?: boolean;
  onSave?: () => void;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group/listing relative overflow-hidden rounded-2xl border border-line-subtle bg-surface-card",
        "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="relative">
          <ListingImage
            imageKey={listing.imageKey}
            suburb={listing.suburb}
            propertyType={listing.propertyType}
            priority={priority}
            className="aspect-[4/3] w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/listing:scale-[1.03]"
          />
          {listing.listingType === "rent" && (
            <span className="absolute left-3 top-3 rounded-full bg-surface-card/95 px-2.5 py-1 text-caption font-medium text-fg-heading backdrop-blur">
              For rent
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-body-lg font-bold text-fg-heading">
            {listing.priceGuide}
          </p>
          <p className="mt-1.5 text-body font-medium text-fg-heading">
            {listing.address}
          </p>
          <p className="text-body-sm text-fg-muted">
            {listing.suburb} QLD {listing.postcode}
          </p>

          <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-fg-secondary">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Bedrooms</dt>
              <BedDouble aria-hidden="true" className="size-4 text-fg-muted" />
              <dd className="tabular">{listing.beds}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Bathrooms</dt>
              <Bath aria-hidden="true" className="size-4 text-fg-muted" />
              <dd className="tabular">{listing.baths}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Parking</dt>
              <Car aria-hidden="true" className="size-4 text-fg-muted" />
              <dd className="tabular">{listing.cars}</dd>
            </div>
            {listing.landSize && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Land size</dt>
                <Maximize aria-hidden="true" className="size-4 text-fg-muted" />
                <dd className="tabular">{listing.landSize}</dd>
              </div>
            )}
            <span className="ml-auto text-fg-muted">{listing.propertyType}</span>
          </dl>
        </div>
      </Link>

      {onSave && (
        <div className="border-t border-line-subtle px-5 py-3">
          {/* `md` (44px), not `sm` — this is the primary action on the card and
              it is used on touch. `sm` is reserved for desktop table rows. */}
          <Button
            variant={saved ? "secondary" : "tertiary"}
            onClick={onSave}
            fullWidth
            aria-pressed={saved}
            className={cn("justify-center", saved && "text-action")}
          >
            {saved ? (
              <>
                <Check aria-hidden="true" className="size-3.5" />
                In your properties
              </>
            ) : (
              <>
                <Heart aria-hidden="true" className="size-3.5" />
                Save to my properties
              </>
            )}
          </Button>
        </div>
      )}
    </article>
  );
}
