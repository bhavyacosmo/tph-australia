"use client";

import { Activity } from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/ui/page";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";

/**
 * Property activity.
 *
 * The seller's slice of the platform log: what they did, and what buyers did to
 * their stock. Deliberately not the whole log — a seller has no business seeing
 * verification decisions or another seller's listings.
 */
export function SellerActivity() {
  const { platformEvents, myListings, myInterests } = useJourneyStore();

  const mine = new Set(myListings.map((l) => l.id));
  const relevant = platformEvents.filter(
    (e) =>
      e.actorRole === "seller" ||
      (e.kind === "interest" &&
        myInterests.some((i) => mine.has(i.listingId))),
  );

  return (
    <>
      <SectionHeader
        title="Property activity"
        subtitle="A record of what has happened to your listings, newest first."
        count={relevant.length > 0 ? `${relevant.length} entries` : undefined}
      />

      {relevant.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Activity aria-hidden="true" className="size-5" />}
          title="Nothing has happened yet"
          body="Publishing a property, a buyer enquiry, or a reply you send will all appear here."
        />
      ) : (
        <ol className="mt-8 space-y-0">
          {relevant.map((event, i) => (
            <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector, drawn behind the dot and stopped on the last row */}
              {i < relevant.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[0.3125rem] top-3 h-full w-px bg-line-subtle"
                />
              )}
              <span
                aria-hidden="true"
                className="relative mt-2 size-2.5 shrink-0 rounded-full bg-action ring-4 ring-surface-page"
              />
              <div className="min-w-0 pb-1">
                <p className="text-body text-fg">{event.what}</p>
                <p className="mt-1 text-caption text-fg-muted">
                  {event.actorName} · {formatRelative(event.at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
