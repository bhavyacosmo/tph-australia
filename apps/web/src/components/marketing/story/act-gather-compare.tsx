"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Minus } from "lucide-react";

import { Container } from "@/components/ui/section";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { MiniCell, MiniPropertyCard } from "./product-ui";
import {
  COMPARISON_ROWS,
  STORY_PROPERTIES,
  type CellKind,
} from "./story-data";
import { cn } from "@/lib/utils";

/**
 * Act I — "Gathered, and clearer".
 * docs/03-experience/19-homepage-art-direction.md §4 (revised — see §12)
 *
 * REPLACES the original pinned two-phase scene. That version held 240vh of
 * scroll to deliver a single binary swap: a vertical stack of four cards became
 * a row, and a table appeared. Three things were wrong with it — the opening
 * state was literally a column of cards (the one composition the art direction
 * forbids), the swap fired at one scroll threshold so it read as a jump cut
 * rather than a transition, and the stack was taller than the pinned viewport
 * so its first card was clipped off the top.
 *
 * The comparison is now the resolved state and it is always present. The
 * gathering is expressed as an ENTRANCE — the four cards arrive from scattered,
 * off-axis positions and settle into the columns they head, then the evidence
 * fills in row by row beneath them. Same story, one second, no scroll hijack.
 *
 * The interaction is the provenance legend: every fact in the real product
 * carries where it came from (FR-03-13), and here the reader can interrogate
 * that directly instead of reading a paragraph about it.
 */

const EASE_QUINT = [0.22, 1, 0.36, 1] as const;

/**
 * Where each card travels FROM. Chosen, not random: the outer two drift in from
 * the margins and the inner two from further below, so the group converges
 * rather than sliding in formation.
 */
const SCATTER = [
  { x: -54, y: 32, rotate: -5 },
  { x: 24, y: 58, rotate: 3.5 },
  { x: -28, y: 64, rotate: 4 },
  { x: 48, y: 36, rotate: -3 },
] as const;

const PROVENANCE: {
  kind: CellKind;
  label: string;
  hint: string;
}[] = [
  {
    kind: "own",
    label: "Yours",
    hint: "You entered it. It stays marked as yours, and we never present it as an official figure.",
  },
  {
    kind: "confirmed",
    label: "Council-confirmed",
    hint: "From Brisbane City Council open data, carrying the date it was checked.",
  },
  {
    kind: "screening",
    label: "Screening only",
    hint: "An early indicator, not a formal assessment. Confirm it in Council's own report before you rely on it.",
  },
  {
    kind: "nodata",
    label: "No data",
    hint: "Nothing was returned for this property. An empty answer is shown as empty — never as a favourable one.",
  },
];

