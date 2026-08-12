"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check, Info, Plus } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  Breadcrumbs,
  PageHeader,
  PageLayout,
  PageShell,
  RailPanel,
} from "@/components/ui/page";
import { useJourneyStore } from "@/lib/store/journey-store";
import { PROPERTY_STATUS_LABEL, SHORTLIST_LIMIT } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";
import type { PropertyStatus } from "@/lib/mock/types";

/**
 * S10 — Add property.
 *
 * FR-03-01  address · optional URL/source · asking price · property type ·
 *           bedrooms · bathrooms · parking · user note
 * FR-03-02  MANUAL ENTRY IS SUFFICIENT. No autocomplete is wired here, and the
 *           form must never imply one is coming
 * FR-03-03  no scraping. The "where you saw it" field stores a link the user
 *           pastes; nothing is fetched from it, and the form says so
 * FR-03-07  at the limit the user gets a clear explanation and a way forward
 * FR-03-21  explicit save with visible confirmation
 *
 * Only the address is required. A buyer standing at an inspection with a phone
 * should be able to save a property in fifteen seconds and fill the rest in
 * later — so everything else is marked optional and the note comes first among
 * the optional fields, because it is the field they will actually value.
 */

const PROPERTY_TYPES = [
  "House",
  "Townhouse",
  "Unit or apartment",
  "Duplex",
  "Land",
  "Other",
];

