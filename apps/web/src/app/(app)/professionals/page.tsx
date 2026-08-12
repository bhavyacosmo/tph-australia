"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShieldOff } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { SERVICES } from "@/lib/mock/marketplace";
import { useJourneyStore } from "@/lib/store/journey-store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ServiceKey } from "@/lib/mock/types";

/**
 * S20 — Professional directory. Reference R6.
 *
 * FR-06-10…12 — browsing is private. Reading a profile sends nothing: no
 * notification, no enquiry, no contact details. The banner says so at the top
 * of the list, which is where R6 puts it and where the question arises.
 *
 * [C-15] — no ratings, no review counts, no "top rated". The only quality
 * signal is what TPH actually checked and when (PRO-05), and professionals it
 * has NOT checked say so plainly rather than being quietly omitted or quietly
 * included — the verified/non-verified split the client introduced on the call
 * (L335).
 *
 * ⚠️ No count of professionals is stated anywhere — cohort size is open
 * ([C-01]).
 */
export default function ProfessionalsPage() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<ServiceKey | "all">("all");
  /* Store-resolved, so an admin suspending or verifying someone is reflected
     here immediately (A03/A04 → the public directory). */
  const { professionals } = useJourneyStore();

  const shown =
    filter === "all"
      ? professionals
      : professionals.filter((p) => p.serviceKey === filter);

  const verified = shown.filter((p) => p.verification);
  const unverified = shown.filter((p) => !p.verification);

  return (
    <PublicShell>
      <Container className="py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="text-overline uppercase text-fg-muted">Brisbane</p>
          <h1 className="mt-3 text-h1 text-fg-heading">Find a professional</h1>
          <p className="measure mt-4 text-body-lg text-fg-secondary">
            A small group of Brisbane professionals. Read as much as you like —
            they don&apos;t know you&apos;re here.
          </p>
        </div>

        {/* FR-06-10…12 — private browsing, stated up front */}
        <p className="mt-8 flex max-w-3xl items-start gap-3 rounded-xl bg-trustlink-wash p-4 text-body-sm text-fg-secondary">
          <ShieldOff
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-action"
          />
          <span>
            <span className="font-medium text-fg-heading">
              Reading a profile sends nothing.
            </span>{" "}
            No notification, no enquiry, no contact details — yours or theirs.
            They only hear from you when you authorise a Trust Link, and you
            choose what it contains.
          </span>
        </p>

        {/* ------------------------------------------------------- filters */}
        <div className="mt-10 flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Everyone"
            reduce={Boolean(reduce)}
          />
          {SERVICES.map((service) => (
            <FilterChip
              key={service.key}
              active={filter === service.key}
              onClick={() => setFilter(service.key)}
              label={service.label}
              reduce={Boolean(reduce)}
            />
          ))}
        </div>

        {/* --------------------------------------------------------- checked */}
        <section aria-labelledby="checked-heading" className="mt-10">
          <h2 id="checked-heading" className="text-h3 text-fg-heading">
            Checked by The Property Helpline
          </h2>
          <p className="measure mt-2 text-body-sm text-fg-muted">
            We record what we checked and the date we checked it. That is the
            whole claim — it isn&apos;t an endorsement, and it isn&apos;t a
            guarantee of the work.
          </p>

          <motion.ul
            layout={!reduce}
            className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {verified.map((professional) => (
                <motion.li
                  key={professional.id}
                  layout={!reduce}
                  initial={reduce ? undefined : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProfessionalCard
                    professional={professional}
                    href={routes.professional(professional.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </section>

        {/* ------------------------------------------------------ not checked */}
        {unverified.length > 0 && (
          <section aria-labelledby="unchecked-heading" className="mt-14">
            <h2 id="unchecked-heading" className="text-h3 text-fg-heading">
              Listed, not yet checked
            </h2>
            <p className="measure mt-2 text-body-sm text-fg-muted">
              We haven&apos;t reviewed anything for these businesses yet. You can
              still connect with them — check their credentials yourself first.
            </p>

            <motion.ul
              layout={!reduce}
              className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {unverified.map((professional) => (
                  <motion.li
                    key={professional.id}
                    layout={!reduce}
                    initial={reduce ? undefined : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProfessionalCard
                      professional={professional}
                      href={routes.professional(professional.id)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </section>
        )}

        <p className="mt-14 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
          Demonstration profiles for this prototype. Headshots are not shown
          because we don&apos;t hold photographs of these professionals yet — the
          card is built to take one.
        </p>
      </Container>
    </PublicShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  reduce,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  reduce: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex min-h-11 items-center rounded-full border px-4 text-body-sm",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
        active
          ? "border-transparent text-white"
          : "border-line-subtle text-fg-secondary hover:border-line hover:text-fg",
      )}
    >
      {active && (
        <motion.span
          layoutId={reduce ? undefined : "pro-filter"}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-10 rounded-full bg-brand"
        />
      )}
      {label}
    </button>
  );
}
