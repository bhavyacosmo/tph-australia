"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Route transition.
 *
 * Deliberately restrained: a short fade with a 4px rise. Anything more
 * theatrical delays the content the user asked for, and this product's
 * design principle is "calm" (docs/03-experience/06-design-principles.md §10).
 *
 * No exit animation — waiting for content to leave before new content arrives
 * makes navigation feel slower than it is.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
