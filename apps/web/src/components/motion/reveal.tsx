"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

/**
 * Scroll-reveal primitives.
 *
 * Motion budget — docs/03-experience/07-design-system.md §7:
 *   in-flow interactions stay under 300ms; entrance reveals may run longer
 *   because they are not blocking an action. `prefers-reduced-motion` is
 *   honoured by rendering the content statically, not by shortening it.
 *
 * Prohibited: parallax, auto-playing carousels, scroll-jacking, and any
 * motion that misrepresents actual state.
 *
 * The easing below is an expressive ease-out — fast departure, long settle.
 * It is the single biggest reason motion reads as "designed" rather than
 * "animated".
 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: EASE_OUT_EXPO },
  },
};

/** A single element rising into place. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-72px" }}
      variants={revealVariants}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/**
 * Staggers its direct `RevealItem` children.
 *
 * Stagger is what separates a considered sequence from everything appearing
 * at once. Kept short (60ms) so a list of six still resolves in well under a
 * second — a long cascade reads as slow, not elegant.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  const Static = as;

  if (reduce) return <Static className={className}>{children}</Static>;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-72px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </Component>
  );
}

/** A child of `RevealGroup`. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Component className={className} variants={revealVariants}>
      {children}
    </Component>
  );
}
