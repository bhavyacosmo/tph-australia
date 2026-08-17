"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CompassWizard } from "@/components/search/compass-wizard";
import { cn } from "@/lib/utils";

/**
 * The property search control.
 *
 * The client pointed at domain.com.au and said the search bar has to be on the
 * hero (transcript L15-27, L45-53). This is that control — but built in our own
 * language rather than copied: one wide field on a raised surface, a segmented
 * Buy/Rent control instead of a dropdown, and filters that stay collapsed until
 * asked for, because the client also warned against overcrowding the hero
 * (L63-67).
 *
 * ⚠️ Searches a hand-written demo index. There is no feed and no API — see
 * src/lib/mock/marketplace.ts.
 */

export const PROPERTY_TYPES = [
  "Any type",
  "House",
  "Townhouse",
  "Apartment",
  "Land",
];

export const BED_OPTIONS = ["Any", "1+", "2+", "3+", "4+"];

export const PRICE_OPTIONS = [
  { value: "any", label: "Any price" },
  { value: "1000000", label: "Up to $1m" },
  { value: "1250000", label: "Up to $1.25m" },
  { value: "1500000", label: "Up to $1.5m" },
];

export interface SearchParamsShape {
  where: string;
  mode: "buy" | "rent";
  type: string;
  beds: string;
  price: string;
}

export function buildSearchHref(params: Partial<SearchParamsShape>): string {
  const q = new URLSearchParams();
  if (params.where) q.set("where", params.where);
  if (params.mode && params.mode !== "buy") q.set("mode", params.mode);
  if (params.type && params.type !== "Any type") q.set("type", params.type);
  if (params.beds && params.beds !== "Any") q.set("beds", params.beds);
  if (params.price && params.price !== "any") q.set("price", params.price);
  const s = q.toString();
  return s ? `/search?${s}` : "/search";
}

