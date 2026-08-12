"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { Container } from "@/components/ui/section";
import { MiniPropIdRecord, MiniReport } from "./product-ui";

/**
 * Act IV — "Returned".
 * docs/03-experience/19-homepage-art-direction.md §4, section 5
 *
 * Makes [SG] p.6's continuity claim literal — "the platform owns the
 * continuity, not only the introduction". A path draws from the professional
 * to the record, the report travels it, and the record's counter increments.
 *
 * This is the hardest part of the product to explain in prose and the easiest
 * to show, which is why it gets a composition of its own rather than a card.
 */
export function ActReturn() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    if (reduce) {
      setDelivered(true);
      return;
    }
    if (!inView) return;
    const t = setTimeout(() => setDelivered(true), 1250);
    return () => clearTimeout(t);
  }, [inView, reduce]);

  return (
    <section
      aria-labelledby="act-return-heading"
      className="overflow-hidden bg-surface-card"
    >
      <Container className="py-20 md:py-28 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="text-overline uppercase text-fg-muted">
              Returned work
            </p>
            <h2 id="act-return-heading" className="mt-5 text-h1 text-fg-heading">
              What you paid for comes back to you
            </h2>
            <p className="measure mt-5 text-body text-fg-secondary">
              The report lands against the property it&apos;s about — inside your
              own record. Not buried in your inbox among forty other emails.
            </p>
          </div>

          {/* Deliberately off-balance: sender low-left, record high-right, with
              generous emptiness between them for the path to cross. */}
          <div ref={ref} className="relative lg:col-span-7 lg:col-start-6">
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-6">
              {/* Sender */}
              <div className="sm:mt-24">
                <div className="rounded-2xl border border-line-subtle bg-surface-sunken p-5">
                  <p className="text-overline uppercase text-fg-muted">
                    BuildCheck
                  </p>
                  <p className="mt-2 text-body-sm text-fg-secondary">
                    Submitted a building inspection report
                  </p>

                  {/* The travelling report */}
                  <motion.div
                    initial={reduce ? undefined : { opacity: 0, y: 8 }}
                    animate={
                      reduce
                        ? undefined
                        : inView
                          ? delivered
                            ? { opacity: 0, y: -18, scale: 0.94 }
                            : { opacity: 1, y: 0, scale: 1 }
                          : undefined
                    }
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4"
                  >
                    <MiniReport />
                  </motion.div>
                </div>
              </div>

              {/* Record */}
              <div>
                <MiniPropIdRecord reportCount={delivered ? 1 : 0} />
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  animate={
                    delivered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                  }
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3"
                >
                  <MiniReport />
                </motion.div>
              </div>
            </div>

            {/* Connector. Drawn with stroke-dashoffset — cheap to animate and
                it reads as a route rather than a decoration. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 400 220"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full sm:block"
            >
              <motion.path
                d="M96 168 C 190 168, 210 60, 300 60"
                fill="none"
                stroke="var(--color-action)"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                strokeLinecap="round"
                initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
                animate={
                  reduce
                    ? undefined
                    : inView
                      ? { pathLength: 1, opacity: 0.5 }
                      : undefined
                }
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </svg>
          </div>
        </div>
      </Container>
    </section>
  );
}
