"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldOff } from "lucide-react";

import { Container } from "@/components/ui/section";
import { MiniProfessionalCard } from "./product-ui";
import { PROFESSIONALS } from "./story-data";
import { cn } from "@/lib/utils";

/**
 * Act II — "The right help".
 * docs/03-experience/19-homepage-art-direction.md §4 (revised — see §12)
 *
 * The original version put a single tall photograph alone in the left half,
 * revealed by an animated `clip-path`. Two failures: the composition gave half
 * the page to an image carrying no product meaning, and because the reveal
 * started at `inset(100% 0 0 0)` the entire left half rendered EMPTY whenever
 * that animation did not run — which is what it was doing in review.
 *
 * Rule taken from that: on this page, no photograph and no card may depend on
 * JavaScript to become visible. The image below has no entrance animation at
 * all. Motion is reserved for the card layered over it, which is additive — if
 * it never runs, the composition is still complete.
 *
 * The left half now reads as the directory itself: the home, with a
 * professional's profile card raised over its lower edge. The right half is the
 * index of the three Stage 1 categories, and selecting one changes the card —
 * which is the actual product point. Browsing sends nothing.
 *
 * Scope discipline: no rating, no review count, no photograph of a person, no
 * phone number, and no count of professionals — all of which appear in the
 * reference material and all of which are excluded ([C-01], [C-D], [C-E],
 * [C-F], PRO-05).
 */

const EASE_QUINT = [0.22, 1, 0.36, 1] as const;

export function ActHelp() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const professional = PROFESSIONALS[active];

  return (
    <section
      aria-labelledby="act-help-heading"
      className="relative overflow-hidden bg-trustlink-wash"
    >
      <Container>
        <div className="grid items-center gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-16 lg:py-32">
          {/*
            Copy comes FIRST in the DOM so the reading order on a phone is
            heading → index → card. On desktop it is placed into the right-hand
            columns of the same grid row, mirroring Act I's arrangement.
          */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 18 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE_QUINT }}
            >
              <p className="text-overline uppercase text-fg-muted">Step two</p>
              <h2 id="act-help-heading" className="mt-5 text-h1 text-fg-heading">
                Get the right help, privately
              </h2>
              <p className="measure mt-5 text-body text-fg-secondary">
                A small group of checked Brisbane professionals. Reading a
                profile sends nothing — no notification, no enquiry, no contact
                details.
              </p>
            </motion.div>

            {/* ------------------------------------------------------- index */}
            <ul className="mt-10">
              {PROFESSIONALS.map((p, i) => {
                const isActive = i === active;
                return (
                  <li key={p.id} className="border-t border-line-subtle">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className="group flex w-full items-baseline gap-4 py-4 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "tabular w-6 shrink-0 text-caption transition-colors duration-[var(--duration-fast)]",
                          isActive ? "text-action" : "text-fg-muted",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-h4 transition-colors duration-[var(--duration-fast)]",
                            isActive
                              ? "text-fg-heading"
                              : "text-fg-secondary group-hover:text-fg-heading",
                          )}
                        >
                          {p.category}
                        </span>
                        <span className="mt-0.5 block text-body-sm text-fg-muted">
                          {p.name}
                        </span>
                      </span>
                      {/*
                        The marker travels between rows rather than fading in
                        and out, so the selection reads as one object moving.
                      */}
                      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                        {isActive && (
                          <motion.span
                            layoutId={reduce ? undefined : "help-marker"}
                            transition={{ duration: 0.32, ease: EASE_QUINT }}
                            className="size-2.5 rounded-full bg-action"
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-secondary">
              <ShieldOff aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                No contact details are shared until you authorise a Trust Link.
              </span>
            </p>
          </div>

          {/* ------------------------------------------------------- imagery */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:-ml-16">
            {/*
              Deliberately NOT animated. See the note at the top of this file.
            */}
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-elev-2">
              <Image
                src="/img/home-interior.jpg"
                alt="The living area of a contemporary Australian home"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Anchors the card's edge against a busy photograph */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-900/45 to-transparent"
              />
            </div>

            {/*
              The card sits over the photograph's lower edge, in normal flow —
              a negative margin, not absolute positioning, so it can never
              collide with the section below at any width.
            */}
            <motion.div
              layout={!reduce}
              transition={{ duration: 0.34, ease: EASE_QUINT }}
              /*
                Weighted to the right so the photograph stays open on the left
                where it bleeds past the container edge, and the card overhangs
                the photograph's lower edge by about 96px — the layering is what
                gives the section depth without a drop-shadowed rectangle
                sitting politely inside a column.
              */
              className="relative z-10 -mt-10 ml-4 mr-4 max-w-md sm:ml-10 lg:-mt-24 lg:ml-auto lg:mr-8"
            >
              <motion.div
                /* Keyed on the selection: the card is replaced, not mutated. */
                key={professional.id}
                initial={reduce ? undefined : { opacity: 0, y: 14 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.34, ease: EASE_QUINT }}
              >
                <MiniProfessionalCard
                  professional={professional}
                  className="shadow-elev-3"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
