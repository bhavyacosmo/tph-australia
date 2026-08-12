"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  className,
}: {
  initial?: Partial<SearchParamsShape>;
  tone?: "hero" | "page";
  align?: "left" | "center";
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
      {/* ---------------------------------------------------------- buy / rent */}
      <div
        className={cn(
          "flex w-fit rounded-full p-1",
          align === "center" && "mx-auto",
          onDark ? "bg-white/10" : "bg-surface-sunken",
        )}
      >
        {(["buy", "rent"] as const).map((option) => {
          const active = mode === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={active}
              className={cn(
                "relative flex min-h-11 items-center rounded-full px-6 text-body-sm font-medium capitalize",
                "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                active
                  ? onDark
                    ? "text-navy-900"
                    : "text-fg-heading"
                  : onDark
                    ? "text-white/70 hover:text-white"
                    : "text-fg-secondary hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId={reduce ? undefined : `search-mode-${tone}`}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "absolute inset-0 -z-10 rounded-full",
                    onDark ? "bg-white" : "bg-surface-card shadow-elev-1",
                  )}
                />
              )}
              {option}
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
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
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
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? "auto" : 0,
          opacity: showFilters ? 1 : 0,
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
