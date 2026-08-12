"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/**
 * A single word, very large, alone.
 * docs/03-experience/19-homepage-art-direction.md §4, section 2
 *
 * Purpose is rhythm, not information: a hard tonal break that gives the eye
 * somewhere to rest between two dense acts. Typography as composition.
 */
export function TypeInterstitial({
  word,
  sub,
  tone = "warm",
}: {
  word: string;
  sub?: string;
  tone?: "warm" | "light";
}) {
  const reduce = useReducedMotion();

  return (
    <section
      className={cn(
        "overflow-hidden py-24 md:py-32",
        tone === "warm" ? "bg-trustlink-wash" : "bg-surface-page",
      )}
    >
      <Container>
        <motion.p
          initial={reduce ? undefined : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(3.5rem,14vw,11rem)] font-bold leading-[0.9] tracking-[-0.045em] text-fg-heading"
        >
          {word}
        </motion.p>
        {sub && (
          <motion.p
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="measure mt-6 text-body-lg text-fg-secondary"
          >
            {sub}
          </motion.p>
        )}
      </Container>
    </section>
  );
}
