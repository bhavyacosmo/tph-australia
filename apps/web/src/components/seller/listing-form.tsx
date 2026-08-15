"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ImageOff,
  Send,
} from "lucide-react";

import { SectionHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Select, Textarea } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  FEATURE_OPTIONS,
  LISTING_PROPERTY_TYPES,
  NEARBY_OPTIONS,
  UTILITY_OPTIONS,
} from "@/lib/mock/platform";
import { listingTint } from "@/lib/mock/media";
import { cn } from "@/lib/utils";

/**
 * List a property.
 *
 * Five steps, because a single 30-field form is the fastest way to make a
 * seller abandon one. Each step answers one question and validates before it
 * lets you past — a seller who typed nothing and reached "Publish" would
 * produce a listing a buyer cannot use.
 *
 * ⚠️ NO FILE UPLOAD. Step 4 says so on the page rather than showing a dropzone
 * that silently does nothing. The listing falls back to the same tinted tile the
 * seeded stock without photography uses.
 *
 * The published listing goes into the SAME array the homepage and search read.
 * That is the point of the exercise: sign out, sign in as a buyer, and it is
 * there.
 */

const STEPS = [
  { key: "where", title: "The address" },
  { key: "property", title: "The property" },
  { key: "services", title: "Services and surroundings" },
  { key: "photos", title: "Photos" },
  { key: "listing", title: "Price and description" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

interface Draft {
  listingType: "buy" | "rent";
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  beds: string;
  baths: string;
  cars: string;
  landSize: string;
  features: string[];
  utilities: string[];
  nearby: string[];
  priceGuide: string;
  headline: string;
  description: string;
  inspectionNote: string;
  sellerContact: "through_tph" | "phone" | "email";
}

const EMPTY: Draft = {
  listingType: "buy",
  address: "",
  suburb: "",
  postcode: "",
  propertyType: "House",
  beds: "3",
  baths: "1",
  cars: "1",
  landSize: "",
  features: [],
  utilities: [],
  nearby: [],
  priceGuide: "",
  headline: "",
  description: "",
  inspectionNote: "",
  sellerContact: "through_tph",
};

export function ListingForm() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { createListing } = useJourneyStore();

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [pending, setPending] = useState(false);

  const step = STEPS[index];
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggle = (key: "features" | "utilities" | "nearby", value: string) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value)
        ? d[key].filter((v) => v !== value)
        : [...d[key], value],
    }));

  /** Only the fields a buyer genuinely cannot use the listing without. */
  const validate = (key: StepKey): boolean => {
    const next: Partial<Record<keyof Draft, string>> = {};

    if (key === "where") {
      if (!draft.address.trim()) next.address = "Enter the street address.";
      if (!draft.suburb.trim()) next.suburb = "Enter the suburb.";
      if (!/^\d{4}$/.test(draft.postcode.trim()))
        next.postcode = "Enter a four-digit Australian postcode.";
    }
    if (key === "listing") {
      if (!draft.priceGuide.trim())
        next.priceGuide = "Give buyers a price guide, even an approximate one.";
      if (!draft.headline.trim())
        next.headline = "One line describing the property.";
      if (draft.description.trim().length < 30)
        next.description =
          "Write at least a sentence or two — this is what a buyer reads first.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validate(step.key)) return;
    setIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const back = () => {
    setErrors({});
    setIndex((i) => Math.max(i - 1, 0));
  };

  /**
   * `priceValue` is parsed from whatever the seller typed as a guide. It is used
   * only for sorting and filtering, never displayed — the guide string is what a
   * buyer sees, because a derived number would read as a valuation (FR-03-18).
   */
  const priceValue = Number(draft.priceGuide.replace(/[^\d]/g, "").slice(0, 9)) || 0;

  const submit = (status: "draft" | "published") => {
    if (!validate("where") || !validate("listing")) {
      /* Send the seller back to the first step that is actually wrong. */
      setIndex(errors.address || errors.suburb || errors.postcode ? 0 : 4);
      return;
    }

    setPending(true);
    window.setTimeout(() => {
      createListing({
        listingType: draft.listingType,
        address: draft.address.trim(),
        suburb: draft.suburb.trim(),
        postcode: draft.postcode.trim(),
        propertyType: draft.propertyType,
        priceGuide: draft.priceGuide.trim(),
        priceValue,
        beds: Number(draft.beds) || 0,
        baths: Number(draft.baths) || 0,
        cars: Number(draft.cars) || 0,
        landSize: draft.landSize.trim() || null,
        headline: draft.headline.trim(),
        description: draft.description.trim(),
        features: draft.features,
        utilities: draft.utilities,
        nearby: draft.nearby,
        imageKey: `seller-${Date.now().toString(36)}`,
        inspectionNote: draft.inspectionNote.trim() || null,
        sellerContact: draft.sellerContact,
        status,
      });
      router.push("/seller/properties");
    }, 700);
  };

  return (
    <>
      <SectionHeader
        title="List a property"
        subtitle="Five short steps. Buyers see it in search the moment you publish."
      />

      {/* ------------------------------------------------------------- steps */}
      <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-caption font-semibold transition-colors duration-[var(--duration-base)]",
                i < index && "bg-action text-action-fg",
                i === index && "bg-brand text-brand-fg",
                i > index && "bg-surface-sunken text-fg-muted",
              )}
            >
              {i < index ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-body-sm",
                i === index
                  ? "font-medium text-fg-heading"
                  : "text-fg-muted",
              )}
            >
              {s.title}
            </span>
          </li>
        ))}
      </ol>

      <motion.div
        key={step.key}
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-9"
      >
        {/* ============================================================ where */}
        {step.key === "where" && (
          <div className="space-y-6">
            <fieldset>
              <legend className="text-body-sm font-medium text-fg-heading">
                Are you selling or letting?
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(["buy", "rent"] as const).map((mode) => (
                  <ChoiceRow
                    key={mode}
                    type="radio"
                    name="listingType"
                    value={mode}
                    checked={draft.listingType === mode}
                    onChange={() => set("listingType", mode)}
                    label={mode === "buy" ? "For sale" : "For rent"}
                    description={
                      mode === "buy"
                        ? "Buyers see it under Buy."
                        : "Renters see it under Rent."
                    }
                  />
                ))}
              </div>
            </fieldset>

            <Field label="Street address" error={errors.address}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="25 Pine Road"
                  autoComplete="street-address"
                />
              )}
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Suburb" error={errors.suburb}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={draft.suburb}
                    onChange={(e) => set("suburb", e.target.value)}
                    placeholder="Mansfield"
                  />
                )}
              </Field>

              <Field label="Postcode" error={errors.postcode}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    inputMode="numeric"
                    maxLength={4}
                    value={draft.postcode}
                    onChange={(e) =>
                      set("postcode", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="4122"
                  />
                )}
              </Field>
            </div>

            <Field label="Property type">
              {({ id }) => (
                <Select
                  id={id}
                  value={draft.propertyType}
                  onChange={(e) => set("propertyType", e.target.value)}
                >
                  {LISTING_PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        )}

        {/* ========================================================= property */}
        {step.key === "property" && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {(
                [
                  ["beds", "Bedrooms"],
                  ["baths", "Bathrooms"],
                  ["cars", "Car spaces"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  {({ id }) => (
                    <Select
                      id={id}
                      value={draft[key]}
                      onChange={(e) => set(key, e.target.value)}
                    >
                      {["0", "1", "2", "3", "4", "5", "6"].map((n) => (
                        <option key={n} value={n}>
                          {n}
                          {n === "6" ? "+" : ""}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              ))}
            </div>

            <Field
              label="Land size"
              optional
              hint="Leave blank for an apartment or townhouse without its own land."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={draft.landSize}
                  onChange={(e) => set("landSize", e.target.value)}
                  placeholder="728m²"
                />
              )}
            </Field>

            <CheckGrid
              legend="Features"
              hint="Pick everything that applies. Buyers filter on these."
              options={FEATURE_OPTIONS}
              selected={draft.features}
              onToggle={(v) => toggle("features", v)}
            />
          </div>
        )}

        {/* ========================================================= services */}
        {step.key === "services" && (
          <div className="space-y-9">
            <CheckGrid
              legend="Services and connections"
              hint="Water, power, gas and internet — the things a buyer will otherwise have to ring and ask about."
              options={UTILITY_OPTIONS}
              selected={draft.utilities}
              onToggle={(v) => toggle("utilities", v)}
            />
            <CheckGrid
              legend="What's nearby"
              hint="Only tick what is genuinely within a reasonable walk or short drive."
              options={NEARBY_OPTIONS}
              selected={draft.nearby}
              onToggle={(v) => toggle("nearby", v)}
            />
          </div>
        )}

        {/* =========================================================== photos */}
        {step.key === "photos" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-line bg-surface-sunken p-6">
              <ImageOff
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-fg-muted"
              />
              <div className="min-w-0">
                <p className="text-body font-medium text-fg-heading">
                  Photo upload isn&apos;t wired up in this prototype
                </p>
                <p className="measure mt-2 text-body-sm text-fg-secondary">
                  There is no file storage behind this yet, so rather than show
                  you a dropzone that quietly loses your photos, we haven&apos;t
                  built one. Your listing will use the same typographic tile that
                  seeded properties without photography use — buyers still see
                  the address, price and every detail you entered.
                </p>
              </div>
            </div>

            <div>
              <p className="text-body-sm font-medium text-fg-heading">
                How your listing will appear
              </p>
              <div
                className={cn(
                  "mt-3 grid aspect-[16/10] max-w-md place-items-center rounded-xl bg-gradient-to-br text-center",
                  listingTint(draft.address || "preview"),
                )}
              >
                <div className="px-6">
                  <Camera
                    aria-hidden="true"
                    className="mx-auto size-6 text-white/50"
                  />
                  <p className="mt-3 text-body font-semibold text-white">
                    {draft.address || "Your address"}
                  </p>
                  <p className="text-body-sm text-white/70">
                    {draft.suburb || "Suburb"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== listing */}
        {step.key === "listing" && (
          <div className="space-y-6">
            <Field
              label="Price guide"
              hint="A range is fine. Buyers see exactly what you type here — we never turn it into a valuation."
              error={errors.priceGuide}
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.priceGuide}
                  onChange={(e) => set("priceGuide", e.target.value)}
                  placeholder={
                    draft.listingType === "buy"
                      ? "$1,180,000 – $1,250,000"
                      : "$720 per week"
                  }
                />
              )}
            </Field>

            <Field label="Headline" error={errors.headline}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  maxLength={80}
                  value={draft.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="Four bedrooms with the best layout of the group"
                />
              )}
            </Field>

            <Field
              label="Description"
              hint="What would you tell someone standing at the front gate?"
              error={errors.description}
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Single-level four-bedroom home with separate living and dining…"
                />
              )}
            </Field>

            <Field label="Inspection times" optional>
              {({ id }) => (
                <Input
                  id={id}
                  value={draft.inspectionNote}
                  onChange={(e) => set("inspectionNote", e.target.value)}
                  placeholder="Saturday 10:00 – 10:30am"
                />
              )}
            </Field>

            <fieldset>
              <legend className="text-body-sm font-medium text-fg-heading">
                How should buyers reach you?
              </legend>
              <p className="mt-1 text-body-sm text-fg-muted">
                Whichever you choose, a buyer&apos;s own details reach you only if
                they decide to share them.
              </p>
              <div className="mt-3 space-y-3">
                {(
                  [
                    [
                      "through_tph",
                      "Through The Property Helpline",
                      "Enquiries arrive in your dashboard. Your number stays private.",
                    ],
                    [
                      "phone",
                      "By phone",
                      "Your number is shown on the listing.",
                    ],
                    [
                      "email",
                      "By email",
                      "Your email address is shown on the listing.",
                    ],
                  ] as const
                ).map(([value, label, description]) => (
                  <ChoiceRow
                    key={value}
                    type="radio"
                    name="sellerContact"
                    value={value}
                    checked={draft.sellerContact === value}
                    onChange={() => set("sellerContact", value)}
                    label={label}
                    description={description}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </motion.div>

      {/* ------------------------------------------------------------ footer */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line-subtle pt-7">
        {index > 0 && (
          <Button variant="secondary" size="md" onClick={back}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>
        )}

        {index < STEPS.length - 1 ? (
          <Button variant="primary" size="md" onClick={next} className="group">
            Continue
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              size="md"
              loading={pending}
              onClick={() => submit("published")}
            >
              <Send aria-hidden="true" className="size-4" />
              Publish listing
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => submit("draft")}
            >
              Save as draft
            </Button>
          </>
        )}

        <p className="ml-auto text-caption text-fg-muted">
          Step {index + 1} of {STEPS.length}
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ helpers */

/** A checkbox grid. Nothing is pre-ticked — a seller must claim each one. */
function CheckGrid({
  legend,
  hint,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  hint: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-body-sm font-medium text-fg-heading">
        {legend}
      </legend>
      <p className="mt-1 text-body-sm text-fg-muted">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <label
              key={option}
              className={cn(
                "relative flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-body-sm",
                "transition-[border-color,background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                on
                  ? "border-action bg-trustlink-wash font-medium text-fg-heading"
                  : "border-line-subtle bg-surface-card text-fg-secondary hover:border-line",
              )}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggle(option)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-line-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-page"
              />
              {on && (
                <Check aria-hidden="true" className="size-3.5 text-action" />
              )}
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