export function PropertySearchBar({
  initial,
  /** `hero` sits on the dark hero; `page` sits on a light surface */
  tone = "hero",
  /**
   * Centres the Buy/Rent control above the bar. An explicit prop rather than
   * inherited `text-align`, because centring the parent would also centre the
   * input's own text and the filter labels, which must stay left-aligned.
   */
  align = "left",
  /**
   * What the Filters button does.
   *
   *   `inline` — the three-select panel drops out of the bar. Correct on the
   *              results page, where the visitor is adjusting a search they can
   *              already see.
   *   `wizard` — opens Home Compass one question at a time. Correct on the
   *              homepage, where there are no results yet and the visitor is
   *              describing a search rather than narrowing one.
   */
  filterMode = "inline",
  className,
}: {
  initial?: Partial<SearchParamsShape>;
  tone?: "hero" | "page";
  align?: "left" | "center";
  filterMode?: "inline" | "wizard";
  className?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [where, setWhere] = useState(initial?.where ?? "");
  const [mode, setMode] = useState<"buy" | "rent">(initial?.mode ?? "buy");
  const [type, setType] = useState(initial?.type ?? "Any type");
  const [beds, setBeds] = useState(initial?.beds ?? "Any");
  const [price, setPrice] = useState(initial?.price ?? "any");
  const [showFilters, setShowFilters] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const submit = () => {
    router.push(buildSearchHref({ where, mode, type, beds, price }));
  };

  const onDark = tone === "hero";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn("w-full", className)}
      role="search"
      aria-label="Property search"
    >
      {/* ---------------------------------------------------------- buy / rent
          Rebuilt August 2026: the previous control was a quiet pill pair that
          reviewers kept missing, so nobody was sure which mode they were
          searching in. Three changes fix that without adding chrome —

            · the track is white with NAVY labels, and the chosen half inverts
              to white-on-navy — the colour swap is the state, so it reads at a
              glance rather than on inspection (client review, 17 Aug 2026;
              green was tried first and lost to navy, which is the brand's own
              voice and does not compete with the green Search button beside
              it);
            · the capsule slides between halves on a spring, which is what makes
              the switch legible as a state change rather than a repaint;
            · each half is equal width and labelled with what it means
              ("To buy" / "To rent"), because a bare "Buy" beside a search field
              can be read as a verb.

          `role="radiogroup"` rather than two toggle buttons: these are two
          values of one setting, and a screen reader should hear it that way. */}
      <div
        role="radiogroup"
        aria-label="Search to buy or to rent"
        className={cn(
          "relative flex w-fit rounded-full bg-surface-card p-1 ring-1 ring-line-subtle",
          align === "center" && "mx-auto",
        )}
      >
        {(["buy", "rent"] as const).map((option) => {
          const active = mode === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(option)}
              className={cn(
                "relative flex min-h-11 w-28 items-center justify-center rounded-full text-body-sm font-semibold",
                "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                /* Navy on white when idle, white on navy when chosen. The
                   colour inversion IS the state — a reviewer should never have
                   to look twice to know which mode they are searching in. */
                active ? "text-white" : "text-brand hover:text-navy-700",
              )}
            >
              {/*
                The capsule is a SIBLING painted first, with the label lifted
                above it — not a `-z-10` child.

                `position: relative` with `z-index: auto` does not create a
                stacking context, so a negatively-stacked child escaped past the
                button and painted *behind the track's white background*. The
                selected label was then white-on-white and the slide was
                invisible, which is exactly what the client kept reporting.
              */}
              {active && (
                <motion.span
                  layoutId={reduce ? undefined : `search-mode-${tone}`}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 32 }
                  }
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-brand shadow-control"
                />
              )}
              <span className="relative">
                {option === "buy" ? "To buy" : "To rent"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- the bar */}
      <div
        className={cn(
          "mt-3 flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center",
          onDark
            ? "bg-surface-card shadow-elev-3"
            : "border border-line-subtle bg-surface-card shadow-elev-1",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
          <Search aria-hidden="true" className="size-5 shrink-0 text-fg-muted" />
          <label htmlFor={`where-${tone}`} className="sr-only">
            Suburb or postcode
          </label>
          <input
            id={`where-${tone}`}
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Suburb or postcode — try Carindale"
            autoComplete="off"
            className="min-h-12 w-full min-w-0 bg-transparent text-body text-fg placeholder:text-fg-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="tertiary"
            onClick={() =>
              filterMode === "wizard"
                ? setWizardOpen(true)
                : setShowFilters((v) => !v)
            }
            aria-expanded={filterMode === "wizard" ? wizardOpen : showFilters}
            aria-haspopup={filterMode === "wizard" ? "dialog" : undefined}
            className="shrink-0"
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Filters
          </Button>
          <Button type="submit" variant="primary" size="lg" className="shrink-0">
            <Search aria-hidden="true" className="size-4" />
            Search
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------ filters */}
      {filterMode === "wizard" && (
        <CompassWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          mode={mode}
        />
      )}

      <motion.div
        initial={false}
        animate={{
          height: showFilters && filterMode === "inline" ? "auto" : 0,
          opacity: showFilters && filterMode === "inline" ? 1 : 0,
        }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
        }
        className="overflow-hidden"
      >
        <div
          className={cn(
            "mt-3 grid gap-3 rounded-2xl p-4 sm:grid-cols-3",
            onDark ? "bg-white/10 backdrop-blur" : "bg-surface-sunken",
          )}
        >
          <Filter
            label="Property type"
            value={type}
            onChange={setType}
            options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
            onDark={onDark}
            id={`type-${tone}`}
          />
          <Filter
            label="Bedrooms"
            value={beds}
            onChange={setBeds}
            options={BED_OPTIONS.map((b) => ({ value: b, label: b }))}
            onDark={onDark}
            id={`beds-${tone}`}
          />
          <Filter
            label="Price"
            value={price}
            onChange={setPrice}
            options={PRICE_OPTIONS}
            onDark={onDark}
            id={`price-${tone}`}
          />
        </div>
      </motion.div>
    </form>
  );
}

function Filter({
  id,
  label,
  value,
  onChange,
  options,
  onDark,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  onDark: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "block text-caption font-medium",
          onDark ? "text-white/70" : "text-fg-muted",
        )}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1.5 min-h-11 w-full rounded-md border px-3 text-body-sm",
          onDark
            ? "border-white/20 bg-navy-900/40 text-white"
            : "border-line bg-surface-card text-fg",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