export function ActGatherCompare() {
  const reduce = useReducedMotion();
  const [activeCol, setActiveCol] = useState<number | null>(null);

  /*
    Two sources for the same highlight so it works by pointer, by keyboard and
    by touch: hover/focus is transient, click pins. Transient wins while it is
    active, which is what a reader expects when they move the mouse over a
    legend they had previously tapped.
  */
  const [hoveredKind, setHoveredKind] = useState<CellKind | null>(null);
  const [pinnedKind, setPinnedKind] = useState<CellKind | null>(null);
  const activeKind = hoveredKind ?? pinnedKind;
  const activeHint = PROVENANCE.find((p) => p.kind === activeKind)?.hint;

  const cellEmphasis = (kind: CellKind): "on" | "off" | undefined => {
    if (!activeKind) return undefined;
    return kind === activeKind ? "on" : "off";
  };

  return (
    <section
      aria-labelledby="act-gather-heading"
      className="bg-surface-card"
    >
      <Container className="py-20 md:py-28 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-14">
          {/* ------------------------------------------------------ narration */}
          <div className="lg:col-span-4">
            {/* Plain eyebrow, not a step number. The homepage no longer runs as
                a strict numbered sequence — the marketplace block sits between
                these sections — so numbering left a visible gap. */}
            <p className="text-overline uppercase text-fg-muted">
              Property comparison
            </p>
            <h2 id="act-gather-heading" className="mt-5 text-h1 text-fg-heading">
              Everything in one place, side by side
            </h2>
            <p className="measure mt-5 text-body text-fg-secondary">
              Add the homes you&apos;re already considering — up to eight — with
              your own notes and ranking. Then compare them on what actually
              matters to you.
            </p>

            <div className="mt-8 inline-flex items-baseline gap-2.5 rounded-full border border-line-subtle bg-surface-sunken px-4 py-2">
              <span className="tabular text-h3 font-bold text-action">
                <AnimatedNumber value={4} />
              </span>
              <span className="text-body-sm text-fg-secondary">of 8 saved</span>
            </div>

            {/* --------------------------------------------------- provenance */}
            <div className="mt-12 border-t border-line-subtle pt-8">
              <p className="text-body-sm font-semibold text-fg-heading">
                Every fact shows where it came from
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {PROVENANCE.map((p) => {
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
                        "inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-body-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                        isActive
                          ? "border-action bg-trustlink-wash text-fg-heading"
                          : "border-line-subtle text-fg-secondary hover:border-line hover:text-fg",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex size-2 shrink-0 rounded-full",
                          p.kind === "own" && "bg-fg-muted",
                          p.kind === "confirmed" && "bg-action",
                          p.kind === "screening" && "bg-info-fg",
                          p.kind === "nodata" && "bg-line",
                        )}
                      />
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/*
                Fixed minimum height. The hint must not push the comparison
                around as the reader moves between chips.
              */}
              <p
                aria-live="polite"
                className="measure mt-4 min-h-16 text-body-sm text-fg-secondary"
              >
                {activeHint ?? (
                  <span className="text-fg-muted">
                    Hover or select a marker to see it in the comparison.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------- stage */}
          {/*
            `min-w-0` is load-bearing. A grid item's automatic minimum size is
            its content's min-content width, so the 40rem scroll strip below
            would otherwise widen this column to 640px and push the whole PAGE
            into horizontal overflow on a phone instead of scrolling inside its
            own container.
          */}
          <div className="min-w-0 lg:col-span-7 lg:col-start-6">
            {/*
              Below lg, four columns cannot stay legible at phone widths, so the
              whole stage scrolls horizontally as ONE unit — the cards and the
              columns they head must never be separated from each other.
            */}
            <div className="-mx-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
              <div className="min-w-[40rem] lg:min-w-0">
                {/* Column headers: the four saved homes, arriving */}
                <div className="grid grid-cols-[22%_repeat(4,minmax(0,1fr))] items-stretch">
                  <div aria-hidden="true" />
                  {STORY_PROPERTIES.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={
                        reduce
                          ? undefined
                          : { opacity: 0, ...SCATTER[i], scale: 0.94 }
                      }
                      whileInView={
                        reduce
                          ? undefined
                          : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                      }
                      viewport={{ once: true, margin: "-90px" }}
                      transition={{
                        duration: 0.72,
                        delay: i * 0.08,
                        ease: EASE_QUINT,
                      }}
                      className="min-w-0 px-0.5"
                      onMouseEnter={() => setActiveCol(i)}
                      onMouseLeave={() => setActiveCol(null)}
                    >
                      <MiniPropertyCard property={p} compact />
                    </motion.div>
                  ))}
                </div>

                {/* The evidence, filling in under them */}
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-90px" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.34,
                    ease: EASE_QUINT,
                  }}
                  className="mt-2 overflow-hidden rounded-xl border border-line-subtle bg-surface-card"
                >
                  <table className="w-full table-fixed border-collapse">
                    <caption className="sr-only">
                      Example comparison of four saved properties
                    </caption>
                    {/*
                      Column widths MUST live here, not on the first row's
                      cells. An `sr-only` caption is absolutely positioned, and
                      that makes Chrome discard first-row cell widths under
                      `table-fixed` and fall back to equal columns — which
                      silently pulled the data columns out of line with the
                      cards heading them. A colgroup is authoritative.
                    */}
                    <colgroup>
                      <col className="w-[22%]" />
                      <col span={4} />
                    </colgroup>
                    <tbody>
                      {COMPARISON_ROWS.map((row, r) => (
                        <motion.tr
                          key={row.criterion}
                          initial={reduce ? undefined : { opacity: 0, x: -10 }}
                          whileInView={
                            reduce ? undefined : { opacity: 1, x: 0 }
                          }
                          viewport={{ once: true, margin: "-90px" }}
                          transition={{
                            duration: 0.42,
                            delay: 0.46 + r * 0.07,
                            ease: EASE_QUINT,
                          }}
                          className="border-b border-line-subtle last:border-0"
                        >
                          <th
                            scope="row"
                            className="bg-surface-sunken px-3 py-2.5 text-left align-top text-caption font-medium text-fg-muted"
                          >
                            {row.criterion}
                          </th>
                          {row.cells.map((cell, c) => (
                            <td key={c} className="align-top">
                              <MiniCell
                                value={cell.value}
                                kind={cell.kind}
                                highlighted={activeCol === c}
                                emphasis={cellEmphasis(cell.kind)}
                              />
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>

                  {/* [BCC] p.9 — screening data carries its limitation */}
                  <p className="flex items-start gap-2 border-t border-line-subtle bg-surface-sunken px-3 py-2.5 text-caption text-fg-muted">
                    <Minus aria-hidden="true" className="mt-1 size-3 shrink-0" />
                    <span>
                      Flood is a screening indicator, not a formal assessment.
                      Confirm in Council&apos;s FloodWise report.
                    </span>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
