"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { useChoreography } from "./use-choreography";
import {
  MiniAddressChip,
  MiniNote,
  MiniPropertyCard,
  MiniReport,
} from "./product-ui";
import { STORY_PROPERTIES } from "./story-data";

/**
 * Section 0 — Hero: "Scattered".
 * docs/03-experience/19-homepage-art-direction.md §4
 *
 * States the PROBLEM before the product: this is what a property search
 * actually looks like. Real product fragments sit strewn at three z-depths,
 * rotated, two of them cropped by the frame so it reads as a window onto
 * something larger.
 *
 * Taken from [VL] — the client's own founding metaphor: property activity is
 * fragmented, and TPH gathers it. As the reader scrolls, the fragments begin
 * converging, handing over to Act I where they resolve into a shortlist.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const copyGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const copyItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
};

/**
 * Fragment placement. `depth` drives entrance scale and blur so pieces arrive
 * from different distances rather than all fading in together.
 * Positions are percentages of the scene box.
 */
const FRAGMENTS = [
  { id: "card-1", depth: 0, x: "6%", y: "4%", rot: -5, w: "58%", z: 30 },
  { id: "chip", depth: 1, x: "44%", y: "0%", rot: 3, w: "auto", z: 20 },
  { id: "note", depth: 2, x: "30%", y: "27%", rot: 2, w: "62%", z: 40 },
  { id: "card-2", depth: 1, x: "0%", y: "46%", rot: 4, w: "54%", z: 25 },
  { id: "report", depth: 2, x: "42%", y: "66%", rot: -3, w: "60%", z: 35 },
  { id: "card-3", depth: 0, x: "56%", y: "40%", rot: -6, w: "52%", z: 15 },
] as const;

const DEPTH_IN = [
  { scale: 0.86, blur: 8 },
  { scale: 0.92, blur: 5 },
  { scale: 0.97, blur: 2 },
];

export function HeroScene() {
  const choreo = useChoreography();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Photograph drifts slower than the page.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  // Fragments converge toward the centre and lift away as the hero exits —
  // the visual handover into Act I.
  const gatherX = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const gatherScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const gatherOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-navy-900"
      aria-labelledby="hero-heading"
    >
      {/* ------------------------------------------------------------ imagery */}
      <motion.div
        aria-hidden="true"
        style={choreo ? { y: imageY } : undefined}
        className="absolute inset-0 -z-20 scale-110"
      >
        {/* LCP element. `priority` is deprecated in Next 16 and silently does
            nothing; `preload` + eager is its replacement. */}
        <Image
          src="/img/home-exterior.jpg"
          alt=""
          fill
          preload
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          quality={72}
          className="object-cover object-[68%_center]"
        />
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[image:var(--hero-scrim-v)] lg:bg-[image:var(--hero-scrim)]"
      />
      <div aria-hidden="true" className="grain absolute inset-0 -z-10" />

      <Container className="relative">
        <div className="grid items-center gap-16 py-20 md:py-28 lg:grid-cols-12 lg:gap-8 lg:py-32">
          {/* --------------------------------------------------------- copy */}
          <motion.div
            className="lg:col-span-5"
            variants={copyGroup}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={copyItem}
              className="text-overline uppercase text-white/55"
            >
              For Brisbane buyers
            </motion.p>

            <motion.h1
              id="hero-heading"
              variants={copyItem}
              className="mt-5 text-display text-white"
            >
              Your property journey, in one place you control
            </motion.h1>

            <motion.p
              variants={copyItem}
              className="measure mt-6 text-body-lg text-white/75"
            >
              Right now it&apos;s spread across portals, screenshots and your
              inbox. Here, it&apos;s one record — and you decide who ever sees
              any of it.
            </motion.p>

            <motion.div
              variants={copyItem}
              className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6"
            >
              {/* The single filled primary on the page — [VB] p.16 principle 2 */}
              <ButtonLink
                href="/journey/start"
                variant="primary"
                size="lg"
                className="group"
              >
                Start buyer journey
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                />
              </ButtonLink>
              <p className="text-body-sm text-white/70">
                Already started?{" "}
                <Link
                  href="/sign-in"
                  className="link-underline font-medium text-white"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>

            <motion.p
              variants={copyItem}
              className="mt-8 text-caption text-white/55"
            >
              Free to start. No professional sees anything until you choose to
              share it.
            </motion.p>
          </motion.div>

          {/* ---------------------------------------------------- fragments */}
          <motion.div
            aria-hidden="true"
            style={
              choreo
                ? { x: gatherX, scale: gatherScale, opacity: gatherOpacity }
                : undefined
            }
            className="relative hidden h-[30rem] lg:col-span-6 lg:col-start-7 lg:block xl:h-[34rem]"
          >
            {FRAGMENTS.map((f, i) => {
              const d = DEPTH_IN[f.depth];
              return (
                <motion.div
                  key={f.id}
                  initial={{
                    opacity: 0,
                    scale: d.scale,
                    filter: `blur(${d.blur}px)`,
                    y: 24,
                  }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.36 + i * 0.09,
                    ease: EASE,
                  }}
                  style={{
                    position: "absolute",
                    left: f.x,
                    top: f.y,
                    width: f.w === "auto" ? undefined : f.w,
                    rotate: `${f.rot}deg`,
                    zIndex: f.z,
                  }}
                >
                  {f.id === "chip" && <MiniAddressChip />}
                  {f.id === "note" && <MiniNote />}
                  {f.id === "report" && <MiniReport />}
                  {f.id === "card-1" && (
                    <MiniPropertyCard property={STORY_PROPERTIES[0]} />
                  )}
                  {f.id === "card-2" && (
                    <MiniPropertyCard property={STORY_PROPERTIES[1]} />
                  )}
                  {f.id === "card-3" && (
                    <MiniPropertyCard property={STORY_PROPERTIES[2]} />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
