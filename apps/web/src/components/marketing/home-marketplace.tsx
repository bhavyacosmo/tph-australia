"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldOff } from "lucide-react";

import { Container } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ListingCard } from "@/components/domain/listing-card";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { LISTINGS, PROFESSIONALS } from "@/lib/mock/marketplace";
import { routes } from "@/lib/routes";

/**
 * Properties on the left, professionals on the right.
 *
 * This is the section the client called *"सबसे main चीज़ है, ये बहुत main चीज़ है"*
 * — the most important thing (transcript L77) — and described twice: *"एक side
 * में properties रख लो और right side में आप agents रख लो"* (L251).
 *
 * Two deliberate departures from the portal it is modelled on:
 *
 *  1. No agent is attached to a listing. TPH does not represent sellers, and a
 *     photo-and-phone-number beside a property implies a relationship it does
 *     not have. The professionals rail is a separate column with its own
 *     heading, because these people work for the BUYER.
 *
 *  2. The privacy line sits inside the professionals column rather than in the
 *     footer, because that is the moment a reader wonders what happens if they
 *     click (FR-06-10…12 — reading a profile sends nothing).
 *
 * ⚠️ Demo listings. No feed, no scraping — see src/lib/mock/marketplace.ts.
 */
export function HomeMarketplace() {
  const router = useRouter();
  const { saveListing, savedListingIds, session } = useJourneyStore();

  /* Signing in is the gate on saving, not on browsing. */
  const onSave = (listingId: string) => {
    const listing = LISTINGS.find((l) => l.id === listingId);
    if (!listing) return;
    if (!session) {
      router.push(`/sign-in?next=${encodeURIComponent(`/search/${listing.id}`)}`);
      return;
    }
    saveListing(listing);
  };

  const forSale = LISTINGS.filter((l) => l.listingType === "buy").slice(0, 4);
  const featured = PROFESSIONALS.filter((p) => p.verification).slice(0, 3);

  return (
    <section
      aria-labelledby="marketplace-heading"
      className="bg-surface-page py-16 md:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ==================================================== properties */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-overline uppercase text-fg-muted">
                  Brisbane
                </p>
                <h2
                  id="marketplace-heading"
                  className="mt-3 text-h2 text-fg-heading"
                >
                  Properties to consider
                </h2>
              </div>
              <Link
                href="/search"
                className="group flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
              >
                See all properties
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <RevealGroup
              className="mt-8 grid gap-5 sm:grid-cols-2"
              stagger={0.07}
            >
              {forSale.map((listing, i) => (
                <RevealItem key={listing.id}>
                  <ListingCard
                    listing={listing}
                    href={`/search/${listing.id}`}
                    saved={savedListingIds.includes(listing.id)}
                    onSave={() => onSave(listing.id)}
                    priority={i === 0}
                  />
                </RevealItem>
              ))}
            </RevealGroup>

            <p className="mt-6 text-body-sm text-fg-muted">
              Demonstration listings for this prototype. Saving one puts it in
              your own shortlist, with your notes — it doesn&apos;t contact anyone.
            </p>
          </div>

          {/* ================================================= professionals */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-overline uppercase text-fg-muted">
                    Checked by us
                  </p>
                  <h2 className="mt-3 text-h2 text-fg-heading">
                    Brisbane professionals
                  </h2>
                </div>
                <Link
                  href={routes.professionals()}
                  className="group flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
                >
                  See all
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <RevealGroup className="mt-8 space-y-4" stagger={0.07}>
                {featured.map((professional) => (
                  <RevealItem key={professional.id}>
                    <ProfessionalCard
                      professional={professional}
                      href={routes.professional(professional.id)}
                      variant="compact"
                    />
                  </RevealItem>
                ))}
              </RevealGroup>

              {/* FR-06-10…12 — stated where the question actually arises */}
              <p className="mt-6 flex items-start gap-3 rounded-xl bg-trustlink-wash p-4 text-body-sm text-fg-secondary">
                <ShieldOff
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-action"
                />
                <span>
                  Reading a profile sends nothing — no notification, no enquiry,
                  no contact details. They only hear from you when you authorise
                  a Trust Link.
                </span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
