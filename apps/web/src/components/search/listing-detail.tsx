"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  Check,
  Heart,
  Info,
  Maximize,
  ShieldCheck,
  UserSearch,
} from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { RailPanel } from "@/components/ui/page";
import { ListingImage } from "@/components/domain/listing-image";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SHORTLIST_LIMIT } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";
import type { Listing } from "@/lib/mock/types";

/**
 * Listing detail.
 *
 * The one action this page wants is **Save to my properties** — the join the
 * client described (transcript L113). Saving turns the listing into the user's
 * own record, which then appears in the shortlist, the comparison and Prop ID.
 *
 * What this page deliberately does NOT have, and it is the difference between
 * this and a portal: no agent block, no enquiry form, no "contact agent"
 * button, no auction countdown. TPH does not represent sellers, and an enquiry
 * form here would send a stranger the user's details — the exact opposite of
 * the product's promise.
 */
export function ListingDetail({ listing }: { listing: Listing }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { saveListing, savedListingIds, activeProperties, journey, session } =
    useJourneyStore();

  const [state, setState] = useState<
    { kind: "idle" } | { kind: "saved"; id: string } | { kind: "limit" }
  >(
    savedListingIds.includes(listing.id) ? { kind: "idle" } : { kind: "idle" },
  );

  const alreadySaved = savedListingIds.includes(listing.id);

  const save = () => {
    /* Saving is the moment a browser becomes a user — sign in first, then come
       straight back to this listing. */
    if (!session) {
      router.push(`/sign-in?next=${encodeURIComponent(routes.listing(listing.id))}`);
      return;
    }

    const result = saveListing(listing);
    if (!result.ok) {
      setState({ kind: "limit" });
      return;
    }
    setState({ kind: "saved", id: result.id });
  };

  return (
    <PublicShell>
      {/* ------------------------------------------------------------- image
          `overflow-hidden` is load-bearing: the entrance animation scales the
          photograph to 1.04, and without a clipping parent that pushes the whole
          page into horizontal overflow for the second the animation runs. */}
      <div className="relative isolate overflow-hidden">
        <motion.div
          initial={reduce ? undefined : { scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <ListingImage
            imageKey={listing.imageKey}
            suburb={listing.suburb}
            propertyType={listing.propertyType}
            priority
            sizes="100vw"
            className="h-64 w-full md:h-[26rem]"
          />
        </motion.div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--hero-scrim-v)" }}
        />

        <Container className="absolute inset-x-0 bottom-0 pb-8">
          <Link
            href={routes.search()}
            className="inline-flex min-h-11 items-center gap-2 text-body-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to results
          </Link>
          <p className="mt-3 text-overline uppercase text-white/60">
            {listing.propertyType} · {listing.suburb}
          </p>
          <h1 className="mt-2 text-h1 text-white">{listing.address}</h1>
          <p className="mt-2 text-body-lg text-white/75">
            {listing.suburb} QLD {listing.postcode}
          </p>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ------------------------------------------------------- detail */}
          <div className="min-w-0 lg:col-span-7">
            <p className="text-h2 text-fg-heading">{listing.priceGuide}</p>
            <p className="mt-2 text-body-sm text-fg-muted">
              Price guide published by the seller. We don&apos;t value property.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle sm:grid-cols-4">
              <Fact icon={BedDouble} label="Bedrooms" value={listing.beds} />
              <Fact icon={Bath} label="Bathrooms" value={listing.baths} />
              <Fact icon={Car} label="Parking" value={listing.cars} />
              <Fact
                icon={Maximize}
                label="Land"
                value={listing.landSize ?? "—"}
              />
            </dl>

            <section aria-labelledby="about-heading" className="mt-10">
              <h2 id="about-heading" className="text-h3 text-fg-heading">
                {listing.headline}
              </h2>
              <p className="measure mt-4 text-body text-fg-secondary">
                {listing.description}
              </p>
            </section>

            <section aria-labelledby="features-heading" className="mt-10">
              <h2 id="features-heading" className="text-h4 text-fg-heading">
                Key features
              </h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {listing.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-body-sm text-fg-secondary"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-action"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {listing.inspectionNote && (
              <section aria-labelledby="inspection-heading" className="mt-10">
                <h2 id="inspection-heading" className="text-h4 text-fg-heading">
                  Open for inspection
                </h2>
                <p className="mt-3 text-body text-fg-secondary">
                  {listing.inspectionNote}
                </p>
              </section>
            )}

            <p className="mt-10 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                Demonstration listing for this prototype. Council information
                such as zoning and flood indicators is added to your own record
                once you save a property — with the source and the date it was
                checked.
              </span>
            </p>
          </div>

          {/* --------------------------------------------------------- rail */}
          <div className="lg:col-span-5">
            <div className="space-y-5 lg:sticky lg:top-24">
              <RailPanel>
                {state.kind === "saved" ? (
                  <motion.div
                    initial={reduce ? undefined : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-success-bg text-success-fg">
                      <Check aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="mt-4 text-h4 text-fg-heading">
                      Saved to your properties
                    </h2>
                    <p className="mt-2 text-body-sm text-fg-secondary">
                      It&apos;s now your own record. Add a note while it&apos;s
                      fresh — that note is what you&apos;ll rely on in three
                      weeks.
                    </p>
                    <div className="mt-5 space-y-2.5">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() =>
                          router.push(routes.property(journey.id, state.id))
                        }
                      >
                        Open your record
                      </Button>
                      <ButtonLink
                        href={routes.shortlist(journey.id)}
                        variant="secondary"
                        fullWidth
                      >
                        See your shortlist
                      </ButtonLink>
                    </div>
                  </motion.div>
                ) : alreadySaved ? (
                  <>
                    <h2 className="text-h4 text-fg-heading">
                      Already in your properties
                    </h2>
                    <p className="mt-2 text-body-sm text-fg-secondary">
                      You saved this one earlier. Your notes and status live on
                      your own record.
                    </p>
                    <ButtonLink
                      href={routes.shortlist(journey.id)}
                      variant="secondary"
                      fullWidth
                      className="mt-5"
                    >
                      See your shortlist
                    </ButtonLink>
                  </>
                ) : (
                  <>
                    <h2 className="text-h4 text-fg-heading">
                      Considering this one?
                    </h2>
                    <p className="mt-2 text-body-sm text-fg-secondary">
                      Save it and it becomes your own record — with your notes,
                      your ranking, and Council information beside it. Nothing is
                      sent to anyone.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={save}
                      className="mt-5"
                    >
                      <Heart aria-hidden="true" className="size-4" />
                      Save to my properties
                    </Button>
                    <p className="mt-3 text-caption text-fg-muted">
                      {activeProperties.length} of {SHORTLIST_LIMIT} slots used
                    </p>
                    {state.kind === "limit" && (
                      <p
                        role="alert"
                        className="mt-3 text-body-sm text-danger-fg"
                      >
                        Your shortlist already holds {SHORTLIST_LIMIT}. Archive
                        one to free a slot.
                      </p>
                    )}
                  </>
                )}
              </RailPanel>

              <RailPanel tone="wash">
                <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                  <span>
                    <span className="block font-medium text-fg-heading">
                      No enquiry is sent
                    </span>
                    There is no agent contact form here. Saving a property tells
                    nobody, and your details stay yours until you authorise a
                    Trust Link.
                  </span>
                </p>
              </RailPanel>

              <RailPanel title="Thinking about an inspection?">
                <p className="text-body-sm text-fg-secondary">
                  When you&apos;re close on a property, connect a checked
                  building or pest inspector — you choose what they see.
                </p>
                <ButtonLink
                  href={routes.professionals()}
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                >
                  <UserSearch aria-hidden="true" className="size-4" />
                  Find a professional
                </ButtonLink>
              </RailPanel>
            </div>
          </div>
        </div>
      </Container>
    </PublicShell>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-surface-card p-4">
      <dt className="flex items-center gap-1.5 text-caption uppercase tracking-wider text-fg-muted">
        <Icon aria-hidden className="size-3.5" />
        {label}
      </dt>
      <dd className="tabular mt-1.5 text-h4 text-fg-heading">{value}</dd>
    </div>
  );
}
