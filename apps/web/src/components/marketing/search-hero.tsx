"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

import { Container } from "@/components/ui/section";
import { PropertySearchBar } from "@/components/search/property-search-bar";
import { cn } from "@/lib/utils";

/**
 * The homepage hero, rebuilt around search.
 *
 * The client was explicit: the search bar has to be on the first screen, in the
 * way domain.com.au does it (transcript L15-27). Equally explicit was the
 * warning not to cram the whole ecosystem into the hero (L63-67).
 *
 * REVISION — client review, 14 August 2026.
 * The client returned with domain.com.au open and asked for its *composition*:
 * a short photographic band, a raised white search card straddling its bottom
 * edge, and the first row of real content already breaking the fold. The point
 * is that the first screen has to prove there is a marketplace here, not just
 * promise one.
 *
 * So the hero gives away vertical space to earn it back below:
 *
 *   · the headline drops from `text-display` to `text-h1`, which lets it set on
 *     one line at desktop widths instead of two — worth ~60px on its own;
 *   · search, suburb shortcuts and the two trust lines are consolidated into a
 *     single raised card;
 *   · the card is pulled up over the photograph's bottom edge, so the space it
 *     occupies is counted once, not twice.
 *
 * The overlap is done with a fixed negative margin on a sibling wrapper rather
 * than a fixed photo height. That matters: the photograph is sized by the text
 * it sits behind, so no combination of viewport width, font fallback or
 * translated copy can ever push white type off the scrim onto the page
 * background. The overlap distance is constant; the band above it is fluid.
 *
 * `story/hero-scene.tsx` (the earlier scroll-choreographed hero) is unchanged
 * and still in the codebase; swapping back is a one-line change in page.tsx.
 */

const SUGGESTED = ["Carindale", "Camp Hill", "Coorparoo", "Clayfield"];

/** Overlap of the search card into the section below. Keep in step with the
 *  hero's bottom padding — the difference between the two is the visible gap
 *  between the sub-headline and the card. */
const OVERLAP = "-mt-20 md:-mt-32";

export function SearchHero() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* ==================================================== photographic band */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        {/* Photography, present immediately — never revealed by script */}
        <Image
          src="/img/home-exterior.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority={false}
          preload
          loading="eager"
          fetchPriority="high"
          quality={72}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "var(--hero-scrim-v)" }}
        />
        <div aria-hidden="true" className="grain absolute inset-0" />

        {/* The bottom padding is the card's landing strip. `OVERLAP` takes most
            of it back, and what remains is the visible gap between the
            sub-headline and the card — 32px on mobile, 16px from `md` up, where
            the card is wide enough to read as a separate plane without much
            help. The net cost of the card to the fold is pb − overlap. */}
        <Container className="relative pb-28 pt-8 md:pb-36">
          <div className="mx-auto max-w-5xl text-center">
            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-overline uppercase text-white/55"
            >
              Brisbane · buying
            </motion.p>

            {/* `text-h1`, not `text-display`. At 48px this sets on one line from
                about 1100px up, which is the whole reason the marketplace can
                reach the fold. */}
            <motion.h1
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 text-balance text-h1 text-white"
            >
              Buying a home, finally organised
            </motion.h1>

            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-3 max-w-2xl text-body-lg text-white/75"
            >
              Search properties, keep every note and decision in one place, and
              bring in a checked professional only when you say so.
            </motion.p>
          </div>
        </Container>
      </section>

      {/* ========================================================= search card */}
      {/* Sits above the band and below it at the same time. `z-10` puts it over
          the photograph; the transparent gutters either side let the photograph
          show through above the seam and the page surface below it. */}
      <div className={cn("relative z-10", OVERLAP)}>
        <Container>
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-surface-card p-4 shadow-elev-3 md:p-5"
          >
            {/* Left-aligned inside the card, unlike the centred headline above
                it. A search control is a form, and forms read from the left
                edge; centring the tabs over a 1200px card leaves the eye with
                nowhere to start. */}
            <PropertySearchBar tone="page" align="left" />

            {/* Suburb shortcuts and the privacy assurance share one row. Two
                stacked rows cost ~100px, which is precisely the budget the
                marketplace needs to break the fold. */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line-subtle pt-4">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <span className="text-body-sm text-fg-muted">
                  Popular right now
                </span>
                {SUGGESTED.map((suburb, i) => (
                  <motion.span
                    key={suburb}
                    initial={reduce ? undefined : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={`/search?where=${encodeURIComponent(suburb)}`}
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-full border border-line px-3.5 text-body-sm text-fg-secondary",
                        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                        "hover:border-line-strong hover:bg-surface-sunken hover:text-fg",
                      )}
                    >
                      {suburb}
                    </Link>
                  </motion.span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="flex items-center gap-2 text-body-sm text-fg-muted">
                  <ShieldCheck
                    aria-hidden="true"
                    className="size-4 shrink-0 text-action"
                  />
                  Browsing sends nothing to anyone
                </p>
                <p className="flex items-center gap-2 text-body-sm text-fg-muted">
                  <Lock
                    aria-hidden="true"
                    className="size-4 shrink-0 text-action"
                  />
                  You choose what a professional sees
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    </>
  );
}
