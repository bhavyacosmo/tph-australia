"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, BadgeCheck, Check, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { monogram } from "@/lib/mock/media";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Admin review of professional applications — A03a/A04.
 *
 * **PRO-05 is the whole point of this component.** An admin does not click
 * "verify"; they record WHAT they checked. The published wording on the
 * professional's profile is generated from that record, with the date — never
 * from the applicant's own claim, and never as a bare "Verified".
 *
 * The credential the applicant supplied is shown as a claim, visually separated,
 * so an admin cannot mistake it for something TPH has confirmed.
 */

/** What an admin can record having checked. Extend as the real process settles. */
const EVIDENCE_TYPES = [
  "QBCC licence",
  "Practising certificate",
  "Agent licence",
  "Pest management technician licence",
  "Professional indemnity insurance",
  "Business registration",
];

export function ApplicationReview() {
  const reduce = useReducedMotion();
  const { applications, verifyApplication, declineApplication } =
    useJourneyStore();

  const [openId, setOpenId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState(EVIDENCE_TYPES[0]);
  const [reference, setReference] = useState("");
  const [declining, setDeclining] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  return (
    <section aria-labelledby="apps-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="apps-heading" className="text-h2 text-fg-heading">
          Applications
        </h2>
        {pending.length > 0 && (
          <StatusChip tone="attention">{pending.length} awaiting review</StatusChip>
        )}
      </div>
      <p className="measure mt-3 text-body text-fg-secondary">
        Professionals who applied through the website. An application is not a
        listing — nothing is published until someone records what was checked.
      </p>

      {applications.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-10 text-center text-body-sm text-fg-muted">
          No applications. When a professional applies, they appear here.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {[...pending, ...decided].map((application) => {
            const service = serviceFor(application.serviceKey);
            const isOpen = openId === application.id;
            const isDeclining = declining === application.id;

            return (
              <li key={application.id}>
                <article
                  className={cn(
                    "rounded-2xl border p-6",
                    application.status === "pending"
                      ? "border-attention-line bg-attention-bg"
                      : "border-line-subtle bg-surface-card",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      {/* The photograph they submitted, if any. A plain <img>:
                          it is a data URL from their own device, which the
                          image optimiser cannot process. */}
                      {application.photoUrl ? (
                        <span className="size-14 shrink-0 overflow-hidden rounded-full bg-surface-sunken">
                          {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                          <img
                            src={application.photoUrl}
                            alt=""
                            aria-hidden="true"
                            className="size-full object-cover"
                          />
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-body font-semibold text-brand-fg"
                        >
                          {monogram(application.contactName)}
                        </span>
                      )}

                      <div className="min-w-0">
                        <p className="text-overline uppercase text-fg-muted">
                          {service.label}
                        </p>
                        <h3 className="mt-1.5 text-h4 text-fg-heading">
                          {application.businessName}
                        </h3>
                        <p className="text-body-sm text-fg-secondary">
                          {application.contactName}
                          {application.age && `, ${application.age}`}
                          {application.area && ` · ${application.area}`}
                        </p>
                        <p className="mt-1 text-caption text-fg-muted">
                          Applied {formatRelative(application.submittedAt)} ·{" "}
                          {application.email}
                          {application.phone && ` · ${application.phone}`}
                        </p>
                      </div>
                    </div>

                    <StatusChip
                      tone={
                        application.status === "verified"
                          ? "success"
                          : application.status === "declined"
                            ? "neutral"
                            : "attention"
                      }
                    >
                      {application.status === "verified"
                        ? "Verified"
                        : application.status === "declined"
                          ? "Declined"
                          : "Pending"}
                    </StatusChip>
                  </div>

                  {application.approach && (
                    <p className="measure mt-4 border-t border-line-subtle pt-4 text-body-sm text-fg-secondary">
                      {application.approach}
                    </p>
                  )}

                  {/* Everything else they submitted, so a decision can be made
                      from this card without opening anything. All of it is
                      their own account of themselves. */}
                  {(application.experience ||
                    application.feeNote ||
                    (application.services?.length ?? 0) > 0 ||
                    (application.serviceAreas?.length ?? 0) > 0) && (
                    <dl className="mt-4 grid gap-4 border-t border-line-subtle pt-4 sm:grid-cols-2">
                      {application.experience && (
                        <div>
                          <dt className="text-caption uppercase tracking-wider text-fg-muted">
                            Experience
                          </dt>
                          <dd className="mt-1 text-body-sm text-fg-secondary">
                            {application.experience}
                          </dd>
                        </div>
                      )}
                      {application.feeNote && (
                        <div>
                          <dt className="text-caption uppercase tracking-wider text-fg-muted">
                            Indicative fee
                          </dt>
                          <dd className="mt-1 text-body-sm text-fg-secondary">
                            {application.feeNote}
                          </dd>
                        </div>
                      )}
                      {(application.services?.length ?? 0) > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-caption uppercase tracking-wider text-fg-muted">
                            Jobs they take on
                          </dt>
                          <dd className="mt-2 flex flex-wrap gap-1.5">
                            {application.services?.map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-surface-sunken px-2.5 py-1 text-caption text-fg-secondary"
                              >
                                {s}
                              </span>
                            ))}
                          </dd>
                        </div>
                      )}
                      {(application.serviceAreas?.length ?? 0) > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-caption uppercase tracking-wider text-fg-muted">
                            Suburbs covered
                          </dt>
                          <dd className="mt-1 text-body-sm text-fg-secondary">
                            {application.serviceAreas?.join(" · ")}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {/* The claim, clearly labelled as a claim */}
                  <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-surface-card/70 px-4 py-3 text-body-sm text-fg-secondary">
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-attention-fg"
                    />
                    <span>
                      <span className="block font-medium text-fg-heading">
                        Applicant&apos;s claim — not checked
                      </span>
                      {application.claimedCredential}
                    </span>
                  </p>

                  {/* Recorded verification, if any */}
                  {application.verification && (
                    <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-success-bg px-4 py-3 text-body-sm text-success-fg">
                      <BadgeCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                      <span>
                        <span className="block font-medium">
                          {application.verification.what} checked{" "}
                          {formatDate(application.verification.checkedOn)}
                        </span>
                        Recorded by {application.verification.by}. This is the
                        wording published on their profile.
                      </span>
                    </p>
                  )}

                  {application.declineReason && (
                    <p className="mt-4 text-body-sm text-fg-muted">
                      Declined — {application.declineReason}
                    </p>
                  )}

                  {/* ------------------------------------------- actions */}
                  {application.status === "pending" && (
                    <div className="mt-5 border-t border-line-subtle pt-5">
                      <AnimatePresence mode="wait">
                        {isOpen ? (
                          <motion.div
                            key="verify"
                            initial={reduce ? undefined : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <p className="text-body-sm font-medium text-fg-heading">
                              Record what you checked
                            </p>
                            <p className="mt-1 text-body-sm text-fg-muted">
                              This exact wording, with today&apos;s date, is what
                              buyers will see.
                            </p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <Field label="Evidence type">
                                {({ id }) => (
                                  <Select
                                    id={id}
                                    value={evidence}
                                    onChange={(e) => setEvidence(e.target.value)}
                                  >
                                    {EVIDENCE_TYPES.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </Select>
                                )}
                              </Field>
                              <Field
                                label="Register reference"
                                optional
                                hint="Kept internally, not published."
                              >
                                {({ id, describedBy }) => (
                                  <Input
                                    id={id}
                                    aria-describedby={describedBy}
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="QBCC online register"
                                  />
                                )}
                              </Field>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                              <Button
                                variant="primary"
                                onClick={() => {
                                  verifyApplication(application.id, evidence);
                                  setOpenId(null);
                                  setReference("");
                                }}
                              >
                                <Check aria-hidden="true" className="size-4" />
                                Record and publish
                              </Button>
                              <Button
                                variant="tertiary"
                                onClick={() => setOpenId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        ) : isDeclining ? (
                          <motion.div
                            key="decline"
                            initial={reduce ? undefined : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Field label="Why are you declining?">
                              {({ id }) => (
                                <Input
                                  id={id}
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  placeholder="Licence could not be found on the register"
                                />
                              )}
                            </Field>
                            <div className="mt-4 flex flex-wrap gap-3">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  declineApplication(
                                    application.id,
                                    reason.trim() || "No reason recorded",
                                  );
                                  setDeclining(null);
                                  setReason("");
                                }}
                              >
                                Reject application
                              </Button>
                              <Button
                                variant="tertiary"
                                onClick={() => setDeclining(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="idle"
                            initial={reduce ? undefined : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-wrap gap-3"
                          >
                            <Button
                              variant="primary"
                              onClick={() => setOpenId(application.id)}
                            >
                              <BadgeCheck aria-hidden="true" className="size-4" />
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setDeclining(application.id)}
                            >
                              <X aria-hidden="true" className="size-4" />
                              Reject
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 flex items-start gap-2.5 text-body-sm text-fg-muted">
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        Recording a check publishes the profile. The professional appears in the
        directory and on the homepage immediately, with the wording you chose and
        today&apos;s date — never their own claim (PRO-05). An account record is
        created for them at the same time.
      </p>
    </section>
  );
}
