"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { StatusChip } from "@/components/ui/status-chip";
import { serviceFor } from "@/lib/mock/marketplace";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { TrustLink } from "@/lib/mock/types";

/**
 * A pending request, as the professional sees it BEFORE accepting.
 *
 * FR-08-07 is the whole design. A professional may see the purpose, a broad
 * location, the timing and the buyer's reason — and nothing else. Note what is
 * absent: the buyer's name, the street address, any contact detail. That
 * absence is the requirement, not an oversight, which is why this markup lives
 * in one component rather than being retyped on every screen that lists
 * requests.
 */
export function RequestCard({
  link,
  suburb,
}: {
  link: TrustLink;
  suburb: string | undefined;
}) {
  const service = serviceFor(link.serviceKey);

  return (
    <Link
      href={routes.proRequest(link.id)}
      className={cn(
        "group block rounded-2xl border-2 border-action/30 bg-trustlink-wash p-6",
        "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 hover:border-action/60 hover:shadow-elev-2",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-overline uppercase text-fg-muted">{service.label}</p>
          <p className="mt-2 text-h3 text-fg-heading">{link.purpose}</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-body-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-muted">Area</dt>
              <dd className="font-medium text-fg">{suburb ?? "Brisbane"}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-muted">Requested</dt>
              <dd className="font-medium text-fg">
                {formatRelative(link.createdAt)}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-muted">Permission period</dt>
              <dd className="font-medium text-fg">{link.expiryDays} days</dd>
            </div>
          </dl>
        </div>
        <StatusChip
          tone="attention"
          icon={<Clock aria-hidden="true" className="size-3" />}
        >
          Awaiting you
        </StatusChip>
      </div>

      {link.note && (
        <p className="measure mt-5 border-t border-action/20 pt-4 text-body-sm italic text-fg-secondary">
          &ldquo;{link.note}&rdquo;
        </p>
      )}

      <p className="mt-5 flex items-center gap-2 text-body-sm font-medium text-fg-link">
        Read the request and decide
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
        />
      </p>
    </Link>
  );
}
