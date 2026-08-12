"use client";

import Link from "next/link";
import { ArrowRight, FileText, Inbox, Lock, ShieldCheck } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { professionalById, serviceFor } from "@/lib/mock/marketplace";
import { formatDateTime, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * Documents — PM wireframe §4 and §8 both list "Documents".
 *
 * ⚠️ CONFLICT, RESOLVED BY SCOPE RATHER THAN BY CHOICE.
 *   FR-05-14: the system MUST NOT provide a general document vault or folder
 *             hierarchy.
 *   FR-05-16: only files required for the approved Stage 1 professional-output
 *             loop may be stored.
 *   Transcript L647-669: the client wants document sharing from Prop ID to an
 *             individual professional — and said of it, *"That's too much for now
 *             for the first stage."*
 *
 * So "Documents" here means exactly one thing: files that came back through a
 * Trust Link the buyer authorised, grouped by the property they are about. There
 * is no upload, no folders, and the page says why.
 */
export default function PropIdDocumentsPage() {
  const { outputs, activeProperties, journey, getProperty, trustLinks } =
    useJourneyStore();

  return (
    <div>
      <RecordHeader
        title="Documents"
        count={outputs.length > 0 ? `${outputs.length}` : undefined}
        subtitle="Files a professional you authorised has sent back, filed against the property they are about."
      />

      {/* The boundary, stated first — it is the reason this page looks small */}
      <p className="mt-6 flex items-start gap-3 rounded-xl border border-line-subtle bg-surface-sunken px-4 py-3 text-body-sm text-fg-secondary">
        <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-muted" />
        <span>
          <span className="font-medium text-fg-heading">
            This is not a document vault.
          </span>{" "}
          There is no upload here, and no folders. We keep only what comes back
          through a Trust Link, because storing your paperwork indefinitely is a
          promise we are not making.
        </span>
      </p>

      {outputs.length === 0 ? (
        <Reveal>
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-surface-sunken text-fg-muted">
              <Inbox aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-5 text-h3 text-fg-heading">Nothing filed yet</h2>
            <p className="measure mx-auto mt-3 text-body text-fg-secondary">
              When an inspector or conveyancer completes work for you, their report
              lands here and against the property — not buried in your inbox.
            </p>
            {trustLinks.length === 0 && (
              <div className="mt-7">
                <ButtonLink href={routes.professionals()} variant="primary">
                  Find a professional
                </ButtonLink>
              </div>
            )}
          </div>
        </Reveal>
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {outputs.map((output) => {
            const professional = professionalById(output.professionalId);
            const property = getProperty(output.propertyId);
            const link = trustLinks.find((t) => t.id === output.trustLinkId);
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
                          {output.type} · {professional?.name ?? "a professional"}{" "}
                          · {formatRelative(output.submittedAt)}
                        </p>
                        {property && (
                          <Link
                            href={routes.property(journey.id, property.id)}
                            className="mt-1 inline-block text-body-sm text-fg-link underline-offset-4 hover:underline"
                          >
                            {property.address}, {property.suburb}
                          </Link>
                        )}
                      </div>
                    </div>
                    <StatusChip
                      tone={output.receiptConfirmedAt ? "success" : "attention"}
                    >
                      {output.receiptConfirmedAt ? "Receipt confirmed" : "New"}
                    </StatusChip>
                  </div>

                  <dl className="mt-5 grid gap-x-8 gap-y-2 border-t border-line-subtle pt-4 text-body-sm sm:grid-cols-2">
                    <div className="flex justify-between gap-3">
                      <dt className="text-fg-muted">File</dt>
                      <dd className="truncate text-fg">{output.fileName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-fg-muted">Received</dt>
                      <dd className="text-fg">
                        {formatDateTime(output.submittedAt)}
                      </dd>
                    </div>
                    {link && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-fg-muted">Came through</dt>
                        <dd className="text-right text-fg">
                          {serviceFor(link.serviceKey).label} Trust Link
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink
                      href={routes.propIdOutputs()}
                      variant="secondary"
                      size="sm"
                    >
                      Open in Outputs
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </ButtonLink>
                    {link && (
                      <ButtonLink
                        href={routes.trustLink(link.id)}
                        variant="tertiary"
                        size="sm"
                      >
                        See the connection
                      </ButtonLink>
                    )}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      {/* By-property view, so the filing is visible even when empty */}
      {activeProperties.length > 0 && (
        <section aria-labelledby="by-property" className="mt-14">
          <h2 id="by-property" className="text-h4 text-fg-heading">
            By property
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
                  <Link
                    href={routes.property(journey.id, property.id)}
                    className="min-w-0 underline-offset-4 hover:underline"
                  >
                    <span className="block text-body font-medium text-fg-heading">
                      {property.address}
                    </span>
                    <span className="block text-body-sm text-fg-muted">
                      {property.suburb} QLD {property.postcode}
                    </span>
                  </Link>
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
        </section>
      )}

      {/* Transcript L647-669 — sharing OUT, which the client deferred */}
      <p className="mt-10 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          Sending one of your own documents out to a professional was discussed and
          set aside for a later stage. When it exists it will work the same way as
          everything else here — one professional, one purpose, your choice.
        </span>
      </p>
    </div>
  );
}
