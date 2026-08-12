"use client";

import Link from "next/link";
import { Check, FileText, Inbox } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { professionalById } from "@/lib/mock/marketplace";
import { formatDateTime, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * S25 / S25a — outputs returned through a Trust Link. FR-05-08.
 *
 * The continuity claim made literal: a professional's work lands against the
 * property it is about, inside the buyer's own record — *"the platform owns the
 * continuity, not only the introduction"* ([SG] p.6).
 *
 * FR-05-14/15/16 — this is NOT a document vault. Only files returned through an
 * authorised Trust Link are here, which is why the empty state explains the rule
 * rather than inviting an upload.
 *
 * [OQ-22] — receipt is confirmed explicitly rather than inferred from opening.
 */
export default function PropIdOutputsPage() {
  const {
    outputs,
    activeProperties,
    getProperty,
    journey,
    confirmOutputReceipt,
  } = useJourneyStore();

  return (
    <div>
      <RecordHeader
        title="Outputs"
        count={outputs.length > 0 ? `${outputs.length}` : undefined}
        subtitle="Reports and documents sent back by a professional you authorised. They arrive against the property they are about."
      />

      {outputs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Inbox className="size-5" />}
            title="Nothing has come back yet"
            body="When a professional completes work for you, their report lands here and against the property — not buried in your inbox. You'll see what it is, who sent it and when."
          />
        </div>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {outputs.map((output) => {
            const professional = professionalById(output.professionalId);
            const property = getProperty(output.propertyId);
            return (
              <RevealItem key={output.id}>
                <article className="rounded-2xl border border-line-subtle bg-surface-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-error-bg text-error-fg">
                        <FileText aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-h4 text-fg-heading">
                          {output.title}
                        </h2>
                        <p className="text-body-sm text-fg-muted">
                          {output.type} · from{" "}
                          {professional?.name ?? "a professional"} ·{" "}
                          {formatRelative(output.submittedAt)}
                        </p>
                        {property && (
                          <Link
                            href={routes.property(journey.id, property.id)}
                            className="mt-1 inline-block text-body-sm text-fg-link underline-offset-4 hover:underline"
                          >
                            About {property.address}, {property.suburb}
                          </Link>
                        )}
                      </div>
                    </div>
                    {output.receiptConfirmedAt ? (
                      <StatusChip tone="success">Receipt confirmed</StatusChip>
                    ) : (
                      <StatusChip tone="attention">New</StatusChip>
                    )}
                  </div>

                  <p className="measure mt-5 border-t border-line-subtle pt-4 text-body text-fg-secondary">
                    {output.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <p className="flex items-center gap-2 text-caption text-fg-muted">
                      <FileText aria-hidden="true" className="size-3.5" />
                      {output.fileName}
                    </p>
                    {output.receiptConfirmedAt ? (
                      <p className="text-caption text-fg-muted">
                        Confirmed {formatDateTime(output.receiptConfirmedAt)}
                      </p>
                    ) : (
                      /* [OQ-22] — explicit confirmation, not inferred */
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => confirmOutputReceipt(output.id)}
                        className="ml-auto"
                      >
                        <Check aria-hidden="true" className="size-3.5" />
                        I&apos;ve received this
                      </Button>
                    )}
                  </div>

                  <p className="mt-4 text-caption text-fg-muted">
                    File download isn&apos;t wired in this prototype — the record,
                    the routing and the receipt are.
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      {/* Where a report would land — real properties, so it isn't abstract */}
      {activeProperties.length > 0 && (
        <Reveal>
          <section aria-labelledby="await-heading" className="mt-12">
            <h2 id="await-heading" className="text-h4 text-fg-heading">
              Your properties
            </h2>
            <ul className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
              {activeProperties.map((property) => {
                const count = outputs.filter(
                  (o) => o.propertyId === property.id,
                ).length;
                return (
                  <li
                    key={property.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <span className="min-w-0">
                      <span className="block text-body font-medium text-fg-heading">
                        {property.address}
                      </span>
                      <span className="block text-body-sm text-fg-muted">
                        {property.suburb} QLD {property.postcode}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-body-sm text-fg-muted">
                      <FileText aria-hidden="true" className="size-3.5" />
                      {count === 0
                        ? "No documents"
                        : `${count} document${count === 1 ? "" : "s"}`}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-body-sm text-fg-muted">
              We only keep files that come back through a Trust Link you
              authorised. There is no general document storage here, by design.
            </p>
          </section>
        </Reveal>
      )}
    </div>
  );
}
