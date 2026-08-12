"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRight, Check, Lock, X } from "lucide-react";

import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/**
 * Act III — "Control".
 * docs/03-experience/19-homepage-art-direction.md §4, section 4
 *
 * The strongest moment on the page, and the one that has to be UNDERSTOOD
 * rather than admired — so it is deliberately visually quiet: full navy, grain,
 * no photograph.
 *
 * Items physically travel between "Shared" and "Stays private" via shared
 * layout transition. Not a fade — the element moves, so the reader sees their
 * own decision take effect.
 *
 * Fidelity to requirement (this is a demonstration, but an honest one):
 *   FR-07-04  every optional item begins OFF
 *   FR-07-02  the property address is required by the service and locked on
 *   FR-07-07  the real screen confirms everything before anything is sent
 */

const EASE_QUINT = [0.22, 1, 0.36, 1] as const;

interface Item {
  id: string;
  label: string;
  consequence: string;
  required?: boolean;
}

const ITEMS: Item[] = [
  {
    id: "address",
    label: "Property address",
    consequence: "So they know which home to inspect",
    required: true,
  },
  {
    id: "first-name",
    label: "Your first name",
    consequence: "So they know who they're helping",
  },
  {
    id: "attributes",
    label: "Property details",
    consequence: "Bedrooms, bathrooms, parking, asking price",
  },
  { id: "notes", label: "Your notes on this property", consequence: "" },
  {
    id: "phone",
    label: "Your phone number",
    consequence: "They could call or text you",
  },
  {
    id: "email",
    label: "Your email address",
    consequence: "They could email you directly",
  },
];

export function ActControl() {
  const reduce = useReducedMotion();
  // Only the required item starts shared — FR-07-04
  const [shared, setShared] = useState<string[]>(["address"]);

  const toggle = (item: Item) => {
    if (item.required) return;
    setShared((prev) =>
      prev.includes(item.id)
        ? prev.filter((i) => i !== item.id)
        : [...prev, item.id],
    );
  };

  const sharedItems = ITEMS.filter((i) => shared.includes(i.id));
  const privateItems = ITEMS.filter((i) => !shared.includes(i.id));

  const Row = ({ item, isShared }: { item: Item; isShared: boolean }) => (
    <motion.li
      layoutId={reduce ? undefined : `perm-${item.id}`}
      layout={!reduce}
      transition={{ duration: 0.42, ease: EASE_QUINT }}
    >
      <button
        type="button"
        onClick={() => toggle(item)}
        disabled={item.required}
        aria-pressed={isShared}
        className={cn(
          "group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
          isShared
            ? "border-white/15 bg-white/10"
            : "border-white/8 bg-white/4",
          item.required
            ? "cursor-default"
            : "hover:border-white/25 hover:bg-white/14",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
            isShared ? "bg-green-400 text-navy-900" : "bg-white/15 text-white/70",
          )}
        >
          {item.required ? (
            <Lock className="size-2.5" />
          ) : isShared ? (
            <Check className="size-3" />
          ) : (
            <X className="size-3" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-body-sm font-medium text-white">
              {item.label}
            </span>
            {item.required && (
              <span className="rounded-full bg-white/12 px-2 py-0.5 text-[0.6875rem] text-white/70">
                Required for this service
              </span>
            )}
          </span>
          {item.consequence && (
            <span className="mt-0.5 block text-caption text-white/55">
              {item.consequence}
            </span>
          )}
        </span>

        {!item.required && (
          <ArrowLeftRight
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-white/0 transition-colors group-hover:text-white/50"
          />
        )}
      </button>
    </motion.li>
  );

  return (
    <section
      aria-labelledby="act-control-heading"
      className="relative isolate overflow-hidden bg-navy-900"
    >
      <div aria-hidden="true" className="grain absolute inset-0" />

      <Container className="relative py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-overline uppercase text-white/55">Trust Link</p>
          <h2
            id="act-control-heading"
            className="mt-5 text-h1 text-white"
          >
            You decide exactly what they see
          </h2>
          <p className="measure mt-5 text-body-lg text-white/75">
            Everything starts private. Move an item across to share it — and move
            it back whenever you like. Try it.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* ------------------------------------------------------- SHARED */}
          <div>
            <div className="flex items-baseline justify-between border-b border-green-400/40 pb-3">
              <h3 className="text-overline uppercase text-green-400">Shared</h3>
              <span className="tabular text-caption text-white/50">
                {sharedItems.length} of {ITEMS.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {sharedItems.map((item) => (
                <Row key={item.id} item={item} isShared />
              ))}
            </ul>
          </div>

          {/* ------------------------------------------------ STAYS PRIVATE */}
          <div>
            <div className="flex items-baseline justify-between border-b border-white/20 pb-3">
              <h3 className="text-overline uppercase text-white/70">
                Stays private
              </h3>
              <span className="tabular text-caption text-white/50">
                {privateItems.length} of {ITEMS.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {privateItems.map((item) => (
                <Row key={item.id} item={item} isShared={false} />
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 flex max-w-2xl items-start gap-3 border-t border-white/12 pt-6 text-body-sm text-white/60">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            On the real screen you also choose how they may contact you and for
            how long — then you see all of it restated in plain English and
            confirm before anything is sent.
          </span>
        </p>
      </Container>
    </section>
  );
}
