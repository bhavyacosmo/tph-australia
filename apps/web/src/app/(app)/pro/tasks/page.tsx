"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ListChecks } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { formatUntil } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * Tasks.
 *
 * ⚠️ A DERIVED VIEW, NOT A TASK SYSTEM.
 *
 * The PM wireframe §7 asks for tasks; [C-02] scoped the professional surface
 * without one, and nobody has decided who creates a task, who can reassign it,
 * or whether the buyer sees it. Inventing that model here would be inventing
 * product.
 *
 * So this screen makes no new objects. Every row is an obligation that already
 * exists in the data: an accepted connection with no output submitted yet is,
 * by definition, work outstanding. When the professional submits the output the
 * row disappears, because the obligation is discharged — no separate "mark
 * done" to fall out of step with reality.
 */
export default function ProTasksPage() {
  const { trustLinks, outputs, getProperty } = useJourneyStore();

  const outstanding = trustLinks.filter(
    (t) => t.status === "active" && !outputs.some((o) => o.trustLinkId === t.id),
  );

  return (
    <ProShell>
      <SectionHeader
        title="Tasks"
        subtitle="Work you have accepted and not yet returned."
        count={outstanding.length > 0 ? `${outstanding.length} outstanding` : undefined}
      />

      {outstanding.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<CheckCircle2 aria-hidden="true" className="size-5" />}
          title="Nothing outstanding"
          body="Every connection you have accepted has had its work returned. New requests appear under New requests."
        />
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {outstanding.map((link) => {
            const property = getProperty(link.propertyId);
            return (
              <RevealItem key={link.id}>
                <Link
                  href={routes.proConnection(link.id)}
                  className="group flex flex-wrap items-center gap-5 rounded-2xl border border-line-subtle bg-surface-card p-5 transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-trustlink-wash text-action">
                    <ListChecks aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold text-fg-heading">
                      Submit your {serviceFor(link.serviceKey).label.toLowerCase()} output
                    </span>
                    <span className="block text-body-sm text-fg-muted">
                      {property?.address ?? "Property"}, {property?.suburb}
                    </span>
                  </span>
                  {link.expiresAt && (
                    <StatusChip tone="attention">
                      Access ends {formatUntil(link.expiresAt)}
                    </StatusChip>
                  )}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      <p className="mt-10 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        This list is derived from your active connections rather than kept
        separately, so it can never disagree with them. A task board where
        anyone can create and assign work needs a product decision first — see
        the open questions register.
      </p>
    </ProShell>
  );
}
