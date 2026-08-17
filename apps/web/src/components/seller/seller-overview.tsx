"use client";

import Link from "next/link";
import { ArrowRight, Eye, Home, MessageSquare, PlusCircle } from "lucide-react";

import { SectionHeader, EmptyState } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { useJourneyStore } from "@/lib/store/journey-store";
import { INTEREST_STATUS_LABEL } from "@/lib/mock/platform";
import { formatRelative } from "@/lib/format";
import { LISTING_STATUS } from "@/components/seller/listing-status";

/**
 * The seller's landing screen.
 *
 * Answers one question above the fold — *is anyone interested in my property?*
 * — because that is the only reason a seller opens this. Counts come from the
 * same shared state the buyer writes to, so a buyer registering interest in one
 * tab changes this number in the other.
 */
export function SellerOverview() {
  const { myListings, myInterests, platformEvents, displayName } =
    useJourneyStore();

  const published = myListings.filter((l) => l.status === "published");
  const drafts = myListings.filter((l) => l.status === "draft");
  const newInterest = myInterests.filter((i) => i.status === "sent");

  const stats = [
    { icon: Home, value: published.length, label: "Published properties" },
    { icon: PlusCircle, value: drafts.length, label: "Drafts" },
    { icon: MessageSquare, value: newInterest.length, label: "New enquiries" },
    { icon: Eye, value: myInterests.length, label: "Enquiries all time" },
  ];

  return (
    <>
      <SectionHeader
        title={`Hello, ${displayName.split(" ")[0]}`}
        subtitle="Your properties, and the buyers who have asked about them."
        actions={
          <ButtonLink href="/seller/list" variant="primary" size="md">
            <PlusCircle aria-hidden="true" className="size-4" />
            List a property
          </ButtonLink>
        }
      />

      {/* ------------------------------------------------------------ counts */}
      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-card p-5">
            <s.icon aria-hidden="true" className="size-4 text-fg-muted" />
            <p className="mt-3 text-h2 tabular text-fg-heading">
              <AnimatedNumber value={s.value} />
            </p>
            <p className="mt-1 text-body-sm text-fg-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* --------------------------------------------------------- enquiries */}
      <section aria-labelledby="new-interest" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="new-interest" className="text-h3 text-fg-heading">
            Latest enquiries
          </h2>
          <Link
            href="/seller/interest"
            className="group flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
          >
            See all
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {myInterests.length === 0 ? (
          <EmptyState
            className="mt-5"
            icon={<MessageSquare aria-hidden="true" className="size-5" />}
            title="No enquiries yet"
            body="When a buyer registers interest in one of your properties, it arrives here with their message."
            action={
              <ButtonLink href="/seller/properties" variant="secondary" size="md">
                Review your listings
              </ButtonLink>
            }
          />
        ) : (
          <RevealGroup className="mt-5 space-y-3" stagger={0.06}>
            {myInterests.slice(0, 3).map((interest) => (
              <RevealItem key={interest.id}>
                <Link
                  href="/seller/interest"
                  className="flex flex-col gap-3 rounded-xl border border-line-subtle bg-surface-card p-5 transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line hover:shadow-elev-hover sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-body font-semibold text-fg-heading">
                        {interest.buyerName}
                      </p>
                      <StatusChip
                        tone={interest.status === "sent" ? "attention" : "neutral"}
                      >
                        {INTEREST_STATUS_LABEL[interest.status]}
                      </StatusChip>
                    </div>
                    <p className="mt-1 text-body-sm text-fg-muted">
                      {interest.listingAddress} · {formatRelative(interest.createdAt)}
                    </p>
                    <p className="measure mt-3 text-body-sm text-fg-secondary">
                      {interest.message}
                    </p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>

      {/* --------------------------------------------------------- properties */}
      <section aria-labelledby="your-properties" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="your-properties" className="text-h3 text-fg-heading">
            Your properties
          </h2>
          <Link
            href="/seller/properties"
            className="group flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
          >
            Manage
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {myListings.length === 0 ? (
          <EmptyState
            className="mt-5"
            icon={<Home aria-hidden="true" className="size-5" />}
            title="Nothing listed yet"
            body="Add your property and it appears in buyer search straight away."
            action={
              <ButtonLink href="/seller/list" variant="primary" size="md">
                List a property
              </ButtonLink>
            }
          />
        ) : (
          <ul className="mt-5 divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
            {myListings.slice(0, 4).map((listing) => {
              const enquiries = myInterests.filter(
                (i) => i.listingId === listing.id,
              ).length;
              const status = LISTING_STATUS[listing.status ?? "published"];
              return (
                <li key={listing.id}>
                  <Link
                    href={`/seller/properties`}
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-medium text-fg-heading">
                        {listing.address}, {listing.suburb}
                      </span>
                      <span className="block text-caption text-fg-muted">
                        {listing.priceGuide} · {listing.beds} bed ·{" "}
                        {listing.baths} bath
                      </span>
                    </span>
                    <StatusChip tone={status.tone}>{status.label}</StatusChip>
                    <span className="tabular text-body-sm text-fg-muted">
                      {enquiries} {enquiries === 1 ? "enquiry" : "enquiries"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------------------------------------------------------- activity */}
      <section aria-labelledby="recent" className="mt-12">
        <h2 id="recent" className="text-h3 text-fg-heading">
          Recent
        </h2>
        <ul className="mt-5 space-y-3">
          {platformEvents
            .filter((e) => e.actorRole === "seller" || e.kind === "interest")
            .slice(0, 5)
            .map((event) => (
              <li key={event.id} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-action"
                />
                <p className="text-body-sm text-fg-secondary">
                  {event.what}
                  <span className="ml-2 text-caption text-fg-muted">
                    {formatRelative(event.at)}
                  </span>
                </p>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
