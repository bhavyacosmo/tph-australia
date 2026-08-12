"use client";

import Link from "next/link";
import { Bath, BedDouble, Car, PenLine, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { PROPERTY_STATUS_LABEL } from "@/lib/mock/seed";
import type { Property } from "@/lib/mock/types";
import { PROPERTY_STATUS_TONE, StatusChip } from "@/components/ui/status-chip";
import { PropertyImage } from "@/components/domain/property-image";

/**
 * PropertyCard — docs/03-experience/11-component-library.md §3.6
 *
 * This is the user's OWN saved property, not a listing. Deliberately absent
 * ([C-13], FR-03-03/04): "For Sale" badge, agent, agency branding, days on
 * market, inspection times, "view listing" CTA, price guide styling that reads
 * as a market valuation.
 *
 * The asking price IS shown, because the user typed it (FR-03-01) — but it is
 * labelled as their own entry so it can never read as a valuation (FR-03-18).
 *
 * Variants:
 *   `row`      shortlist — image, detail, actions, reorder handles
 *   `column`   comparison column header — address and suburb only
 *   `summary`  Prop ID and Trust Link context — no actions
 */
export function PropertyCard({
  property,
  href,
  variant = "row",
  rank,
  actions,
  className,
}: {
  property: Property;
  href?: string;
  variant?: "row" | "column" | "summary";
  /** Position in the shortlist, 1-based. Shown only in `row`. */
  rank?: number;
  actions?: React.ReactNode;
  className?: string;
}) {
  const heading = (
    <>
      <p className="text-body font-semibold text-fg-heading">
        {property.address}
      </p>
      <p className="mt-0.5 text-body-sm text-fg-muted">
        {property.suburb} QLD {property.postcode}
      </p>
    </>
  );

  if (variant === "column") {
    return (
      <div
        className={cn(
          "h-full rounded-xl border border-line-subtle bg-surface-card p-3.5 shadow-elev-1",
          className,
        )}
      >
        <p className="text-body-sm font-semibold text-fg-heading">
          {property.address}
        </p>
        <p className="mt-0.5 text-caption text-fg-muted">
          {property.suburb} QLD {property.postcode}
        </p>
      </div>
    );
  }

  if (variant === "summary") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-line-subtle bg-surface-card p-4",
          className,
        )}
      >
        <PropertyImage property={property} className="size-14 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">{heading}</div>
        <StatusChip tone={PROPERTY_STATUS_TONE[property.status]}>
          {PROPERTY_STATUS_LABEL[property.status]}
        </StatusChip>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border border-line-subtle bg-surface-card shadow-elev-1",
        "transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
        "hover:border-line hover:shadow-elev-2",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <PropertyImage
          property={property}
          className="h-40 w-full shrink-0 sm:h-auto sm:w-44"
        />

        <div className="min-w-0 flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {rank !== undefined && (
                <p className="text-overline uppercase text-fg-muted">
                  Your #{rank}
                </p>
              )}
              {href ? (
                <Link
                  href={href}
                  className="mt-1 block rounded-sm underline-offset-4 hover:underline"
                >
                  {heading}
                </Link>
              ) : (
                <div className="mt-1">{heading}</div>
              )}
            </div>

            <StatusChip tone={PROPERTY_STATUS_TONE[property.status]}>
              {PROPERTY_STATUS_LABEL[property.status]}
            </StatusChip>
          </div>

          <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-fg-secondary">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Bedrooms</dt>
              <BedDouble aria-hidden="true" className="size-4 text-fg-muted" />
              <dd className="tabular">{property.beds ?? "—"}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Bathrooms</dt>
              <Bath aria-hidden="true" className="size-4 text-fg-muted" />
              <dd className="tabular">{property.baths ?? "—"}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Parking</dt>
              <Car aria-hidden="true" className="size-4 text-fg-muted" />
              <dd className="tabular">{property.cars ?? "—"}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-fg-muted">Asking</dt>
              <dd className="tabular font-medium text-fg">
                {formatPrice(property.askingPrice)}
              </dd>
            </div>
            {property.ranking !== null && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Your rating</dt>
                <Star aria-hidden="true" className="size-4 text-fg-muted" />
                <dd className="tabular">{property.ranking} of 5</dd>
              </div>
            )}
          </dl>

          {property.note && (
            <p className="mt-4 flex items-start gap-2 border-t border-line-subtle pt-4 text-body-sm italic text-fg-secondary">
              <PenLine
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 not-italic text-fg-muted"
              />
              <span>{property.note}</span>
            </p>
          )}

          {actions && (
            <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
    </article>
  );
}
