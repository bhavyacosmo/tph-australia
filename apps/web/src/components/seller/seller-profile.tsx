"use client";

import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

import { SectionHeader, RailPanel } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ChoiceRow } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import { DEMO_SELLER_ID } from "@/lib/mock/platform";
import { formatDate } from "@/lib/format";

/**
 * The seller's account.
 *
 * Identity is read-only, and says why: this prototype has no account service,
 * so an editable name field would write to nothing and quietly lose the change.
 *
 * The contact preference IS editable, because it is real listing state — and it
 * applies across every property at once, which is what a seller changing their
 * mind about being phoned actually wants.
 */
const CONTACT_OPTIONS = [
  {
    value: "through_tph" as const,
    label: "Through The Property Helpline",
    description:
      "Enquiries arrive in your dashboard. Your phone number is never shown.",
  },
  {
    value: "phone" as const,
    label: "By phone",
    description: "Your number appears on every listing you have published.",
  },
  {
    value: "email" as const,
    label: "By email",
    description: "Your email address appears on every listing.",
  },
];

const KIND_LABEL = {
  owner: "Property owner",
  agent: "Agent",
} as const;

const DEALS_LABEL = {
  sell: "Sales only",
  rent: "Rentals only",
  both: "Sales and rentals",
} as const;

export function SellerProfile() {
  const { session, users, myListings, myInterests, updateListing, profile } =
    useJourneyStore();

  const record = users.find((u) => u.id === DEMO_SELLER_ID);
  const current = myListings[0]?.sellerContact ?? "through_tph";
  const seller = profile?.seller;

  const [choice, setChoice] = useState(current);
  const [saved, setSaved] = useState(false);

  const apply = () => {
    myListings.forEach((l) => updateListing(l.id, { sellerContact: choice }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <>
      <SectionHeader
        title="Profile"
        subtitle="Your account, and how buyers are able to reach you."
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          {/* ------------------------------------------------------ account */}
          <section aria-labelledby="account">
            <h2 id="account" className="text-h3 text-fg-heading">
              Account
            </h2>
            {/* Their photograph, where they gave us one. */}
            {profile?.photoUrl && (
              <div className="mt-5 flex items-center gap-4">
                <span className="size-16 shrink-0 overflow-hidden rounded-full bg-surface-sunken">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                  <img
                    src={profile.photoUrl}
                    alt=""
                    aria-hidden="true"
                    className="size-full object-cover"
                  />
                </span>
                <p className="text-body-sm text-fg-muted">
                  Shown beside your name when a buyer enquires.
                </p>
              </div>
            )}

            <dl className="mt-5 divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
              {[
                ["Name", profile?.fullName ?? session?.name ?? "—"],
                ["Mobile", profile?.phone ?? record?.phone ?? "—"],
                ["Email", profile?.email || record?.email || "—"],
                ["Selling as", seller ? KIND_LABEL[seller.kind] : "—"],
                ...(seller?.kind === "agent"
                  ? ([
                      [
                        "Structure",
                        seller.structure === "team"
                          ? `Team${seller.teamName ? ` · ${seller.teamName}` : ""}`
                          : "Working independently",
                      ],
                      ["Experience", seller.yearsExperience ?? "Not given"],
                    ] as [string, string][])
                  : []),
                ["Lists", seller ? DEALS_LABEL[seller.dealsIn] : "—"],
                [
                  "Joined",
                  record ? formatDate(record.joinedAt) : "—",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-5 py-4"
                >
                  <dt className="w-24 shrink-0 text-body-sm text-fg-muted">
                    {label}
                  </dt>
                  <dd className="min-w-0 text-body text-fg">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-body-sm text-fg-muted">
              These are what you entered when you set up your profile. Editing
              them isn&apos;t built yet — there is no account service behind this
              prototype, and a field that saves nowhere is worse than no field.
            </p>
          </section>

          {/* --------------------------------------------------- preference */}
          <section aria-labelledby="contact" className="mt-12">
            <h2 id="contact" className="text-h3 text-fg-heading">
              How buyers reach you
            </h2>
            <p className="measure mt-3 text-body text-fg-secondary">
              This applies to every property you have listed. Whichever you
              choose, a buyer&apos;s own contact details reach you only if they
              decide to share them.
            </p>

            <div className="mt-5 space-y-3">
              {CONTACT_OPTIONS.map((option) => (
                <ChoiceRow
                  key={option.value}
                  type="radio"
                  name="sellerContact"
                  value={option.value}
                  checked={choice === option.value}
                  onChange={() => setChoice(option.value)}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="md"
                disabled={choice === current || myListings.length === 0}
                onClick={apply}
              >
                Apply to all {myListings.length} listings
              </Button>
              {saved && (
                <p className="flex items-center gap-2 text-body-sm text-action">
                  <Check aria-hidden="true" className="size-4" />
                  Updated
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-28">
            <RailPanel title="Your activity">
              <dl className="space-y-4">
                <div>
                  <dt className="text-body-sm text-fg-muted">
                    Properties listed
                  </dt>
                  <dd className="text-h3 tabular text-fg-heading">
                    {myListings.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-body-sm text-fg-muted">Enquiries received</dt>
                  <dd className="text-h3 tabular text-fg-heading">
                    {myInterests.length}
                  </dd>
                </div>
              </dl>
            </RailPanel>

            <RailPanel tone="wash">
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-action"
                />
                <span>
                  The Property Helpline does not act for you in a sale. We list
                  the property and pass on genuine enquiries — negotiation,
                  contracts and settlement stay between you, the buyer and your
                  own professionals.
                </span>
              </p>
            </RailPanel>
          </div>
        </aside>
      </div>
    </>
  );
}
