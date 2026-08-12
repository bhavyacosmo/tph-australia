"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Archive, Columns3, Star, UserSearch } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import {
  Breadcrumbs,
  PageHeader,
  PageLayout,
  PageShell,
  RailPanel,
} from "@/components/ui/page";
import { PROPERTY_STATUS_TONE, StatusChip } from "@/components/ui/status-chip";
import { EvidenceCell } from "@/components/domain/evidence-cell";
import { PropertyImage } from "@/components/domain/property-image";
import { SaveIndicator, useJustSaved } from "@/components/domain/save-indicator";
import { useJourneyStore } from "@/lib/store/journey-store";
import { CRITERIA, PROPERTY_STATUS_LABEL } from "@/lib/mock/seed";
import { formatDate, formatPrice } from "@/lib/format";
import { isBuilt, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Criterion, PropertyStatus } from "@/lib/mock/types";

/**
 * S13 — Property detail. Reference R3, partially.
 *
 * R3 shows a listing page: agent block, inspection times, "similar properties",
 * a document list. None of that exists here — this is the user's OWN record of
 * a property they are considering ([C-13], FR-05-14). What R3 contributes is the
 * grouped-information layout and the photograph treatment.
 *
 * FR-03-17  notes and a simple personal ranking, per property
 * FR-03-16  status
 * FR-03-13/14  per-property evidence, at full density — this screen is where a
 *              screening limitation and its official confirmation link have room
 *              to be read properly
 * FR-03-21  autosave with visible confirmation
 */

const GROUPS: { key: Criterion["group"]; title: string; body?: string }[] = [
  { key: "price", title: "Price" },
  { key: "property", title: "The property" },
  {
    key: "official",
    title: "Council information",
    body: "From Brisbane City Council open data. We show what was checked and when — and where something is only a screening indicator, we say so.",
  },
  { key: "lifestyle", title: "Area and lifestyle", body: "Your own notes." },
  { key: "decision", title: "Your decision" },
];

