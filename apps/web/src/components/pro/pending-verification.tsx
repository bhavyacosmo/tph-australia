"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Clock, EyeOff, RotateCcw, XCircle } from "lucide-react";

import { SectionHeader, RailPanel } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { monogram } from "@/lib/mock/media";
import { formatRelative } from "@/lib/format";
import type { ProfessionalApplication } from "@/lib/mock/types";

/**
 * What a professional sees between submitting and being approved.
 *
 * This screen exists because the alternative is worse: showing an unapproved
 * professional their queues would imply work could arrive, when by design none
 * can — they are not in the directory, not in any buyer's Trust Link picker,
 * and not reachable. Saying so plainly is the honest version.
 *
 * It also shows them exactly what an admin is reading, so a rejection is never
 * a surprise about what was submitted.
 */
export function PendingVerification({
  application,
}: {
  application: ProfessionalApplication;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { signOut } = useJourneyStore();

  const declined = application.status === "declined";
  const service = serviceFor(application.serviceKey);

  return (
    <>
      <SectionHeader
        title={declined ? "Your profile wasn't approved" : "Waiting on verification"}
        subtitle={
          declined
            ? "The Property Helpline reviewed your profile and couldn't publish it. The reason is below."
            : "Your profile is with The Property Helpline. Nothing else is needed from you right now."
        }
        actions={
          <StatusChip tone={declined ? "danger" : "attention"}>
            {declined ? "Not approved" : "Under review"}
          </StatusChip>
        }
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          {/* --------------------------------------------------- the state */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cnPanel(declined)}
          >
            <span
              aria-hidden="true"
              className={
                declined
                  ? "grid size-11 place-items-center rounded-full bg-error-bg text-error-fg"
                  : "grid size-11 place-items-center rounded-full bg-attention-bg text-attention-fg"
              }
            >
              {declined ? (
                <XCircle className="size-5" />
              ) : (
                <Clock className="size-5" />
              )}
            </span>

            <h2 className="mt-4 text-h3 text-fg-heading">
              {declined
                ? "What happens now"
                : "Submitted " + formatRelative(application.submittedAt)}
            </h2>

            {declined ? (
              <>
                <p className="measure mt-3 text-body text-fg-secondary">
                  {application.declineReason ??
                    "No reason was recorded against this decision."}
                </p>
                <p className="measure mt-3 text-body-sm text-fg-muted">
                  Get in touch with The Property Helpline if you think this is
                  wrong, or if the thing that blocked it has since changed.
                </p>
              </>
            ) : (
              <p className="measure mt-3 text-body text-fg-secondary">
                Someone at The Property Helpline checks what you hold against the
                relevant register, then records what they checked and when. That
                record — not your own claim — is the wording buyers will read
                beside your name.
              </p>
            )}
          </motion.div>

          {/* ----------------------------------------- what they submitted */}
          <section aria-labelledby="submitted" className="mt-10">
            <h2 id="submitted" className="text-h3 text-fg-heading">
              What you submitted
            </h2>
            <p className="measure mt-3 text-body text-fg-secondary">
              This is exactly what an admin is reading.
            </p>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-line-subtle bg-surface-card p-5">
              {application.photoUrl ? (
                <span className="size-16 shrink-0 overflow-hidden rounded-full bg-surface-sunken">
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
                  className="grid size-16 shrink-0 place-items-center rounded-full bg-brand text-h4 font-bold text-brand-fg"
                >
                  {monogram(application.contactName)}
                </span>
              )}

              <div className="min-w-0">
                <p className="text-overline uppercase text-fg-muted">
                  {service.label}
                </p>
                <p className="mt-1.5 text-body-lg font-semibold text-fg-heading">
                  {application.businessName}
                </p>
                <p className="text-body-sm text-fg-secondary">
                  {application.contactName}
                  {application.area && ` · ${application.area}`}
                </p>
                {application.approach && (
                  <p className="measure mt-3 text-body-sm text-fg-secondary">
                    {application.approach}
                  </p>
                )}
                {(application.services?.length ?? 0) > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {application.services?.map((s) => (
                      <li
                        key={s}
                        className="rounded-full bg-surface-sunken px-2.5 py-1 text-caption text-fg-secondary"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="mt-4 text-body-sm text-fg-muted">
              Editing a submitted profile isn&apos;t built in this prototype —
              an admin decides on what is here. In the real product this is where
              you would withdraw and resubmit.
            </p>
          </section>
        </div>

        {/* ------------------------------------------------------------ rail */}
        <aside className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-28">
            <RailPanel title="Until then">
              <ul className="space-y-3.5">
                {[
                  "You are not in the professionals directory.",
                  "You do not appear on the homepage.",
                  "No buyer can select you in a Trust Link.",
                  "No request can reach you.",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-body-sm text-fg-secondary"
                  >
                    <EyeOff
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-fg-muted"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </RailPanel>

            <RailPanel tone="wash">
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                <BadgeCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-action"
                />
                <span>
                  Once approved, your queues, connections and outputs all open up
                  here, and buyers can find you.
                </span>
              </p>
            </RailPanel>

            <RailPanel tone="sunken">
              <p className="text-caption font-semibold uppercase tracking-wider text-fg-muted">
                Prototype
              </p>
              <p className="mt-2 text-body-sm text-fg-secondary">
                To move this along, sign out and sign in as Admin, then open
                Verification.
              </p>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="mt-4"
                onClick={() => {
                  signOut();
                  router.push("/sign-in?role=admin");
                }}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Sign out and review as Admin
              </Button>
            </RailPanel>
          </div>
        </aside>
      </div>
    </>
  );
}

function cnPanel(declined: boolean) {
  return declined
    ? "rounded-2xl border border-error-line bg-error-bg/40 p-6"
    : "rounded-2xl border border-attention-line bg-attention-bg p-6";
}
