"use client";

import Link from "next/link";

import { SectionHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { LISTING_STATUS } from "@/components/seller/listing-status";
import { useJourneyStore } from "@/lib/store/journey-store";
import { cn } from "@/lib/utils";

/**
 * Listings, from the platform's side.
 *
 * The only control is publication state, and the wording is precise: removing a
 * listing sets `removed_by_admin`, which is a different status from the seller
 * withdrawing it. The seller's own screen shows them which of the two happened,
 * because "you took this down" and "we took this down" are not the same message.
 *
 * There is no edit control. An admin rewriting a seller's description would make
 * it unclear who is responsible for what the listing claims.
 */
export default function AdminPropertiesPage() {
  const { listings, interests, setListingStatus } = useJourneyStore();

  const published = listings.filter(
    (l) => (l.status ?? "published") === "published",
  );

  return (
    <>
      <SectionHeader
        title="Properties"
        subtitle="Every listing on the platform, and whether buyers can see it."
        count={`${published.length} published of ${listings.length}`}
      />

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line-subtle">
        <table className="w-full min-w-[48rem] border-collapse bg-surface-card text-left">
          <caption className="sr-only">
            All listings with their seller, status and enquiry count
          </caption>
          <thead>
            <tr className="border-b border-line-subtle bg-surface-sunken">
              {["Property", "Seller", "Price guide", "Enquiries", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-caption font-semibold uppercase tracking-wider text-fg-muted"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const status = LISTING_STATUS[listing.status ?? "published"];
              const count = interests.filter(
                (i) => i.listingId === listing.id,
              ).length;
              const removed = listing.status === "removed_by_admin";

              return (
                <tr
                  key={listing.id}
                  className={cn(
                    "border-b border-line-subtle last:border-0",
                    removed && "bg-surface-sunken",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/search/${listing.id}`}
                      className="block text-body-sm font-medium text-fg-heading underline-offset-4 hover:underline"
                    >
                      {listing.address}
                    </Link>
                    <span className="block text-caption text-fg-muted">
                      {listing.suburb} {listing.postcode} · {listing.propertyType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                    {listing.sellerName ?? (
                      <span className="text-fg-muted">
                        Seeded stock — no seller
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                    {listing.priceGuide}
                  </td>
                  <td className="px-4 py-3.5 tabular text-body-sm text-fg-secondary">
                    {count}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusChip tone={status.tone}>{status.label}</StatusChip>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {removed ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setListingStatus(listing.id, "published")}
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() =>
                          setListingStatus(listing.id, "removed_by_admin")
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-body-sm text-fg-muted">
        Removing a listing takes it out of buyer search immediately and tells the
        seller that The Property Helpline did it — deliberately distinct from
        them withdrawing it themselves. There is no edit control here: an admin
        rewriting a seller&apos;s claims would blur who is responsible for them.
      </p>
    </>
  );
}
