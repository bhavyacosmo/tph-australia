"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowUp,
  Columns3,
  Home,
  Plus,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import {
  Breadcrumbs,
  EmptyState,
  PageHeader,
  PageLayout,
  PageShell,
  RailPanel,
} from "@/components/ui/page";
import { PropertyCard } from "@/components/domain/property-card";
import { SaveIndicator } from "@/components/domain/save-indicator";
import { useJourneyStore } from "@/lib/store/journey-store";
import { PROPERTY_STATUS_LABEL, SHORTLIST_LIMIT } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";
import type { PropertyStatus } from "@/lib/mock/types";

/**
 * S11 — Shortlist.
 *
 * FR-03-05  save, edit, remove, archive and reorder
 * FR-03-06  limited to eight properties per journey
 * FR-03-07  exceeding eight produces a CLEAR MESSAGE, not a silent failure
 * FR-03-08  removal is confirmed before deletion, or safely archived
 * FR-03-16  every property carries a status
 *
 * The reorder is deliberately buttons rather than drag-and-drop: drag is
 * unusable by keyboard, awkward on touch, and this list is at most eight items.
 * Shared layout animation carries the movement so the card is seen to travel.
 *
 * Not a listing grid. One card per row, the user's own note visible on each,
 * ranked by their order — because the order IS their ranking (FR-03-17).
 */
