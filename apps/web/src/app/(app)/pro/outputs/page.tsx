"use client";

import { FileText } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatDateTime } from "@/lib/format";

/**
 * Outputs — the work this professional has returned.
 *
 * This is also the "Documents" the wireframe asks for. They are one set of
 * records, not two: a returned report IS the document, and a professional who
 * believes there are two stores will look in the wrong one. FR-05-14/16 also
 * forbid a general document vault — the only files Stage 1 holds are those
 * returned through an authorised Trust Link, which is exactly this list.
 */
export default function ProOutputsPage() {
  /* Read-only by design: confirming receipt is the BUYER's action, and a
     professional marking their own work as received would make the status
     meaningless. */
  const { outputs, getProperty } = useJourneyStore();

  return (
    <ProShell>
      <SectionHeader
        title="Outputs"
        subtitle="Everything you have returned to a buyer, and whether they have opened it."
        count={outputs.length > 0 ? `${outputs.length} submitted` : undefined}
      />

      {outputs.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<FileText aria-hidden="true" className="size-5" />}
          title="You haven't returned anything yet"
          body="Accept a request, then submit your report from inside the connection. It lands in the buyer's own record against the property it concerns."
        />
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {outputs.map((output) => {
            const property = getProperty(output.propertyId);
            return (
              <RevealItem key={output.id}>
                <article className="rounded-2xl border border-line-subtle bg-surface-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-overline uppercase text-fg-muted">
                        {output.type}
                      </p>
                      <h2 className="mt-1.5 text-h4 text-fg-heading">
                        {output.title}
                      </h2>
                      <p className="text-body-sm text-fg-muted">
                        {property?.address ?? "Property"}, {property?.suburb}
                      </p>
                    </div>
                    <StatusChip
                      tone={output.receiptConfirmedAt ? "success" : "neutral"}
                    >
                      {output.receiptConfirmedAt ? "Opened by buyer" : "Delivered"}
                    </StatusChip>
                  </div>

                  <p className="measure mt-4 text-body-sm text-fg-secondary">
                    {output.summary}
                  </p>

                  <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-line-subtle pt-4 text-body-sm">
                    <div className="flex items-baseline gap-2">
                      <dt className="text-fg-muted">File</dt>
                      <dd className="font-medium text-fg">{output.fileName}</dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="text-fg-muted">Submitted</dt>
                      <dd className="font-medium text-fg">
                        {formatDateTime(output.submittedAt)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-caption text-fg-muted">
                    Prototype: no file is stored or transferred. The record, its
                    summary and where it landed are real state —{" "}
                    {output.receiptConfirmedAt
                      ? "the buyer has confirmed receipt."
                      : "the buyer has not confirmed receipt yet."}
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </ProShell>
  );
}
