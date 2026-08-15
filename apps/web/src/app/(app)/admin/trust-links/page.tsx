"use client";

import { EyeOff, Link2 } from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/ui/page";
import { StatusChip, type StatusTone } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { formatDate, formatRelative } from "@/lib/format";
import type { TrustLinkStatus } from "@/lib/mock/types";

/**
 * Trust Links, from the platform's side.
 *
 * **This screen is deliberately read-only, and that is the interesting part.**
 *
 * The client suggested on the call that stopping a connection should route
 * through admin (L489). Consent withdrawal staying in the hands of the person
 * who gave it is a privacy-law position, not a UI preference, so the buyer keeps
 * the control and admin gets visibility. A complaint route is a separate item in
 * the gap analysis.
 *
 * `ADM-08` is why there are no columns for the buyer's name, the property
 * address, what was shared or what came back. Admin sees that a connection
 * exists and what state it is in — never its contents.
 */
const STATUS: Record<TrustLinkStatus, { label: string; tone: StatusTone }> = {
  pending: { label: "Awaiting professional", tone: "attention" },
  authorized: { label: "Authorised", tone: "info" },
  active: { label: "Active", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  completed: { label: "Completed", tone: "success" },
  revoked: { label: "Withdrawn by buyer", tone: "danger" },
};

export default function AdminTrustLinksPage() {
  const { trustLinks, getProfessional, getProperty } = useJourneyStore();

  return (
    <>
      <SectionHeader
        title="Trust Links"
        subtitle="Every connection between a buyer and a professional, and what state it is in."
        count={
          trustLinks.length > 0
            ? `${trustLinks.filter((t) => t.status === "active").length} active of ${trustLinks.length}`
            : undefined
        }
      />

      {trustLinks.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Link2 aria-hidden="true" className="size-5" />}
          title="No Trust Links yet"
          body="When a buyer sends a request to a professional it appears here — as state only, never its contents."
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line-subtle">
          <table className="w-full min-w-[44rem] border-collapse bg-surface-card text-left">
            <caption className="sr-only">
              Trust Links with service, professional, suburb and status
            </caption>
            <thead>
              <tr className="border-b border-line-subtle bg-surface-sunken">
                {["Service", "Professional", "Area", "Created", "Access ends", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-caption font-semibold uppercase tracking-wider text-fg-muted"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {trustLinks.map((link) => {
                const status = STATUS[link.status];
                const professional = getProfessional(link.professionalId);
                /* Suburb, never the street address — ADM-08. */
                const suburb = getProperty(link.propertyId)?.suburb;

                return (
                  <tr
                    key={link.id}
                    className="border-b border-line-subtle last:border-0"
                  >
                    <td className="px-4 py-3.5 text-body-sm font-medium text-fg-heading">
                      {serviceFor(link.serviceKey).label}
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      {professional?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      {suburb ?? "Brisbane"}
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      {formatRelative(link.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      {link.expiresAt ? formatDate(link.expiresAt) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusChip tone={status.tone}>{status.label}</StatusChip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 flex items-start gap-3 rounded-xl border border-line-subtle bg-surface-sunken px-4 py-3.5 text-body-sm text-fg-secondary">
        <EyeOff aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-muted" />
        <span>
          No column here shows the buyer, the street address, what they chose to
          share or what came back. Admin sees that a connection exists and its
          state — never its contents (ADM-08). Withdrawing a connection stays with
          the buyer who authorised it.
        </span>
      </p>
    </>
  );
}
