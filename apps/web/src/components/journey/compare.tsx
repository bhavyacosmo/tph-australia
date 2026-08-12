"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Columns3, Info, LayoutList, Table2 } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Breadcrumbs,
  EmptyState,
  PageHeader,
  PageShell,
} from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { EvidenceCell, PROVENANCE_LEGEND } from "@/components/domain/evidence-cell";
import { SaveIndicator, useJustSaved } from "@/components/domain/save-indicator";
import { useJourneyStore } from "@/lib/store/journey-store";
import { CRITERIA, CRITERIA_VERSION } from "@/lib/mock/seed";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { EvidenceKind } from "@/lib/mock/types";

/**
 * S12 — Compare properties. The core value screen, ranked #3 highest-risk.
 *
 * FR-03-09  at least two and up to eight properties
 * FR-03-10  on mobile, cards or a pairwise view rather than a wide table
 * FR-03-11  criteria are versioned DATA (src/lib/mock/seed.ts), not hard-coded
 * FR-03-12  criteria v1 covers all eleven required items
 * FR-03-13  user-entered notes are visually distinguished from verified data
 * FR-03-14  official values carry source, status, limitation, confirmation link
 * FR-03-15  an empty official value reads "No data returned"
 * FR-03-23  a saved comparison records the criteria version it used
 *
 * The risk here is not layout, it is misrepresentation: this is the screen where
 * a screening flood indicator could be read as a formal assessment, which is an
 * Australian Consumer Law exposure ([C-21], [C-22]). Every cell therefore goes
 * through `EvidenceCell`, and the provenance legend lets a reader interrogate
 * where any value came from.
 *
 * Two views, not one shrunk: a table at `lg`, and stacked per-property cards
 * below it (FR-03-10). The desktop table's column headers align exactly with
 * their columns via `<colgroup>` — see the note in the markup.
 */