export function PropertyDetail({
  journeyId,
  propertyId,
}: {
  journeyId: string;
  propertyId: string;
}) {
  const reduce = useReducedMotion();
  const {
    journey,
    getProperty,
    updateProperty,
    setPropertyStatus,
    archiveProperty,
    activeProperties,
  } = useJourneyStore();
  const [justSaved, flashSaved] = useJustSaved();

  const property = getProperty(propertyId);

  const [note, setNote] = useState(property?.note ?? "");

  if (!property) {
    return (
      <PageShell className="max-w-3xl">
        <PageHeader
          title="That property isn't here"
          subtitle="It may have been archived, or the link may be out of date."
          actions={
            <ButtonLink href={routes.shortlist(journeyId)} variant="primary">
              Back to your shortlist
            </ButtonLink>
          }
        />
      </PageShell>
    );
  }

  /** FR-03-21 — autosave on blur, with a visible acknowledgement */
  const saveNote = () => {
    if (note === property.note) return;
    updateProperty(property.id, { note });
    flashSaved();
  };

  const setRanking = (value: number) => {
    updateProperty(property.id, {
      ranking: property.ranking === value ? null : value,
    });
    flashSaved();
  };

  return (
    <PageShell>
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: journey.name, href: routes.journey(journeyId) },
          { label: "Shortlist", href: routes.shortlist(journeyId) },
          { label: property.address },
        ]}
      />

      {/* ------------------------------------------------------------- hero
          The photograph carries the address rather than sitting above it, so a
          property with no photo (the normal case) still reads as composed. */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-line-subtle bg-surface-card">
        <div className="relative">
          <motion.div
            initial={reduce ? undefined : { scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <PropertyImage
              property={property}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="h-56 w-full md:h-72"
            />
          </motion.div>

          {property.imageKey && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3"
              style={{ background: "var(--hero-scrim-v)" }}
            />
          )}

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-6 md:p-8",
              !property.imageKey && "relative bg-surface-card",
            )}
          >
            <StatusChip
              tone={property.imageKey ? "onDark" : PROPERTY_STATUS_TONE[property.status]}
            >
              {PROPERTY_STATUS_LABEL[property.status]}
            </StatusChip>
            <h1
              className={cn(
                "mt-3 text-h1",
                property.imageKey ? "text-white" : "text-fg-heading",
              )}
            >
              {property.address}
            </h1>
            <p
              className={cn(
                "mt-1 text-body-lg",
                property.imageKey ? "text-white/75" : "text-fg-secondary",
              )}
            >
              {property.suburb} QLD {property.postcode}
              {property.propertyType && ` · ${property.propertyType}`}
            </p>
          </div>
        </div>
      </div>

      <PageLayout
        rail={
          <div className="space-y-5">
            <RailPanel title="Your record">
              <dl className="space-y-3 text-body-sm">
                <Row label="Asking price" value={formatPrice(property.askingPrice)} />
                <Row
                  label="Beds · baths · parking"
                  value={`${property.beds ?? "—"} · ${property.baths ?? "—"} · ${property.cars ?? "—"}`}
                />
                <Row label="Saved" value={formatDate(property.createdAt)} />
                {property.sourceUrl && (
                  <div>
                    <dt className="text-fg-muted">Where you saw it</dt>
                    <dd className="mt-0.5">
                      <a
                        href={property.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="break-all text-fg-link underline underline-offset-4 hover:no-underline"
                      >
                        {property.sourceUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <SaveIndicator
                lastSavedAt={property.updatedAt}
                justSaved={justSaved}
                className="mt-5 border-t border-line-subtle pt-4"
              />
            </RailPanel>

            <RailPanel title="Next">
              <div className="space-y-2.5">
                <ButtonLink
                  href={routes.compare(journeyId)}
                  variant="secondary"
                  fullWidth
                  className={activeProperties.length < 2 ? "pointer-events-none opacity-40" : undefined}
                  aria-disabled={activeProperties.length < 2 || undefined}
                >
                  <Columns3 aria-hidden="true" className="size-4" />
                  Compare with the others
                </ButtonLink>

                {/* The professional directory arrives in a later phase. Inert
                    with an honest label rather than a link to nothing. */}
                {isBuilt(routes.professionals()) ? (
                  <ButtonLink
                    href={routes.professionals()}
                    variant="secondary"
                    fullWidth
                  >
                    <UserSearch aria-hidden="true" className="size-4" />
                    Get this one inspected
                  </ButtonLink>
                ) : (
                  <p className="rounded-md border border-dashed border-line-subtle px-4 py-3 text-body-sm text-fg-muted">
                    <UserSearch
                      aria-hidden="true"
                      className="mr-2 inline size-4 align-text-bottom"
                    />
                    Getting this one inspected arrives with the professional
                    directory.
                  </p>
                )}

                <Button
                  variant="tertiary"
                  fullWidth
                  onClick={() => archiveProperty(property.id)}
                >
                  <Archive aria-hidden="true" className="size-4" />
                  Archive this property
                </Button>
              </div>
            </RailPanel>
          </div>
        }
      >
        {/* --------------------------------------------------- your decision */}
        <Reveal>
          <section
            aria-labelledby="your-view-heading"
            className="rounded-2xl border border-line-subtle bg-surface-card p-6 md:p-7"
          >
            <h2 id="your-view-heading" className="text-h3 text-fg-heading">
              What you think
            </h2>
            <p className="measure mt-2 text-body-sm text-fg-muted">
              Yours alone. Nobody else sees this unless you choose to share it
              through a Trust Link.
            </p>

            <div className="mt-6 space-y-6">
              <Field
                label="Your note"
                hint="Stays marked as your own entry wherever it appears."
              >
                {({ id, describedBy }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={saveNote}
                    placeholder="What did you notice?"
                  />
                )}
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* FR-03-17 — a simple personal ranking */}
                <fieldset>
                  <legend className="text-body-sm font-medium text-fg-heading">
                    Your rating
                  </legend>
                  <p className="mt-1 text-body-sm text-fg-muted">
                    Out of five. Tap the same star again to clear it.
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const on = (property.ranking ?? 0) >= value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRanking(value)}
                          aria-pressed={on}
                          aria-label={`${value} out of 5`}
                          className="grid size-11 place-items-center rounded-md transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken"
                        >
                          <Star
                            aria-hidden="true"
                            className={cn(
                              "size-5 transition-colors duration-[var(--duration-fast)]",
                              on
                                ? "fill-action text-action"
                                : "text-line-strong",
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <Field label="Where you're up to">
                  {({ id }) => (
                    <Select
                      id={id}
                      value={property.status}
                      onChange={(e) => {
                        setPropertyStatus(
                          property.id,
                          e.target.value as PropertyStatus,
                        );
                        flashSaved();
                      }}
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
              </div>
            </div>
          </section>
        </Reveal>

        {/* ------------------------------------------------------- the record */}
        <div className="mt-10 space-y-10">
          {GROUPS.map((group) => {
            const criteria = CRITERIA.filter((c) => c.group === group.key);
            if (criteria.length === 0) return null;

            return (
              <Reveal key={group.key}>
                <section aria-labelledby={`group-${group.key}`}>
                  <h2
                    id={`group-${group.key}`}
                    className="text-h4 text-fg-heading"
                  >
                    {group.title}
                  </h2>
                  {group.body && (
                    <p className="measure mt-2 text-body-sm text-fg-muted">
                      {group.body}
                    </p>
                  )}

                  <dl className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
                    {criteria.map((criterion) => (
                      <div
                        key={criterion.key}
                        className="grid gap-1 py-1 sm:grid-cols-[14rem_1fr] sm:gap-6"
                      >
                        <dt className="pt-3 text-body-sm text-fg-muted">
                          {criterion.label}
                        </dt>
                        <dd className="min-w-0">
                          <EvidenceCell
                            evidence={property.evidence[criterion.key]}
                            density="full"
                          />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </Reveal>
            );
          })}
        </div>
      </PageLayout>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="tabular text-right font-medium text-fg">{value}</dd>
    </div>
  );
}
