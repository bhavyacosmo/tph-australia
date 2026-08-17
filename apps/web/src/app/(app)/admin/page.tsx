"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Home,
  Link2,
  ShieldHalf,
  Users,
} from "lucide-react";

import { SectionHeader } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Admin overview — PM wireframe §10.
 *
 * ⚠️ Two things to flag rather than bury:
 *
 *  1. On the call the client walked this surface and then said *"I think this is
 *     not needed"* (transcript L547). The referent is ambiguous and it sits
 *     directly after the PM described admin intervening in requests, so admin is
 *     built minimally and the question stays on the list.
 *
 *  2. `ADM-08` — admin must have **no access to a consumer's documents or
 *     outputs**, and every consumer lookup is logged. Every screen in this area
 *     therefore shows state, never content. There is no route from here to a
 *     buyer's notes, readiness answers or a returned report.
 */
export default function AdminOverviewPage() {
  const {
    users,
    listings,
    trustLinks,
    applications,
    allProfessionals,
    professionalOverrides,
    platformEvents,
  } = useJourneyStore();

  const pendingApplications = applications.filter((a) => a.status === "pending");
  const suspendedUsers = users.filter((u) => u.suspended);
  const suspendedPros = allProfessionals.filter(
    (p) => professionalOverrides[p.id]?.suspended,
  );

  const tiles = [
    {
      href: "/admin/users",
      icon: Users,
      value: users.length,
      label: "Accounts",
      detail: `${suspendedUsers.length} suspended`,
    },
    {
      href: "/admin/properties",
      icon: Home,
      value: listings.length,
      label: "Listings",
      detail: `${listings.filter((l) => (l.status ?? "published") === "published").length} published`,
    },
    {
      href: "/admin/professionals",
      icon: BadgeCheck,
      value: allProfessionals.length,
      label: "Professionals",
      detail: `${suspendedPros.length} suspended`,
    },
    {
      href: "/admin/trust-links",
      icon: Link2,
      value: trustLinks.length,
      label: "Trust Links",
      detail: `${trustLinks.filter((t) => t.status === "active").length} active`,
    },
  ];

  return (
    <>
      <SectionHeader
        title="Platform overview"
        subtitle="The state of the pilot, and anything waiting on a decision from you."
        actions={
          pendingApplications.length > 0 ? (
            <StatusChip tone="attention">
              {pendingApplications.length} awaiting verification
            </StatusChip>
          ) : undefined
        }
      />

      {/* ADM-08 — stated where an admin would otherwise go looking */}
      <p className="mt-8 flex items-start gap-3 rounded-xl border border-line-subtle bg-surface-sunken px-4 py-3 text-body-sm text-fg-secondary">
        <ShieldHalf
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-fg-muted"
        />
        <span>
          Admin sees <em>state</em> only — never a buyer&apos;s notes, readiness
          answers, or a returned report. Consumer lookups are logged. That
          boundary is a requirement, not a prototype shortcut.
        </span>
      </p>

      {/* ------------------------------------------------------------- tiles */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cn(
              "group rounded-2xl border border-line-subtle bg-surface-card p-5",
              "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
              "hover:-translate-y-0.5 hover:border-line hover:shadow-elev-hover",
            )}
          >
            <span className="flex items-center justify-between">
              <tile.icon aria-hidden="true" className="size-4 text-fg-muted" />
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              />
            </span>
            <p className="mt-3 text-h2 tabular text-fg-heading">
              <AnimatedNumber value={tile.value} />
            </p>
            <p className="mt-1 text-body-sm font-medium text-fg-heading">
              {tile.label}
            </p>
            <p className="text-caption text-fg-muted">{tile.detail}</p>
          </Link>
        ))}
      </div>

      {/* ------------------------------------------------------- needs action */}
      {pendingApplications.length > 0 && (
        <section aria-labelledby="waiting" className="mt-12">
          <h2 id="waiting" className="text-h3 text-fg-heading">
            Waiting on you
          </h2>
          <ul className="mt-5 divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
            {pendingApplications.map((application) => (
              <li key={application.id}>
                <Link
                  href="/admin/verification"
                  className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-medium text-fg-heading">
                      {application.businessName}
                    </span>
                    <span className="block text-caption text-fg-muted">
                      Applied {formatRelative(application.submittedAt)} ·{" "}
                      {application.area}
                    </span>
                  </span>
                  <StatusChip tone="attention">Needs a check</StatusChip>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-fg-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------- activity
          The dedicated Activity page was removed on 17 August 2026. The log
          itself is untouched — it still records every verification, suspension
          and listing change — so this section now shows more of it rather than
          linking away to a page that no longer exists. */}
      <section aria-labelledby="recent" className="mt-12">
        <h2 id="recent" className="text-h3 text-fg-heading">
          Recent platform activity
        </h2>

        <ul className="mt-5 divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
          {platformEvents.slice(0, 12).map((event) => (
            <li key={event.id} className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3.5">
              <span className="min-w-0 flex-1 text-body-sm text-fg">
                {event.what}
              </span>
              <span className="text-caption text-fg-muted">
                {event.actorName} · {formatRelative(event.at)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
