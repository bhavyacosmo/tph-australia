"use client";

import { CheckCircle2, FileText } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { PageShell } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

/** P07 — completed connections. History only. */
export default function ProCompletedPage() {
  const { trustLinks, outputs, getProperty } = useJourneyStore();
  const done = trustLinks.filter(
    (t) => t.status === "completed" || t.status === "declined",
  );

  return (
    <ProShell>
      <PageShell>
        <h1 className="text-h1 text-fg-heading">Completed</h1>
        <p className="measure mt-3 text-body-lg text-fg-secondary">
          Work you&apos;ve finished, and requests you didn&apos;t take on.
        </p>

        {done.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-12 text-center text-body-sm text-fg-muted">
            Nothing here yet.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-line-subtle border-y border-line-subtle">
            {done.map((link) => {
              const property = getProperty(link.propertyId);
              const output = outputs.find((o) => o.trustLinkId === link.id);
              return (
                <li
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-5"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-body font-medium text-fg-heading">
                      {link.status === "completed" ? (
                        <CheckCircle2
                          aria-hidden="true"
                          className="size-4 text-success-fg"
                        />
                      ) : null}
                      {property?.address ?? "Property"}
                    </span>
                    <span className="mt-0.5 block text-body-sm text-fg-muted">
                      {serviceFor(link.serviceKey).label}
                      {output && (
                        <>
                          {" · "}
                          <FileText
                            aria-hidden="true"
                            className="mr-1 inline size-3 align-text-bottom"
                          />
                          {output.title} · {formatDate(output.submittedAt)}
                        </>
                      )}
                    </span>
                  </span>
                  <StatusChip
                    tone={link.status === "completed" ? "success" : "neutral"}
                  >
                    {link.status === "completed" ? "Output sent" : "Declined"}
                  </StatusChip>
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
