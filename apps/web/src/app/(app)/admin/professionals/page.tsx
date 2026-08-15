"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

import { SectionHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { ProfessionalAvatar } from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The professional cohort.
 *
 * **PRO-05 is the constraint that shapes this screen.** An admin does not click
 * "verify" — they record WHAT they checked, and the wording a buyer reads is
 * generated from that record with its date. So the control here is a form, not
 * a toggle, and there is no way to publish a bare "Verified" badge.
 *
 * Suspending removes the business from the buyer-facing directory immediately,
 * because `professionals` in the store filters on it. Sign out, sign in as a
 * buyer and they are gone.
 */
const EVIDENCE_TYPES = [
  "QBCC licence",
  "Practising certificate",
  "Agent licence",
  "Pest management technician licence",
  "Professional indemnity insurance",
  "Business registration",
];

export default function AdminProfessionalsPage() {
  const reduce = useReducedMotion();
  const {
    allProfessionals,
    professionalOverrides,
    setProfessionalSuspended,
    recordProfessionalVerification,
  } = useJourneyStore();

  const [recording, setRecording] = useState<string | null>(null);
  const [evidence, setEvidence] = useState(EVIDENCE_TYPES[0]);

  const verified = allProfessionals.filter((p) => p.verification);

  return (
    <>
      <SectionHeader
        title="Professionals"
        subtitle="Who is listed, what was checked about them, and when."
        count={`${verified.length} checked of ${allProfessionals.length}`}
      />

      <ul className="mt-8 space-y-3">
        {allProfessionals.map((professional) => {
          const suspended = Boolean(
            professionalOverrides[professional.id]?.suspended,
          );
          const open = recording === professional.id;

          return (
            <motion.li
              key={professional.id}
              layout={reduce === true ? false : true}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "rounded-2xl border p-5",
                suspended
                  ? "border-line-subtle bg-surface-sunken"
                  : "border-line-subtle bg-surface-card",
              )}
            >
              <div className="flex flex-wrap items-center gap-4">
                <ProfessionalAvatar
                  professional={professional}
                  className={cn("size-11", suspended && "opacity-50")}
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
                  {suspended ? (
                    <>
                      <StatusChip tone="danger">Suspended</StatusChip>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setProfessionalSuspended(professional.id, false)
                        }
                      >
                        Reactivate
                      </Button>
                    </>
                  ) : (
                    <>
                      <StatusChip
                        tone={professional.verification ? "success" : "attention"}
                      >
                        {professional.verification ? "Listed" : "Unchecked"}
                      </StatusChip>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setRecording(open ? null : professional.id)
                        }
                      >
                        {open ? "Cancel" : "Record a check"}
                      </Button>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() =>
                          setProfessionalSuspended(professional.id, true)
                        }
                      >
                        Suspend
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {open && (
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5 flex flex-wrap items-end gap-4 border-t border-line-subtle pt-5"
                >
                  <div className="min-w-60 flex-1">
                    <label
                      htmlFor={`evidence-${professional.id}`}
                      className="text-body-sm font-medium text-fg-heading"
                    >
                      What did you check?
                    </label>
                    <p className="mt-1 text-body-sm text-fg-muted">
                      This exact wording, and today&apos;s date, is what a buyer
                      will read on the profile.
                    </p>
                    <Select
                      id={`evidence-${professional.id}`}
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      className="mt-2"
                    >
                      {EVIDENCE_TYPES.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      recordProfessionalVerification(professional.id, evidence);
                      setRecording(null);
                    }}
                  >
                    Record check
                  </Button>
                </motion.div>
              )}
            </motion.li>
          );
        })}
      </ul>
    </>
  );
}
