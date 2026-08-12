"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  FileText,
  Info,
  Lock,
  MessageSquare,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";

import { AppShell } from "@/components/shells/app-shell";
import { PageShell, RailPanel } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusChip, type StatusTone } from "@/components/ui/status-chip";
import { Reveal } from "@/components/motion/reveal";
import {
  ProfessionalAvatar,
  VerificationBadge,
} from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  CONTACT_CHANNELS,
  professionalById,
  SCOPE_ITEMS,
  serviceFor,
} from "@/lib/mock/marketplace";
import { formatDateTime, formatRelative, formatUntil } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { TrustLinkStatus } from "@/lib/mock/types";

const STATUS: Record<
  TrustLinkStatus,
  { label: string; tone: StatusTone; lede: string }
> = {
  pending: {
    label: "Waiting on them",
    tone: "attention",
    lede: "Your request is with the professional. Nothing has been shared until they accept.",
  },
  authorized: {
    label: "Authorised",
    tone: "info",
    lede: "They accepted. The connection is opening.",
  },
  active: {
    label: "Active",
    tone: "success",
    lede: "The connection is live. They can see exactly what you chose, and nothing else.",
  },
  declined: {
    label: "Declined",
    tone: "neutral",
    lede: "They didn't take this one on. Nothing was shared.",
  },
  completed: {
    label: "Completed",
    tone: "success",
    lede: "The work came back and is in your record.",
  },
  revoked: {
    label: "Withdrawn",
    tone: "neutral",
    lede: "You withdrew this Trust Link. Their access stopped immediately.",
  },
};