export function Shortlist({ journeyId }: { journeyId: string }) {
  const reduce = useReducedMotion();
  const {
    journey,
    activeProperties,
    archivedProperties,
    moveProperty,
    archiveProperty,
    restoreProperty,
    setPropertyStatus,
  } = useJourneyStore();

  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);
  const atLimit = activeProperties.length >= SHORTLIST_LIMIT;

  return (
    <PageShell>
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: journey.name, href: routes.journey(journeyId) },
          { label: "Shortlist" },
        ]}
      />

      <PageHeader
        className="mt-6"
        title="Your shortlist"
        subtitle="The homes you're considering, in your order. Move the one you like most to the top."
        actions={
          atLimit ? (
            <span className="text-body-sm text-fg-muted">
              {SHORTLIST_LIMIT} of {SHORTLIST_LIMIT} saved
            </span>
          ) : (
            <ButtonLink href={routes.addProperty(journeyId)} variant="primary">
              <Plus aria-hidden="true" className="size-4" />
              Add a property
            </ButtonLink>
          )
        }
      />

      <PageLayout
        rail={
          <div className="space-y-5">
            <RailPanel title="This shortlist">
              <dl className="space-y-3 text-body-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-fg-muted">Saved</dt>
                  <dd className="tabular font-semibold text-fg-heading">
                    {activeProperties.length} of {SHORTLIST_LIMIT}
                  </dd>
                </div>
                {archivedProperties.length > 0 && (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-fg-muted">Archived</dt>
                    <dd className="tabular font-semibold text-fg-heading">
                      {archivedProperties.length}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 space-y-2.5">
                <ButtonLink
                  href={routes.compare(journeyId)}
                  variant="secondary"
                  fullWidth
                  className={activeProperties.length < 2 ? "pointer-events-none opacity-40" : undefined}
                  aria-disabled={activeProperties.length < 2 || undefined}
                >
                  <Columns3 aria-hidden="true" className="size-4" />
                  Compare these
                </ButtonLink>
                {/* FR-03-09 — comparison needs at least two */}
                {activeProperties.length < 2 && (
                  <p className="text-caption text-fg-muted">
                    Comparing needs at least two saved properties.
                  </p>
                )}
              </div>

              <SaveIndicator
                lastSavedAt={journey.lastSavedAt}
                className="mt-5 border-t border-line-subtle pt-4"
              />
            </RailPanel>

            {/* FR-03-07 — the limit is explained BEFORE it is hit, and clearly
                when it is */}
            <RailPanel tone={atLimit ? "sunken" : "wash"}>
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                {atLimit ? (
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-attention-fg"
                  />
                ) : (
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                )}
                <span>
                  {atLimit ? (
                    <>
                      You&apos;ve saved the maximum of {SHORTLIST_LIMIT}. Archive
                      one you&apos;ve ruled out and the slot comes back — nothing
                      is deleted.
                    </>
                  ) : (
                    <>
                      A shortlist holds up to {SHORTLIST_LIMIT} homes. Keeping it
                      short is the point — it&apos;s a decision list, not a
                      catalogue.
                    </>
                  )}
                </span>
              </p>
            </RailPanel>
          </div>
        }
      >
        {activeProperties.length === 0 ? (
          <EmptyState
            icon={<Home className="size-5" />}
            title="Nothing saved yet"
            body="Add the first home you're considering. Address and a few details is enough — you can add your notes as you go."
            action={
              <ButtonLink href={routes.addProperty(journeyId)} variant="primary">
                <Plus aria-hidden="true" className="size-4" />
                Add a property
              </ButtonLink>
            }
          />
        ) : (
          <ol className="space-y-4">
            <AnimatePresence initial={false}>
              {activeProperties.map((property, i) => (
                <motion.li
                  key={property.id}
                  layout={!reduce}
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PropertyCard
                    property={property}
                    rank={i + 1}
                    href={routes.property(journeyId, property.id)}
                    actions={
                      <>
                        {/* FR-03-05 reorder — keyboard-operable by construction */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="tertiary"
                            size="icon"
                            onClick={() => moveProperty(property.id, -1)}
                            disabled={i === 0}
                            aria-label={`Move ${property.address} up`}
                          >
                            <ArrowUp aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            variant="tertiary"
                            size="icon"
                            onClick={() => moveProperty(property.id, 1)}
                            disabled={i === activeProperties.length - 1}
                            aria-label={`Move ${property.address} down`}
                          >
                            <ArrowDown aria-hidden="true" className="size-4" />
                          </Button>
                        </div>

                        {/* FR-03-16 — status, changeable inline */}
                        <label className="flex items-center gap-2 text-body-sm text-fg-muted">
                          <span className="sr-only sm:not-sr-only">Status</span>
                          <Select
                            value={property.status}
                            onChange={(e) =>
                              setPropertyStatus(
                                property.id,
                                e.target.value as PropertyStatus,
                              )
                            }
                            aria-label={`Status for ${property.address}`}
                            className="h-11 w-auto min-w-44"
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
                        </label>

                        <Link
                          href={routes.property(journeyId, property.id)}
                          className="ml-auto flex min-h-11 items-center text-body-sm text-fg-link underline-offset-4 hover:underline"
                        >
                          Open
                        </Link>

                        <Button
                          variant="tertiary"
                          size="icon"
                          onClick={() => setConfirmArchive(property.id)}
                          aria-label={`Archive ${property.address}`}
                        >
                          <Archive aria-hidden="true" className="size-4" />
                        </Button>
                      </>
                    }
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}

        {/* -------------------------------------------------------- archived */}
        {archivedProperties.length > 0 && (
          <section aria-labelledby="archived-heading" className="mt-12">
            <h2 id="archived-heading" className="text-h4 text-fg-heading">
              Archived
            </h2>
            <p className="mt-2 text-body-sm text-fg-secondary">
              Kept, not deleted. Restore one at any time — it doesn&apos;t count
              towards your {SHORTLIST_LIMIT}.
            </p>
            <ul className="mt-5 space-y-3">
              {archivedProperties.map((property) => (
                <li
                  key={property.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-line-subtle bg-surface-sunken p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-fg-heading">
                      {property.address}
                    </p>
                    <p className="text-caption text-fg-muted">
                      {property.suburb} QLD {property.postcode}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => restoreProperty(property.id)}
                    disabled={atLimit}
                  >
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageLayout>

      {/* FR-03-08 — confirm before removing. Archive is offered as the safe
          option, and it is the only destructive-looking action available. */}
      <ConfirmArchive
        propertyId={confirmArchive}
        onCancel={() => setConfirmArchive(null)}
        onConfirm={(id) => {
          archiveProperty(id);
          setConfirmArchive(null);
        }}
      />
    </PageShell>
  );
}

function ConfirmArchive({
  propertyId,
  onCancel,
  onConfirm,
}: {
  propertyId: string | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const { getProperty } = useJourneyStore();
  const property = propertyId ? getProperty(propertyId) : undefined;

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          key="scrim"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 grid place-items-center bg-navy-900/50 p-5 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-title"
            initial={reduce ? undefined : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl border border-line-subtle bg-surface-card p-6 shadow-elev-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="archive-title" className="text-h3 text-fg-heading">
              Archive {property.address}?
            </h2>
            <p className="mt-3 text-body text-fg-secondary">
              It comes off your shortlist and frees up a slot. Your notes, status
              and ranking are kept, and you can restore it whenever you like —
              nothing is deleted.
            </p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={onCancel}>
                Keep it
              </Button>
              <Button variant="primary" onClick={() => onConfirm(property.id)}>
                <Archive aria-hidden="true" className="size-4" />
                Archive it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
