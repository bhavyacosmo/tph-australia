"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  EyeOff,
  Info,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { PageShell, RailPanel } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SCOPE_ITEMS, serviceFor } from "@/lib/mock/marketplace";
import { formatDateTime, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * P03a — pre-acceptance request detail.
 *
 * FR-08-07 draws a hard line: before accepting, the professional sees the
 * purpose, a broad location, the timing and the reason. Nothing else.
 *
 * So this screen shows the buyer's SUBURB, not the street address; it names no
 * person; and it lists what *would* become visible on acceptance without
 * revealing any of it. That last part matters — a professional deciding whether
 * to take a job needs to know what they will get, and the client's own model has
 * them accepting before the connection opens (transcript L197-203).
 *
 * Accepting is a real state change: pending → active, the permission clock
 * starts, and the buyer's Progress Map stage goes live with this professional
 * attached.
 */
export function ProRequestDetail({ trustLinkId }: { trustLinkId: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { trustLinks, getProperty, authorizeTrustLink, declineTrustLink } =
    useJourneyStore();
  const [authorising, setAuthorising] = useState(false);

  const link = trustLinks.find((t) => t.id === trustLinkId);

  if (!link) {
    return (
      <ProShell>
        <PageShell className="max-w-2xl">
          <h1 className="text-h1 text-fg-heading">That request isn&apos;t here</h1>
          <ButtonLink href={routes.pro()} variant="primary" className="mt-8">
            Back to your requests
          </ButtonLink>
        </PageShell>
      </ProShell>
    );
  }

  const service = serviceFor(link.serviceKey);
  const property = getProperty(link.propertyId);
  const decided = link.status !== "pending";

  const authorize = () => {
    setAuthorising(true);
    // A beat, so the state change is legible rather than instantaneous.
    window.setTimeout(() => {
      authorizeTrustLink(link.id);
      setAuthorising(false);
      router.push(routes.proConnection(link.id));
    }, 650);
  };

  return (
    <ProShell>
      <PageShell>
        <Link
          href={routes.pro()}
          className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All requests
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* --------------------------------------------------------- main */}
          <div className="min-w-0 lg:col-span-8">
            <p className="text-overline uppercase text-fg-muted">
              {service.label} · Trust Link request
            </p>
            <h1 className="mt-3 text-h1 text-fg-heading">{link.purpose}</h1>

            {/* FR-08-07 — what you may see before accepting */}
            <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle sm:grid-cols-2">
              <Cell label="Area" value={property?.suburb ?? "Brisbane"} />
              <Cell
                label="Requested"
                value={formatRelative(link.createdAt)}
              />
              <Cell
                label="Permission period"
                value={`${link.expiryDays} days from acceptance`}
              />
              <Cell label="Service" value={service.label} />
            </dl>

            {link.note && (
              <section aria-labelledby="note-heading" className="mt-10">
                <h2 id="note-heading" className="text-h4 text-fg-heading">
                  What they said
                </h2>
                <p className="measure mt-3 rounded-xl bg-surface-sunken p-5 text-body italic text-fg-secondary">
                  “{link.note}”
                </p>
              </section>
            )}

            {/* Withheld until acceptance — stated, not silently absent */}
            <section aria-labelledby="withheld-heading" className="mt-10">
              <h2 id="withheld-heading" className="text-h4 text-fg-heading">
                Not shown yet
              </h2>
              <p className="measure mt-2 text-body-sm text-fg-muted">
                You are seeing the purpose, the area and the timing. The buyer
                chose what you receive on acceptance — you will see that list in
                full, and nothing outside it.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Who they are",
                  "The street address",
                  "Any contact detail",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-line-subtle bg-surface-card px-4 py-3 text-body-sm text-fg-muted"
                  >
                    <EyeOff aria-hidden="true" className="size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* On acceptance */}
            <section aria-labelledby="onaccept-heading" className="mt-10">
              <h2 id="onaccept-heading" className="text-h4 text-fg-heading">
                What you get if you accept
              </h2>
              <ul className="mt-5 space-y-2.5">
                {SCOPE_ITEMS.filter((i) => link.sharedItems.includes(i.id)).map(
                  (item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl border border-line-subtle bg-surface-card px-4 py-3"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-action"
                      />
                      <span>
                        <span className="block text-body-sm font-medium text-fg-heading">
                          {item.label}
                        </span>
                        <span className="block text-body-sm text-fg-muted">
                          {item.consequence}
                        </span>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          </div>

          {/* --------------------------------------------------------- rail */}
          <div className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-24">
              <RailPanel>
                {decided ? (
                  <>
                    <StatusChip
                      tone={link.status === "declined" ? "neutral" : "success"}
                    >
                      {link.status === "declined" ? "Declined" : "Authorised"}
                    </StatusChip>
                    <p className="mt-4 text-body-sm text-fg-secondary">
                      {link.status === "declined"
                        ? "You declined this request. Nothing was shared with you."
                        : "You authorised this Trust Link. The connection is open."}
                    </p>
                    {link.status !== "declined" && (
                      <ButtonLink
                        href={routes.proConnection(link.id)}
                        variant="primary"
                        fullWidth
                        className="mt-5"
                      >
                        Open the connection
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </ButtonLink>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-h4 text-fg-heading">Your decision</h2>
                    <p className="mt-2 text-body-sm text-fg-secondary">
                      Accepting opens the connection and starts the{" "}
                      {link.expiryDays}-day permission period. Declining shares
                      nothing.
                    </p>

                    <div className="mt-5 space-y-2.5">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={authorising}
                        onClick={authorize}
                      >
                        <ShieldCheck aria-hidden="true" className="size-4" />
                        Authorise Trust Link
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => {
                          declineTrustLink(link.id);
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  </>
                )}
              </RailPanel>

              <RailPanel tone="wash">
                <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                  <Lock
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                  <span>
                    <span className="block font-medium text-fg-heading">
                      Bounded access
                    </span>
                    Everything you see is limited to what the buyer chose, and it
                    ends when the period expires. They can withdraw sooner.
                  </span>
                </p>
              </RailPanel>

              <p className="flex items-start gap-2.5 text-caption text-fg-muted">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                Request received {formatDateTime(link.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* The transition itself, made visible */}
        <AnimatePresence>
          {authorising && (
            <motion.div
              key="authorising"
              initial={reduce ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 grid place-items-center bg-navy-900/60 backdrop-blur-sm"
            >
              <motion.div
                initial={reduce ? undefined : { opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-2xl bg-surface-card px-6 py-5 shadow-elev-3"
                role="status"
              >
                <Clock aria-hidden="true" className="size-4 text-action" />
                <p className="text-body font-medium text-fg-heading">
                  Activating the connection…
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageShell>
    </ProShell>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-card p-5">
      <dt className="text-caption uppercase tracking-wider text-fg-muted">
        {label}
      </dt>
      <dd className="mt-1.5 text-body font-medium text-fg-heading">{value}</dd>
    </div>
  );
}
