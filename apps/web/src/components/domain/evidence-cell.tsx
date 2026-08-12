"use client";

import { ExternalLink, Info, Minus, PenLine } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/format";
import type { EvidenceValue } from "@/lib/mock/types";

/**
 * EvidenceCell — docs/03-experience/11-component-library.md §3.1
 * **The most important component in the system.**
 *
 * Promoted from the approved homepage `MiniCell`, now carrying the full
 * contract:
 *
 *   FR-03-13  user-entered notes are visually distinguished from verified data
 *   FR-03-14  official values display source and status; SCREENING data also
 *             displays the limitation and a link to confirm officially
 *   FR-03-15  an empty official value renders "No data returned" — never a
 *             favourable value
 *   FR-03-19  TPH never claims to have verified what it has not verified
 *
 * [C-21]/[C-22]: misrepresenting a risk here is an Australian Consumer Law
 * exposure, not a cosmetic bug. The limitation text is therefore not optional
 * styling — a `screening` value without one is a defect.
 */

export function EvidenceCell({
  evidence,
  /** Column hover in a comparison */
  highlighted = false,
  /** Set while the reader is interrogating one provenance type */
  emphasis,
  /** `compact` in table cells, `full` on the property detail screen */
  density = "compact",
  className,
}: {
  evidence: EvidenceValue | undefined;
  highlighted?: boolean;
  emphasis?: "on" | "off";
  density?: "compact" | "full";
  className?: string;
}) {
  const shell = cn(
    "transition-[opacity,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
    density === "compact" ? "px-3 py-2.5" : "py-3",
    highlighted && "bg-surface-sunken",
    emphasis === "on" && "bg-trustlink-wash",
    emphasis === "off" && "opacity-35",
    className,
  );

  /* Nothing recorded by the user at all — distinct from "no data returned" */
  if (!evidence) {
    return (
      <div className={shell}>
        <span className="text-caption text-fg-muted">Not recorded</span>
      </div>
    );
  }

  /* FR-03-15 — an empty official value */
  if (evidence.kind === "nodata") {
    return (
      <div className={shell}>
        <span className="inline-flex items-center gap-1.5 text-caption text-fg-muted">
          <Minus aria-hidden="true" className="size-3 shrink-0" />
          No data returned
        </span>
        {evidence.source && (
          <span className="mt-1 block text-[0.6875rem] text-fg-muted">
            {evidence.source}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={shell}>
      <p
        className={cn(
          "text-body-sm",
          /* FR-03-13 — the user's own words are italic and secondary, so they
             can never be mistaken for a verified figure */
          evidence.kind === "own" ? "italic text-fg-secondary" : "text-fg",
        )}
      >
        {evidence.value}
      </p>

      {evidence.kind === "own" && density === "full" && (
        <span className="mt-1 inline-flex items-center gap-1 text-[0.6875rem] text-fg-muted">
          <PenLine aria-hidden="true" className="size-2.5" />
          Your own entry
        </span>
      )}

      {/* FR-03-14 — source and status for confirmed data */}
      {evidence.kind === "confirmed" && (
        <span className="mt-1 block text-[0.6875rem] text-fg-muted">
          {shortSource(evidence.source)}
          {evidence.checkedOn && ` · checked ${formatShortDate(evidence.checkedOn)}`}
        </span>
      )}

      {/* FR-03-14 — screening data MUST carry its limitation and a way to
          confirm it officially. [BCC] p.9 */}
      {evidence.kind === "screening" && (
        <>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-info-bg px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-info-fg">
            <Info aria-hidden="true" className="size-2.5" />
            Screening only
          </span>
          {density === "full" && (
            <>
              {evidence.limitation && (
                <p className="mt-2 text-caption text-fg-secondary">
                  {evidence.limitation}
                </p>
              )}
              {evidence.officialUrl && (
                <a
                  href={evidence.officialUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm text-fg-link underline underline-offset-4 hover:no-underline"
                >
                  {evidence.officialLabel ?? "Confirm officially"}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

/** "Brisbane City Council" → "BCC" in a table cell; full text elsewhere. */
function shortSource(source: string | undefined): string {
  if (!source) return "";
  return source === "Brisbane City Council" ? "BCC" : source;
}

/**
 * The legend for the above. Interactive: hover, focus or select a marker to
 * highlight every matching cell. Lifted from the approved homepage Act I.
 */
export const PROVENANCE_LEGEND = [
  {
    kind: "own" as const,
    label: "Yours",
    hint: "You entered it. It stays marked as yours, and we never present it as an official figure.",
    dot: "bg-fg-muted",
  },
  {
    kind: "confirmed" as const,
    label: "Council-confirmed",
    hint: "From Brisbane City Council open data, carrying the date it was checked.",
    dot: "bg-action",
  },
  {
    kind: "screening" as const,
    label: "Screening only",
    hint: "An early indicator, not a formal assessment. Confirm it in Council's own report before you rely on it.",
    dot: "bg-info-fg",
  },
  {
    kind: "nodata" as const,
    label: "No data",
    hint: "Nothing was returned for this property. An empty answer is shown as empty — never as a favourable one.",
    dot: "bg-line",
  },
];
