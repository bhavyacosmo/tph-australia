"use client";

import { Bath, BedDouble, Car, Check, FileText, Info, Lock, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PROFESSIONALS,
  STATUS_LABEL,
  type CellKind,
  type StoryProfessional,
  type StoryProperty,
} from "./story-data";

/**
 * Miniature versions of real Stage 1 product surfaces, used as the visual
 * material for the homepage story.
 * docs/03-experience/19-homepage-art-direction.md §5
 *
 * These are demonstrations, not functional screens. They hold no state and
 * submit nothing. They exist so the page can SHOW the product instead of
 * describing it.
 *
 * Nothing here may imply listing supply: no price on a card, no For Sale
 * badge, no agent, no rating, no contact detail.
 */

/* ------------------------------------------------------------------ property */

export function MiniPropertyCard({
  property,
  className,
  dim = false,
  onDark = false,
  compact = false,
}: {
  property: StoryProperty;
  className?: string;
  dim?: boolean;
  onDark?: boolean;
  /** Column-header form, used once the shortlist becomes a comparison. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border p-3.5 transition-opacity",
        onDark
          ? "glass text-white"
          : "border-line-subtle bg-surface-card shadow-elev-1",
        dim && "opacity-45",
        className,
      )}
    >
      <p
        className={cn(
          "text-body-sm font-semibold",
          onDark ? "text-white" : "text-fg-heading",
        )}
      >
        {property.address}
      </p>
      <p
        className={cn(
          "mt-0.5 text-caption",
          onDark ? "text-white/60" : "text-fg-muted",
        )}
      >
        {property.suburb}
      </p>

      {!compact && (
        <>
          <div
            className={cn(
              "mt-3 flex items-center gap-3 text-caption",
              onDark ? "text-white/70" : "text-fg-secondary",
            )}
          >
            <span className="inline-flex items-center gap-1">
              <BedDouble aria-hidden="true" className="size-3.5" />
              <span className="tabular">{property.beds}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath aria-hidden="true" className="size-3.5" />
              <span className="tabular">{property.baths}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Car aria-hidden="true" className="size-3.5" />
              <span className="tabular">{property.cars}</span>
            </span>
          </div>

          <span
            className={cn(
              "mt-3 inline-flex rounded-full px-2 py-0.5 text-caption",
              property.status === "inspecting" &&
                "bg-attention-bg text-attention-fg",
              property.status === "offer_consideration" &&
                "bg-info-bg text-info-fg",
              property.status === "researching" &&
                "bg-neutral-bg text-neutral-fg",
            )}
          >
            {STATUS_LABEL[property.status]}
          </span>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- fragments */

/** A single hand-written note, as the user would have saved it. */
export function MiniNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-line-subtle bg-surface-card p-3.5 shadow-elev-1",
        className,
      )}
    >
      <p className="text-overline uppercase text-fg-muted">Your note</p>
      <p className="mt-1.5 text-body-sm italic text-fg-secondary">
        “Cracked render near the back door — ask about it.”
      </p>
    </div>
  );
}

/** An address chip — the smallest fragment. */
export function MiniAddressChip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-card px-3.5 py-2 shadow-elev-1",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-action" />
      <span className="text-caption font-medium text-fg">
        12 Green Street, Carindale
      </span>
    </div>
  );
}

/** The returned professional output. */
export function MiniReport({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3.5",
        onDark
          ? "glass text-white"
          : "border-line-subtle bg-surface-card shadow-elev-1",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
          onDark ? "bg-white/12 text-white" : "bg-error-bg text-error-fg",
        )}
      >
        <FileText aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-body-sm font-semibold",
            onDark ? "text-white" : "text-fg-heading",
          )}
        >
          Building inspection report
        </p>
        <p
          className={cn(
            "text-caption",
            onDark ? "text-white/60" : "text-fg-muted",
          )}
        >
          BuildCheck · 16 Aug · PDF
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- comparison cell */

/**
 * The evidence contract, rendered.
 * [BCC] p.9 — screening data must carry its limitation; an empty official
 * value must read "No data returned", never a favourable value ([C-21]).
 */
export function MiniCell({
  value,
  kind,
  highlighted = false,
  emphasis,
}: {
  value: string;
  kind: CellKind;
  highlighted?: boolean;
  /**
   * Set while the reader is interrogating one provenance type from the legend.
   * `on` = this cell is of that type, `off` = it is not and recedes.
   */
  emphasis?: "on" | "off";
}) {
  const shell = cn(
    "px-3 py-2.5 transition-[opacity,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
    highlighted && "bg-surface-sunken",
    emphasis === "on" && "bg-trustlink-wash",
    emphasis === "off" && "opacity-35",
  );

  if (kind === "nodata") {
    return (
      <div className={shell}>
        <span className="inline-flex items-center gap-1.5 text-caption text-fg-muted">
          <Minus aria-hidden="true" className="size-3" />
          No data returned
        </span>
      </div>
    );
  }

  return (
    <div className={shell}>
      <p
        className={cn(
          "text-body-sm",
          kind === "own" ? "italic text-fg-secondary" : "text-fg",
        )}
      >
        {value}
      </p>
      {kind === "screening" && (
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-info-bg px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-info-fg">
          <Info aria-hidden="true" className="size-2.5" />
          Screening only
        </span>
      )}
      {kind === "confirmed" && (
        <span className="mt-1 block text-[0.6875rem] text-fg-muted">
          BCC · checked 12 Aug
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- professional */

/**
 * Professional card.
 * FR-06-06, FR-06-07 · PRO-05 — verification wording states WHAT was checked
 * and WHEN. There is deliberately no rating, review count, photograph or
 * phone number ([C-15], [C-D], [C-F]).
 */
export function MiniProfessionalCard({
  professional = PROFESSIONALS[0],
  className,
}: {
  professional?: StoryProfessional;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-line-subtle bg-surface-card p-6 shadow-elev-2",
        className,
      )}
    >
      <p className="text-overline uppercase text-fg-muted">
        {professional.category}
      </p>
      <p className="mt-2.5 text-h3 text-fg-heading">{professional.name}</p>
      <p className="text-body-sm text-fg-muted">{professional.area}</p>

      <p className="measure mt-4 text-body-sm text-fg-secondary">
        {professional.approach}
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-success-bg px-3 py-2">
        <Check aria-hidden="true" className="size-3.5 shrink-0 text-success-fg" />
        <span className="text-caption font-medium text-success-fg">
          {professional.verification}
        </span>
      </div>

      <p className="mt-4 border-t border-line-subtle pt-3.5 text-caption text-fg-muted">
        Founding Professional — not a guarantee of outcome.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ prop id */

export function MiniPropIdRecord({
  reportCount = 0,
  className,
}: {
  reportCount?: number;
  className?: string;
}) {
  const rows = [
    { label: "Saved properties", value: "4 of 8" },
    { label: "Comparisons", value: "1" },
    { label: "Trust Link connections", value: "1" },
    { label: "Reports received", value: String(reportCount) },
  ];

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-line-subtle bg-surface-card p-6 shadow-elev-2",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-propid-surface text-propid-surface-fg">
          <Lock aria-hidden="true" className="size-4" />
        </span>
        <div>
          <p className="text-h4 text-fg-heading">Prop ID Lite</p>
          <p className="text-caption text-fg-muted">Your property record</p>
        </div>
      </div>

      <dl className="mt-5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-line-subtle py-2.5 last:border-0 last:pb-0"
          >
            <dt className="text-body-sm text-fg-secondary">{row.label}</dt>
            <dd className="tabular text-body-sm font-semibold text-fg">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
