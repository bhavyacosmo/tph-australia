"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Info,
  Link2,
  ShieldHalf,
  Users,
  XCircle,
} from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { SessionMenu } from "@/components/shells/session-menu";
import { PageShell } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { ApplicationReview } from "@/components/admin/application-review";
import { ProfessionalAvatar } from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { PROFESSIONALS, serviceFor } from "@/lib/mock/marketplace";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Basic V1 admin — PM wireframe §10.
 *
 * ⚠️ Two things to flag rather than bury:
 *
 *  1. On the call the client walked this surface and then said *"I think this is
 *     not needed"* (transcript L547) — the referent is ambiguous, and it sits
 *     directly after the PM described admin intervening in requests. So this is
 *     built minimally and the question is on the list for confirmation.
 *
 *  2. `ADM-08` — admin must have **no access to a consumer's documents or
 *     outputs**, and every consumer lookup is logged. So this screen shows
 *     professionals and Trust Link STATE only. There is no way to read a buyer's
 *     notes, readiness answers or a returned report from here, deliberately.
 *
 * Distinct darker chrome (nav §8) so it can never be mistaken for the consumer
 * product.
 */
export default function AdminPage() {
  const reduce = useReducedMotion();
  const {
    trustLinks,
    getProperty,
    professionalOverrides,
    setProfessionalSuspended,
    recordProfessionalVerification,
  } = useJourneyStore();

  /* Which professional's verification form is open */
  const [recording, setRecording] = useState<string | null>(null);
  const [evidence, setEvidence] = useState("QBCC licence");

  /** Seeded professional plus any admin-applied state. */
  const resolve = (p: (typeof PROFESSIONALS)[number]) => {
    const override = professionalOverrides[p.id];
    return {
      ...p,
      verification:
        override?.verification !== undefined
          ? override.verification
          : p.verification,
      suspended: Boolean(override?.suspended),
    };
  };

  const cohort = PROFESSIONALS.map(resolve);
  const verified = cohort.filter((p) => p.verification);
  const unverified = cohort.filter((p) => !p.verification);

  return (
    <div className="flex min-h-full flex-col bg-surface-page">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex w-full max-w-(--container-content) items-center gap-4 px-5 md:px-8">
          <div className="flex h-[var(--header-h)] items-center gap-3">
            <TphLogo variant="mark" inverse />
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/60">
              Admin
            </span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-amber-300">
              Prototype
            </span>
          </div>
          <div className="ml-auto">
            <SessionMenu tone="dark" />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <PageShell>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-overline uppercase text-fg-muted">
                Pilot operations
              </p>
              <h1 className="mt-3 text-h1 text-fg-heading">Admin</h1>
              <p className="measure mt-3 text-body-lg text-fg-secondary">
                Manage the professional cohort and see the state of every Trust
                Link. Nothing here exposes a buyer&apos;s information.
              </p>
            </div>
          </div>

          {/* ADM-08 — stated where an admin would otherwise go looking */}
          <p className="mt-8 flex items-start gap-3 rounded-xl border border-line-subtle bg-surface-sunken px-4 py-3 text-body-sm text-fg-secondary">
            <ShieldHalf
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-fg-muted"
            />
            <span>
              Admin sees Trust Link <em>state</em> only — never a buyer&apos;s
              notes, readiness answers, or a returned report. Consumer lookups are
              logged. That boundary is a requirement, not a prototype shortcut.
            </span>
          </p>

          {/* ------------------------------------------------- professionals */}
          <section aria-labelledby="pros-heading" className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="pros-heading" className="text-h2 text-fg-heading">
                Professionals
              </h2>
              <p className="text-body-sm text-fg-muted">
                {verified.length} checked · {unverified.length} awaiting review
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {cohort.map((professional) => {
                const isSuspended = professional.suspended;
                return (
                  <motion.li
                    key={professional.id}
                    layout={!reduce}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "flex flex-wrap items-center gap-4 rounded-2xl border p-5",
                      isSuspended
                        ? "border-line-subtle bg-surface-sunken opacity-60"
                        : "border-line-subtle bg-surface-card",
                    )}
                  >
                    <ProfessionalAvatar
                      professional={professional}
                      className="size-11"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-semibold text-fg-heading">
                        {professional.name}
                      </p>
                      <p className="text-body-sm text-fg-muted">
                        {professional.category} · {professional.area}
                      </p>
                    </div>

                    <div className="min-w-0">
                      {professional.verification ? (
                        <p className="text-body-sm text-fg-secondary">
                          <BadgeCheck
                            aria-hidden="true"
                            className="mr-1.5 inline size-4 align-text-bottom text-success-fg"
                          />
                          {professional.verification.what} ·{" "}
                          {formatDate(professional.verification.checkedOn)}
                        </p>
                      ) : (
                        <p className="text-body-sm text-fg-muted">
                          Nothing recorded yet
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isSuspended ? (
                        <>
                          <StatusChip tone="neutral">Suspended</StatusChip>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setProfessionalSuspended(professional.id, false)
                            }
                          >
                            Reinstate
                          </Button>
                        </>
                      ) : (
                        <>
                          <StatusChip
                            tone={professional.verification ? "success" : "attention"}
                          >
                            {professional.verification ? "Live" : "Unverified"}
                          </StatusChip>
                          {!professional.verification && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                setRecording(
                                  recording === professional.id
                                    ? null
                                    : professional.id,
                                )
                              }
                            >
                              <BadgeCheck aria-hidden="true" className="size-3.5" />
                              Record a check
                            </Button>
                          )}
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() =>
                              setProfessionalSuspended(professional.id, true)
                            }
                          >
                            <XCircle aria-hidden="true" className="size-3.5" />
                            Suspend
                          </Button>
                        </>
                      )}
                    </div>

                    {/* PRO-05 — the admin records WHAT was checked, and the
                        published wording is derived from that, not from a badge */}
                    {recording === professional.id && (
                      <motion.div
                        initial={reduce ? undefined : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full border-t border-line-subtle pt-4"
                      >
                        <p className="text-body-sm font-medium text-fg-heading">
                          What did you check?
                        </p>
                        <p className="mt-1 text-body-sm text-fg-muted">
                          This wording and today&apos;s date are published on their
                          profile. Never a bare &ldquo;verified&rdquo;.
                        </p>
                        <div className="mt-3 flex flex-wrap items-end gap-3">
                          <label className="min-w-56 flex-1">
                            <span className="sr-only">Evidence type</span>
                            <Select
                              value={evidence}
                              onChange={(e) => setEvidence(e.target.value)}
                            >
                              {[
                                "QBCC licence",
                                "Practising certificate",
                                "Agent licence",
                                "Pest management technician licence",
                                "Professional indemnity insurance",
                              ].map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </Select>
                          </label>
                          <Button
                            variant="primary"
                            onClick={() => {
                              recordProfessionalVerification(
                                professional.id,
                                evidence,
                              );
                              setRecording(null);
                            }}
                          >
                            Record and publish
                          </Button>
                          <Button
                            variant="tertiary"
                            onClick={() => setRecording(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.li>
                );
              })}
            </ul>

            <p className="mt-5 flex items-start gap-2.5 text-body-sm text-fg-muted">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Verification and suspension persist with the demo data, so a change
              here shows up in the public directory. Recording a check publishes
              the wording — what was checked, and when — never a bare badge.
            </p>
          </section>

          {/* ------------------------------------------------- applications */}
          <div className="mt-16">
            <ApplicationReview />
          </div>

          {/* --------------------------------------------------- trust links */}
          <section aria-labelledby="links-heading" className="mt-16">
            <h2 id="links-heading" className="text-h2 text-fg-heading">
              Trust Links
            </h2>
            <p className="measure mt-3 text-body text-fg-secondary">
              State and consent metadata. Admin cannot widen a consent, only see
              that it exists (FR-07-20).
            </p>

            {trustLinks.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-10 text-center text-body-sm text-fg-muted">
                No Trust Links yet. Send one as the buyer and it appears here.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-line-subtle border-y border-line-subtle">
                {trustLinks.map((link) => {
                  const property = getProperty(link.propertyId);
                  return (
                    <li
                      key={link.id}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-body font-medium text-fg-heading">
                          <Link2
                            aria-hidden="true"
                            className="size-3.5 text-fg-muted"
                          />
                          {serviceFor(link.serviceKey).label}
                        </span>
                        <span className="mt-0.5 block text-body-sm text-fg-muted">
                          {/* Suburb only — no street address for admin */}
                          {property?.suburb ?? "Brisbane"} ·{" "}
                          {link.sharedItems.length} items shared ·{" "}
                          {link.expiryDays}-day period ·{" "}
                          {formatRelative(link.createdAt)}
                        </span>
                      </span>
                      <StatusChip
                        tone={
                          link.status === "active" || link.status === "completed"
                            ? "success"
                            : link.status === "pending"
                              ? "attention"
                              : "neutral"
                        }
                      >
                        {link.status}
                      </StatusChip>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ------------------------------------------------------ consumers */}
          <section aria-labelledby="consumers-heading" className="mt-16">
            <h2 id="consumers-heading" className="text-h3 text-fg-heading">
              Consumers
            </h2>
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface-card p-6">
              <p className="flex items-start gap-3 text-body-sm text-fg-muted">
                <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>
                  Support lookup is not built in this prototype. When it is, it
                  shows account status only — no documents, no outputs, no notes
                  (`ADM-08`) — and every lookup is written to the audit log.
                </span>
              </p>
            </div>
          </section>
        </PageShell>
      </main>
    </div>
  );
}