export function TrustLinkWorkspace({ trustLinkId }: { trustLinkId: string }) {
  const reduce = useReducedMotion();
  const { trustLinks, outputs, getProperty, revokeTrustLink, journey } =
    useJourneyStore();
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const link = trustLinks.find((t) => t.id === trustLinkId);

  if (!link) {
    return (
      <AppShell showStageBar={false}>
        <PageShell className="max-w-2xl">
          <h1 className="text-h1 text-fg-heading">That connection isn&apos;t here</h1>
          <p className="mt-4 text-body-lg text-fg-secondary">
            It may have been withdrawn, or the link may be out of date.
          </p>
          <ButtonLink
            href={routes.propIdTrustLinks()}
            variant="primary"
            className="mt-8"
          >
            All your Trust Links
          </ButtonLink>
        </PageShell>
      </AppShell>
    );
  }

  const professional = professionalById(link.professionalId);
  const service = serviceFor(link.serviceKey);
  const property = getProperty(link.propertyId);
  const status = STATUS[link.status];
  const output = outputs.find((o) => o.trustLinkId === link.id);
  const live = link.status === "active" || link.status === "completed";

  return (
    <AppShell showStageBar={false}>
      <PageShell>
        {/* ============================================================ head */}
        <Reveal>
          <div
            className={cn(
              "relative isolate overflow-hidden rounded-3xl p-7 md:p-9",
              live ? "bg-brand text-white" : "bg-surface-card border border-line-subtle",
            )}
          >
            {live && <div aria-hidden="true" className="grain absolute inset-0" />}
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-overline uppercase",
                      live ? "text-white/60" : "text-fg-muted",
                    )}
                  >
                    Trust Link · {service.label}
                  </p>
                  <h1
                    className={cn(
                      "mt-3 text-h1",
                      live ? "text-white" : "text-fg-heading",
                    )}
                  >
                    {professional?.name ?? "Professional"}
                  </h1>
                  <p
                    className={cn(
                      "measure mt-3 text-body-lg",
                      live ? "text-white/75" : "text-fg-secondary",
                    )}
                  >
                    {status.lede}
                  </p>
                </div>

                {/* The state transition is the content of this screen, so it
                    gets the movement rather than a static chip */}
                <motion.div
                  key={link.status}
                  initial={reduce ? undefined : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <StatusChip
                    tone={live ? "onDark" : status.tone}
                    icon={
                      link.status === "pending" ? (
                        <Clock aria-hidden="true" className="size-3" />
                      ) : (
                        <Check aria-hidden="true" className="size-3" />
                      )
                    }
                  >
                    {status.label}
                  </StatusChip>
                </motion.div>
              </div>

              {live && link.expiresAt && (
                <p className="mt-7 flex items-center gap-2 border-t border-white/15 pt-5 text-body-sm text-white/70">
                  <Clock aria-hidden="true" className="size-4 shrink-0" />
                  Access ends {formatUntil(link.expiresAt)} — automatically, on{" "}
                  {formatDateTime(link.expiresAt)}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ------------------------------------------------------- main */}
          <div className="min-w-0 lg:col-span-8">
            {/* what they can see — FR-07-10 */}
            <section aria-labelledby="scope-heading">
              <h2 id="scope-heading" className="text-h3 text-fg-heading">
                What {professional?.name ?? "they"} can see
              </h2>
              <p className="measure mt-2 text-body-sm text-fg-muted">
                Exactly this, and nothing else. Changing it means withdrawing and
                starting again — which is deliberate.
              </p>

              <ul className="mt-6 divide-y divide-line-subtle border-y border-line-subtle">
                {SCOPE_ITEMS.map((item) => {
                  const shared = link.sharedItems.includes(item.id);
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-4 py-3.5"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                          shared
                            ? "bg-action text-white"
                            : "bg-surface-sunken text-fg-muted",
                        )}
                      >
                        {shared ? (
                          <Check className="size-3" />
                        ) : (
                          <X className="size-3" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body-sm font-medium text-fg-heading">
                          {item.label}
                        </span>
                        <span className="block text-body-sm text-fg-muted">
                          {item.consequence}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-caption font-medium",
                          shared ? "text-action" : "text-fg-muted",
                        )}
                      >
                        {shared ? "Shared" : "Private"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* the output — the point of the whole loop */}
            <section aria-labelledby="output-heading" className="mt-12">
              <h2 id="output-heading" className="text-h3 text-fg-heading">
                Their work
              </h2>

              {output ? (
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5 rounded-2xl border border-line-subtle bg-surface-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-error-bg text-error-fg">
                      <FileText aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-h4 text-fg-heading">{output.title}</p>
                      <p className="text-body-sm text-fg-muted">
                        {output.type} · {formatRelative(output.submittedAt)}
                      </p>
                      <p className="measure mt-3 text-body-sm text-fg-secondary">
                        {output.summary}
                      </p>
                      <p className="mt-3 text-caption text-fg-muted">
                        {output.fileName}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-line-subtle pt-5">
                    <ButtonLink
                      href={routes.propIdOutputs()}
                      variant="secondary"
                    >
                      See it in your Prop ID
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </ButtonLink>
                  </div>
                </motion.div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-10 text-center text-body-sm text-fg-muted">
                  {live
                    ? "Nothing back yet. When they submit their report it lands here and against the property in your Prop ID."
                    : "Their work will appear here once the connection is active."}
                </p>
              )}
            </section>

            {/* activity */}
            <section aria-labelledby="activity-heading" className="mt-12">
              <h2 id="activity-heading" className="text-h4 text-fg-heading">
                Everything that has happened
              </h2>
              <ol className="relative mt-5 space-y-4">
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-[0.3125rem] top-2 w-px bg-line-subtle"
                />
                {link.activity.map((entry, i) => (
                  <li key={`${entry.at}-${i}`} className="relative flex gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-surface-page",
                        i === 0 ? "bg-action" : "bg-line-strong",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-body-sm text-fg">
                        {entry.what}
                      </span>
                      <span className="block text-caption text-fg-muted">
                        {formatDateTime(entry.at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* ------------------------------------------------------- rail */}
          <div className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-24">
              {professional && (
                <RailPanel title="Who">
                  <div className="flex items-start gap-3">
                    <ProfessionalAvatar
                      professional={professional}
                      className="size-12"
                    />
                    <div className="min-w-0">
                      <Link
                        href={routes.professional(professional.id)}
                        className="text-body font-semibold text-fg-heading underline-offset-4 hover:underline"
                      >
                        {professional.name}
                      </Link>
                      <p className="text-body-sm text-fg-muted">
                        {professional.category}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <VerificationBadge professional={professional} />
                  </div>
                </RailPanel>
              )}

              {property && (
                <RailPanel title="About">
                  <Link
                    href={routes.property(journey.id, property.id)}
                    className="block text-body font-medium text-fg-heading underline-offset-4 hover:underline"
                  >
                    {property.address}
                  </Link>
                  <p className="text-body-sm text-fg-muted">
                    {property.suburb} QLD {property.postcode}
                  </p>
                  <dl className="mt-4 space-y-2 border-t border-line-subtle pt-4 text-body-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-fg-muted">Purpose</dt>
                      <dd className="text-right text-fg">{link.purpose}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-fg-muted">Contact</dt>
                      <dd className="text-right text-fg">
                        {
                          CONTACT_CHANNELS.find(
                            (c) => c.value === link.contactChannel,
                          )?.label
                        }
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-fg-muted">Period</dt>
                      <dd className="text-right text-fg">
                        {link.expiryDays} days
                      </dd>
                    </div>
                  </dl>
                </RailPanel>
              )}

              {/* Communication — honest placeholder. The client raised chat
                  (L483-485) and it conflicts with [C-05]; not built. */}
              <RailPanel title="Messages">
                <p className="flex items-start gap-3 text-body-sm text-fg-muted">
                  <MessageSquare
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>
                    Messaging between you and the professional isn&apos;t built
                    in this prototype. It was raised on the call and needs a
                    decision — structured notes, or a full conversation.
                  </span>
                </p>
              </RailPanel>

              <RailPanel title="Documents">
                <p className="flex items-start gap-3 text-body-sm text-fg-muted">
                  <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Sharing a document with this professional from your Prop ID
                    isn&apos;t built yet — the client called it &ldquo;too much
                    for now&rdquo; for the first stage.
                  </span>
                </p>
              </RailPanel>

              {/* FR-07-08 — withdraw, and it stops */}
              {live && (
                <RailPanel tone="sunken">
                  {confirmRevoke ? (
                    <>
                      <p className="text-body-sm font-medium text-fg-heading">
                        Withdraw this Trust Link?
                      </p>
                      <p className="mt-2 text-body-sm text-fg-secondary">
                        {professional?.name ?? "They"} loses access immediately.
                        Anything already sent to you stays in your record.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            revokeTrustLink(link.id);
                            setConfirmRevoke(false);
                          }}
                        >
                          Withdraw it
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => setConfirmRevoke(false)}
                        >
                          Keep it
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                        <ShieldCheck
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-action"
                        />
                        <span>
                          You stay in control. Withdraw at any time and their
                          access stops straight away.
                        </span>
                      </p>
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setConfirmRevoke(true)}
                        className="mt-4"
                      >
                        Withdraw this Trust Link
                      </Button>
                    </>
                  )}
                </RailPanel>
              )}

              {link.status === "pending" && (
                <RailPanel tone="wash">
                  <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                    <UserCog
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-action"
                    />
                    <span>
                      <span className="block font-medium text-fg-heading">
                        Demonstrating the other side
                      </span>
                      Switch to the professional view in the account menu to
                      accept this request and watch the connection activate.
                    </span>
                  </p>
                </RailPanel>
              )}

              <p className="flex items-start gap-2.5 text-caption text-fg-muted">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                Created {formatDateTime(link.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    </AppShell>
  );
}