export function AddProperty({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const { activeProperties, addProperty, hasPropId, holdProperty } =
    useJourneyStore();

  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [askingPrice, setAskingPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [cars, setCars] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<PropertyStatus>("researching");
  const [error, setError] = useState<string | null>(null);

  const atLimit = activeProperties.length >= SHORTLIST_LIMIT;

  const save = () => {
    if (address.trim().length === 0) {
      setError("Add a street address so you can tell them apart.");
      return;
    }
    if (suburb.trim().length === 0) {
      setError("Add a suburb — it's how Council data gets matched later.");
      return;
    }

    const entry = {
      address: address.trim(),
      suburb: suburb.trim(),
      postcode: postcode.trim(),
      propertyType,
      askingPrice: parseMoney(askingPrice),
      beds: parseCount(beds),
      baths: parseCount(baths),
      cars: parseCount(cars),
      sourceUrl: sourceUrl.trim() || null,
      note: note.trim(),
      status,
      ranking: null,
      imageKey: null,
    };

    /*
      FR-01-15 — the save boundary. An anonymous visitor is stopped here, but
      their entry is HELD, not discarded (`ENT-03`), and the boundary screen
      shows it back to them.
    */
    if (!hasPropId) {
      holdProperty(entry);
      router.push(routes.saveBoundary());
      return;
    }

    const result = addProperty(entry);

    if (!result.ok) {
      // FR-03-07 — never a silent failure
      setError(
        `You've already saved ${SHORTLIST_LIMIT} properties. Archive one from your shortlist to free up a slot.`,
      );
      return;
    }

    router.push(routes.property(journeyId, result.id));
  };

  if (atLimit) {
    return (
      <PageShell className="max-w-3xl">
        <Breadcrumbs
          trail={[
            { label: "Home Compass", href: routes.journey(journeyId) },
            { label: "Shortlist", href: routes.shortlist(journeyId) },
            { label: "Add a property" },
          ]}
        />
        <div className="mt-10 rounded-2xl border border-attention-line bg-attention-bg p-7">
          <p className="flex items-start gap-3">
            <AlertTriangle
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-attention-fg"
            />
            <span>
              <span className="block text-h3 text-fg-heading">
                Your shortlist is full
              </span>
              <span className="measure mt-3 block text-body text-fg-secondary">
                You&apos;ve saved the maximum of {SHORTLIST_LIMIT} properties for
                this journey. Archive one you&apos;ve ruled out and the slot comes
                back — archiving keeps your notes, it doesn&apos;t delete them.
              </span>
            </span>
          </p>
          <div className="mt-7">
            <ButtonLink href={routes.shortlist(journeyId)} variant="primary">
              Go to your shortlist
            </ButtonLink>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="max-w-5xl">
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: "Shortlist", href: routes.shortlist(journeyId) },
          { label: "Add a property" },
        ]}
      />

      <PageHeader
        className="mt-6"
        title="Add a property"
        subtitle="Only the address and suburb are needed. Add the rest whenever you like — it all stays editable."
      />

      <PageLayout
        rail={
          <div className="space-y-5">
            <RailPanel title="Why so few required fields" tone="sunken">
              <p className="text-body-sm text-fg-secondary">
                You might be standing in a driveway. Save the address now, and
                fill in the details when you&apos;re sitting down.
              </p>
              <p className="mt-3 text-body-sm text-fg-secondary">
                Anything you leave blank shows as <em>Not recorded</em> in your
                comparison — never as a guess.
              </p>
            </RailPanel>

            <RailPanel title="What we don't do" tone="wash">
              <ul className="space-y-2.5 text-body-sm text-fg-secondary">
                <li className="flex items-start gap-2">
                  <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  We don&apos;t pull data from listing sites, and we don&apos;t
                  value property.
                </li>
                <li className="flex items-start gap-2">
                  <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  Everything you enter stays yours. No agent or professional sees
                  it unless you authorise a Trust Link.
                </li>
              </ul>
            </RailPanel>
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-10"
        >
          {/* ------------------------------------------------------ address */}
          <Reveal>
            <FormSection
              title="Where is it?"
              body="Typed by you — we don't look anything up."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Street address" className="sm:col-span-2">
                  {({ id, invalid }) => (
                    <Input
                      id={id}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      aria-invalid={invalid || undefined}
                      placeholder="12 Green Street"
                      autoComplete="off"
                      autoFocus
                    />
                  )}
                </Field>
                <Field label="Suburb">
                  {({ id }) => (
                    <Input
                      id={id}
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      placeholder="Carindale"
                      autoComplete="off"
                    />
                  )}
                </Field>
                <Field label="Postcode" optional>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="4152"
                      inputMode="numeric"
                      maxLength={4}
                      autoComplete="off"
                    />
                  )}
                </Field>
              </div>
            </FormSection>
          </Reveal>

          {/* ------------------------------------------------------- basics */}
          <Reveal>
            <FormSection
              title="The basics"
              body="Used in your comparison. All optional."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Property type" optional>
                  {({ id }) => (
                    <Select
                      id={id}
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field
                  label="Asking price"
                  optional
                  hint="What you understood it to be. This is your own note, not a valuation."
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      placeholder="1,180,000"
                      inputMode="numeric"
                    />
                  )}
                </Field>
                <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                  <Field label="Beds" optional>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        inputMode="numeric"
                        maxLength={2}
                      />
                    )}
                  </Field>
                  <Field label="Baths" optional>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={baths}
                        onChange={(e) => setBaths(e.target.value)}
                        inputMode="numeric"
                        maxLength={2}
                      />
                    )}
                  </Field>
                  <Field label="Parking" optional>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={cars}
                        onChange={(e) => setCars(e.target.value)}
                        inputMode="numeric"
                        maxLength={2}
                      />
                    )}
                  </Field>
                </div>
              </div>
            </FormSection>
          </Reveal>

          {/* --------------------------------------------------- your notes */}
          <Reveal>
            <FormSection
              title="Your own notes"
              body="The part you'll actually rely on in three weeks."
            >
              <div className="space-y-5">
                <Field
                  label="Note"
                  optional
                  hint="What you noticed. It stays marked as yours and is never presented as verified information."
                >
                  {({ id, describedBy }) => (
                    <Textarea
                      id={id}
                      aria-describedby={describedBy}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Cracked render near the back door — ask about it."
                    />
                  )}
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Where you're up to on this one" optional>
                    {({ id }) => (
                      <Select
                        id={id}
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as PropertyStatus)
                        }
                      >
                        {(
                          [
                            "researching",
                            "inspecting",
                            "offer_consideration",
                            "paused",
                          ] as const
                        ).map((s) => (
                          <option key={s} value={s}>
                            {PROPERTY_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field
                    label="Where you saw it"
                    optional
                    hint="A link for your own reference. We don't open it or read anything from it."
                  >
                    {({ id, describedBy }) => (
                      <Input
                        id={id}
                        type="url"
                        aria-describedby={describedBy}
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://…"
                      />
                    )}
                  </Field>
                </div>
              </div>
            </FormSection>
          </Reveal>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-error-line bg-error-bg px-4 py-3 text-body-sm text-error-fg"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          {/* FR-03-21 — explicit save. The confirmation is the property's own
              page opening with a "Saved" acknowledgement on it. */}
          <div className="flex flex-wrap items-center gap-4 border-t border-line-subtle pt-7">
            <Button type="submit" variant="primary" size="lg">
              <Plus aria-hidden="true" className="size-4" />
              Save this property
            </Button>
            <ButtonLink href={routes.shortlist(journeyId)} variant="tertiary">
              Cancel
            </ButtonLink>
            <p className="flex items-center gap-1.5 text-body-sm text-fg-muted">
              <Check aria-hidden="true" className="size-3.5" />
              {activeProperties.length} of {SHORTLIST_LIMIT} slots used
            </p>
          </div>
        </form>
      </PageLayout>
    </PageShell>
  );
}

function FormSection({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-h4 text-fg-heading">{title}</h2>
      <p className="mt-1.5 text-body-sm text-fg-muted">{body}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** "1,180,000" and "$1.18m" both mean the same thing to a person. */
function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function parseCount(input: string): number | null {
  const n = Number(input.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && input.trim() !== "" ? n : null;
}