export function Compare({ journeyId }: { journeyId: string }) {
  const reduce = useReducedMotion();
  const { journey, activeProperties, comparison, saveComparison } =
    useJourneyStore();
  const [justSaved, flashSaved] = useJustSaved();

  const [hoveredKind, setHoveredKind] = useState<EvidenceKind | null>(null);
  const [pinnedKind, setPinnedKind] = useState<EvidenceKind | null>(null);
  const [activeCol, setActiveCol] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<"cards" | "table">("cards");

  const activeKind = hoveredKind ?? pinnedKind;
  const activeHint = PROVENANCE_LEGEND.find((p) => p.kind === activeKind)?.hint;

  const emphasis = (kind: EvidenceKind): "on" | "off" | undefined =>
    activeKind ? (kind === activeKind ? "on" : "off") : undefined;

  const properties = activeProperties;

  if (properties.length < 2) {
    return (
      <PageShell>
        <Breadcrumbs
          trail={[
            { label: "Home Compass", href: routes.journey(journeyId) },
            { label: journey.name, href: routes.journey(journeyId) },
            { label: "Compare" },
          ]}
        />
        <div className="mt-10">
          <EmptyState
            icon={<Columns3 className="size-5" />}
            title="Comparing needs at least two"
            body="Save another home you're considering and they'll appear here side by side, on the criteria you care about."
            action={
              <ButtonLink
                href={routes.addProperty(journeyId)}
                variant="primary"
              >
                Add a property
              </ButtonLink>
            }
          />
        </div>
      </PageShell>
    );
  }

  const save = () => {
    saveComparison(properties.map((p) => p.id));
    flashSaved();
  };

  return (
    <PageShell>
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: journey.name, href: routes.journey(journeyId) },
          { label: "Compare" },
        ]}
      />

      <PageHeader
        className="mt-6"
        title="Side by side"
        subtitle={`Your ${properties.length} saved homes on the things that matter. Every fact shows where it came from.`}
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <SaveIndicator
              lastSavedAt={comparison?.updatedAt ?? journey.lastSavedAt}
              justSaved={justSaved}
            />
            <Button variant="primary" onClick={save}>
              <Check aria-hidden="true" className="size-4" />
              {comparison?.completedAt ? "Save changes" : "Save this comparison"}
            </Button>
          </div>
        }
      />

      {/* ==================================================== provenance legend
          Lifted from the approved homepage Act I. Hover, focus or select a
          marker and every matching cell lights while the rest recede — so a
          reader can ask "which of these did I write?" and get an answer. */}
      <Reveal>
        <section
          aria-labelledby="provenance-heading"
          className="mt-10 rounded-2xl border border-line-subtle bg-surface-sunken p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <h2
                id="provenance-heading"
                className="text-body-sm font-semibold text-fg-heading"
              >
                Where each fact came from
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROVENANCE_LEGEND.map((p) => {
                  const isActive = activeKind === p.kind;
                  return (
                    <button
                      key={p.kind}
                      type="button"
                      aria-pressed={pinnedKind === p.kind}
                      onMouseEnter={() => setHoveredKind(p.kind)}
                      onMouseLeave={() => setHoveredKind(null)}
                      onFocus={() => setHoveredKind(p.kind)}
                      onBlur={() => setHoveredKind(null)}
                      onClick={() =>
                        setPinnedKind((prev) => (prev === p.kind ? null : p.kind))
                      }
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full border bg-surface-card px-3.5 text-body-sm",
                        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                        isActive
                          ? "border-action text-fg-heading"
                          : "border-line-subtle text-fg-secondary hover:border-line hover:text-fg",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn("size-2 shrink-0 rounded-full", p.dot)}
                      />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p
              aria-live="polite"
              className="measure min-h-11 max-w-sm text-body-sm text-fg-secondary"
            >
              {activeHint ?? (
                <span className="text-fg-muted">
                  Hover or select a marker to find it in the table.
                </span>
              )}
            </p>
          </div>
        </section>
      </Reveal>

      {/* --------------------------------------------------- view switch (sm) */}
      <div className="mt-8 flex items-center gap-2 lg:hidden">
        <span className="text-body-sm text-fg-muted">View</span>
        <div className="flex rounded-full border border-line-subtle bg-surface-card p-1">
          <ViewButton
            active={mobileView === "cards"}
            onClick={() => setMobileView("cards")}
            icon={<LayoutList aria-hidden="true" className="size-4" />}
            label="One at a time"
          />
          <ViewButton
            active={mobileView === "table"}
            onClick={() => setMobileView("table")}
            icon={<Table2 aria-hidden="true" className="size-4" />}
            label="Table"
          />
        </div>
      </div>

      {/* ============================================================== table
          Shown at lg always; below lg only when the reader asks for it
          (FR-03-10). It scrolls inside its own container — `min-w-0` on the
          wrapper is load-bearing, or the strip widens the page instead. */}
      <div
        className={cn(
          "mt-6 min-w-0",
          mobileView === "table" ? "block" : "hidden lg:block",
        )}
      >
        <div className="-mx-5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8">
          <div className="min-w-[52rem]">
            {/* Column headers: the properties themselves, aligned to their
                columns by the same 22% gutter the table uses. */}
            <div className="grid grid-cols-[22%_repeat(var(--cols),minmax(0,1fr))] items-stretch"
              style={{ ["--cols" as string]: properties.length }}
            >
              <div aria-hidden="true" />
              {properties.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={reduce ? undefined : { opacity: 0, y: 14 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="min-w-0 px-0.5"
                  onMouseEnter={() => setActiveCol(i)}
                  onMouseLeave={() => setActiveCol(null)}
                >
                  <div className="h-full rounded-xl border border-line-subtle bg-surface-card p-3.5 shadow-elev-1">
                    <p className="text-overline uppercase text-fg-muted">
                      #{i + 1}
                    </p>
                    <Link
                      href={routes.property(journeyId, p.id)}
                      className="mt-1 block text-body-sm font-semibold text-fg-heading underline-offset-4 hover:underline"
                    >
                      {p.address}
                    </Link>
                    <p className="mt-0.5 text-caption text-fg-muted">
                      {p.suburb} QLD {p.postcode}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-line-subtle bg-surface-card">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">
                  Comparison of {properties.length} saved properties across{" "}
                  {CRITERIA.length} criteria
                </caption>
                {/*
                  Column widths MUST live here, not on the first row's cells. An
                  `sr-only` caption is absolutely positioned, and that makes
                  Chrome discard first-row cell widths under `table-fixed` and
                  fall back to equal columns — which silently pulls the data
                  columns out of line with the headers above.
                */}
                <colgroup>
                  <col className="w-[22%]" />
                  {properties.map((p) => (
                    <col key={p.id} />
                  ))}
                </colgroup>
                <tbody>
                  {CRITERIA.map((criterion, r) => (
                    <motion.tr
                      key={criterion.key}
                      initial={reduce ? undefined : { opacity: 0, x: -8 }}
                      whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.36,
                        delay: Math.min(r, 8) * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="border-b border-line-subtle last:border-0"
                    >
                      <th
                        scope="row"
                        className="bg-surface-sunken px-3 py-2.5 text-left align-top text-caption font-medium text-fg-muted"
                      >
                        {criterion.label}
                      </th>
                      {properties.map((p, c) => {
                        const value = p.evidence[criterion.key];
                        return (
                          <td key={p.id} className="align-top">
                            <EvidenceCell
                              evidence={value}
                              highlighted={activeCol === c}
                              emphasis={value ? emphasis(value.kind) : undefined}
                            />
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* [BCC] p.9 / FR-03-14 — screening data carries its limitation
                  wherever it is shown, including in a compressed table */}
              <p className="border-t border-line-subtle bg-surface-sunken px-3 py-2.5 text-caption text-fg-muted">
                Flood is a screening indicator, not a formal assessment. Open a
                property to see the limitation in full and a link to
                Council&apos;s FloodWise report.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================== stacked cards (mobile)
          FR-03-10 — a phone gets one property at a time with every criterion
          listed, rather than a table squeezed to 375px. */}
      <div
        className={cn(
          "mt-6 space-y-6",
          mobileView === "cards" ? "block lg:hidden" : "hidden",
        )}
      >
        {properties.map((p, i) => (
          <section
            key={p.id}
            aria-labelledby={`compare-card-${p.id}`}
            className="overflow-hidden rounded-2xl border border-line-subtle bg-surface-card"
          >
            <div className="flex items-baseline justify-between gap-3 border-b border-line-subtle bg-surface-sunken px-4 py-3">
              <div className="min-w-0">
                <p className="text-overline uppercase text-fg-muted">
                  #{i + 1}
                </p>
                <h2
                  id={`compare-card-${p.id}`}
                  className="mt-0.5 text-body font-semibold text-fg-heading"
                >
                  {p.address}
                </h2>
                <p className="text-caption text-fg-muted">
                  {p.suburb} QLD {p.postcode}
                </p>
              </div>
              <Link
                href={routes.property(journeyId, p.id)}
                className="shrink-0 text-body-sm text-fg-link underline-offset-4 hover:underline"
              >
                Open
              </Link>
            </div>

            <dl className="divide-y divide-line-subtle">
              {CRITERIA.map((criterion) => {
                const value = p.evidence[criterion.key];
                return (
                  <div
                    key={criterion.key}
                    className="grid grid-cols-[40%_1fr] items-start gap-2 px-4 py-1"
                  >
                    <dt className="pt-3 text-caption text-fg-muted">
                      {criterion.label}
                    </dt>
                    <dd className="min-w-0">
                      <EvidenceCell
                        evidence={value}
                        emphasis={value ? emphasis(value.kind) : undefined}
                        density="full"
                      />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>

      {/* --------------------------------------------------------- provenance */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-6">
        <p className="flex items-start gap-2 text-body-sm text-fg-muted">
          <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {/* FR-03-23 — the version is recorded with the saved comparison, and
                shown so a returning user knows the basis changed if it did */}
            Criteria set <span className="tabular">{CRITERIA_VERSION}</span>
            {comparison?.completedAt && (
              <> · saved {formatRelative(comparison.completedAt)}</>
            )}
          </span>
        </p>
        {comparison?.completedAt && (
          <StatusChip tone="success">Comparison saved</StatusChip>
        )}
      </div>
    </PageShell>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-full px-4 text-body-sm",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
        active
          ? "bg-surface-sunken font-medium text-fg-heading"
          : "text-fg-secondary hover:text-fg",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
