"use client";

import Link from "next/link";
import { ArrowRight, Clock, Link2, Lock, ShieldCheck } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { StatusChip, type StatusTone } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { ProfessionalAvatar } from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { professionalById, serviceFor } from "@/lib/mock/marketplace";
import { formatRelative, formatUntil } from "@/lib/format";
import { isBuilt, routes } from "@/lib/routes";
import type { TrustLinkStatus } from "@/lib/mock/types";

/**
 * S24 — Trust Links, from the buyer's side.
 *
 * Now a real list rather than an empty state: the request flow writes here, and
 * this is where the client's "Connections" section lands (PM wireframe §8).
 *
 * The empty state is kept for when there genuinely are none, because "no active
 * Trust Links" is the product's promise holding rather than a gap.
 */

const TONE: Record<TrustLinkStatus, StatusTone> = {
  pending: "attention",
  authorized: "info",
  active: "success",
  declined: "neutral",
  completed: "success",
  revoked: "neutral",
};

const LABEL: Record<TrustLinkStatus, string> = {
  pending: "Waiting on them",
  authorized: "Authorised",
  active: "Active",
  declined: "Declined",
  completed: "Completed",
  revoked: "Withdrawn",
};

export default function PropIdTrustLinksPage() {
  const { trustLinks, getProperty, journey } = useJourneyStore();

  return (
    <div>
      <RecordHeader
        title="Connections"
        count={trustLinks.length > 0 ? `${trustLinks.length}` : undefined}
        subtitle="A Trust Link is permission you give one professional, for one purpose, for a set time — and it is the only way anything here leaves your record."
        actions={
          isBuilt(routes.trustLinkNew()) ? (
            <ButtonLink href={routes.trustLinkNew()} variant="secondary">
              New Trust Link
            </ButtonLink>
          ) : undefined
        }
      />

      {trustLinks.length === 0 ? (
        <Reveal>
          <section className="mt-8 overflow-hidden rounded-3xl border border-transparent bg-trustlink-wash p-7 md:p-9">
            <span className="grid size-12 place-items-center rounded-xl bg-surface-card text-action">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-5 text-h3 text-fg-heading">
              You have no active Trust Links
            </h2>
            <p className="measure mt-3 text-body text-fg-secondary">
              Nobody outside this record can see any of it. Not a professional,
              not an agent.
            </p>

            <div className="mt-7 border-t border-action/20 pt-6">
              <p className="text-overline uppercase text-fg-muted">
                When you create one, you will choose
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Who receives it", "One professional you picked yourself."],
                  ["Why", "A single stated purpose."],
                  ["What they see", "Item by item. Everything optional starts off."],
                  ["How they may contact you", "And through which channel."],
                  ["How long it lasts", "With an expiry you set."],
                  ["When it ends", "You can withdraw it at any time."],
                ].map(([title, body]) => (
                  <li key={title} className="flex items-start gap-2.5">
                    <Link2
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-action"
                    />
                    <span>
                      <span className="block text-body-sm font-medium text-fg-heading">
                        {title}
                      </span>
                      <span className="block text-body-sm text-fg-secondary">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <ButtonLink href={routes.professionals()} variant="primary">
                Find a professional
              </ButtonLink>
            </div>
          </section>
        </Reveal>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {trustLinks.map((link) => {
            const professional = professionalById(link.professionalId);
            const property = getProperty(link.propertyId);
            const service = serviceFor(link.serviceKey);

            return (
              <RevealItem key={link.id}>
                <Link
                  href={routes.trustLink(link.id)}
                  className="group block rounded-2xl border border-line-subtle bg-surface-card p-5 transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      {professional && (
                        <ProfessionalAvatar
                          professional={professional}
                          className="size-11"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-overline uppercase text-fg-muted">
                          {service.label}
                        </p>
                        <p className="mt-1 text-h4 text-fg-heading">
                          {professional?.name ?? "Professional"}
                        </p>
                        <p className="text-body-sm text-fg-muted">
                          {property
                            ? `${property.address}, ${property.suburb}`
                            : "Property"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusChip tone={TONE[link.status]}>
                        {LABEL[link.status]}
                      </StatusChip>
                      <p className="text-caption text-fg-muted">
                        {link.status === "active" && link.expiresAt ? (
                          <span className="flex items-center gap-1.5">
                            <Clock aria-hidden="true" className="size-3" />
                            Ends {formatUntil(link.expiresAt)}
                          </span>
                        ) : (
                          <>Created {formatRelative(link.createdAt)}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 flex items-center gap-3 border-t border-line-subtle pt-4 text-body-sm text-fg-muted">
                    <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                    Sharing {link.sharedItems.length} of 8 possible items
                    <ArrowRight
                      aria-hidden="true"
                      className="ml-auto size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </p>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      <p className="mt-8 flex items-start gap-3 text-body-sm text-fg-muted">
        <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          Every Trust Link keeps a record of who, why, what, how and when — and
          every time it was used. Withdrawing one stops access immediately.
        </span>
      </p>

      <p className="mt-4 text-body-sm text-fg-muted">Journey: {journey.name}</p>
    </div>
  );
}
