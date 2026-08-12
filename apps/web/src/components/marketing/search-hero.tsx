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
 * warning not to cram the whole ecosystem into the hero (L63-67): *"it's got
 * large features, and एक hero page के लिए वो सब adjust करना is a big thing."*
 *
 * So this hero does two things only — say what the place is, and let you search
 * — and hands everything else to the sections below.
 *
 * It keeps the approved art direction rather than adopting a portal's: the
 * full-bleed dusk photograph, the navy scrim weighted left, film grain, and the
 * same type scale. What changed is the hierarchy — the search control is now the
 * loudest element on the page, where the headline used to be.
 *
 * The previous scroll-choreographed hero (`story/hero-scene.tsx`) is unchanged
 * and still in the codebase; swapping back is a one-line change in page.tsx.
 */

const SUGGESTED = ["Carindale", "Camp Hill", "Coorparoo", "Clayfield"];

export function SearchHero() {
  const reduce = useReducedMotion();

  return (
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

      {/* Top padding is deliberately much smaller than the bottom: the sticky
          header already supplies breathing room above the eyebrow, and the extra
          space was pushing the search control and the trust lines below the
          fold. The hero now resolves on one screen. */}
      <Container className="relative pb-14 pt-8 md:pb-16 md:pt-10 lg:pb-20 lg:pt-12">
        {/* Centred composition. The photograph is a wide, symmetrical scene, so
            a centred column sits on it better than a left-weighted one — and it
            puts the search control on the page's optical centre line. */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-overline uppercase text-white/55"
          >
            Brisbane · buying
          </motion.p>

          <motion.h1
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-display text-white"
          >
            Buying a home, finally organised
          </motion.h1>

          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="measure mx-auto mt-5 text-body-lg text-white/75"
          >
            Search properties, keep every note and decision in one place, and
            bring in a checked professional only when you say so.
          </motion.p>
        </div>

        {/* ------------------------------------------------------ the search */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-4xl"
        >
          <PropertySearchBar tone="hero" align="center" />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="text-body-sm text-white/55">Popular right now</span>
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
                    "inline-flex min-h-9 items-center rounded-full border border-white/20 px-3.5 text-body-sm text-white/80",
                    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                    "hover:border-white/40 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {suburb}
                </Link>
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ------------------------------------------------- quiet reassurance */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/12 pt-6"
        >
          <p className="flex items-center gap-2.5 text-body-sm text-white/65">
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-green-400" />
            Browsing sends nothing to anyone
          </p>
          <p className="flex items-center gap-2.5 text-body-sm text-white/65">
            <Lock aria-hidden="true" className="size-4 shrink-0 text-green-400" />
            You choose what a professional sees, and for how long
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
