"use client";

import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { PageShell } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { ButtonLink } from "@/components/ui/button";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { formatUntil } from "@/lib/format";
import { routes } from "@/lib/routes";

/** P04 — active connections. */
export default function ProConnectionsPage() {
  const { trustLinks, getProperty } = useJourneyStore();
  const active = trustLinks.filter(
    (t) => t.status === "active" || t.status === "completed",
  );

  return (
    <ProShell>
      <PageShell>
        <h1 className="text-h1 text-fg-heading">Active connections</h1>
        <p className="measure mt-3 text-body-lg text-fg-secondary">
          Each one is bounded — you see only what the buyer chose, for only as
          long as they allowed.
        </p>

        {active.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-12 text-center text-body-sm text-fg-muted">
            Nothing active yet. Accept a request and it appears here.
          </p>
        ) : (
          <ul className="mt-10 space-y-4">
            {active.map((link) => {
              const property = getProperty(link.propertyId);
              return (
                <li key={link.id}>
                  <Link
                    href={routes.proConnection(link.id)}
                    className="group flex flex-wrap items-center gap-5 rounded-2xl border border-line-subtle bg-surface-card p-5 transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-trustlink-wash text-action">
                      <Link2 aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-fg-heading">
                        {property?.address ?? "Property"}
                      </span>
                      <span className="block text-body-sm text-fg-muted">
                        {serviceFor(link.serviceKey).label}
                        {link.expiresAt && ` · ends ${formatUntil(link.expiresAt)}`}
                      </span>
                    </span>
                    <StatusChip
                      tone={link.status === "completed" ? "success" : "info"}
                    >
                      {link.status === "completed" ? "Output sent" : "Active"}
                    </StatusChip>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-10">
          <ButtonLink href={routes.pro()} variant="secondary">
            Back to your work
          </ButtonLink>
        </div>
      </PageShell>
    </ProShell>
  );
}
