"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clock,
  EyeOff,
  FileText,
  Info,
  Lock,
  Upload,
} from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { PageShell, RailPanel } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { Reveal } from "@/components/motion/reveal";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SCOPE_ITEMS, serviceFor } from "@/lib/mock/marketplace";
import { formatDateTime, formatUntil } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * P04a authorised context + P06 submit output.
 *
 * FR-08-08 — **only consented scope items.** Every value below is resolved
 * through `link.sharedItems`; there is no path that reads the buyer's record
 * directly, so an item the buyer kept private cannot appear here by accident.
 *
 * ⚠️ [OQ-18] — the approved output TYPES are not defined by the client. The three
 * offered are placeholders.
 */

/** ⚠️ Placeholder list — [OQ-18] unresolved. */
const OUTPUT_TYPES = [
  "Building inspection report",
  "Timber pest inspection report",
  "Contract review summary",
  "Written summary",
];

export function ProConnection({ trustLinkId }: { trustLinkId: string }) {
  const reduce = useReducedMotion();
  const { trustLinks, outputs, getProperty, state, submitOutput } =
    useJourneyStore();

  const link = trustLinks.find((t) => t.id === trustLinkId);
  const [type, setType] = useState(OUTPUT_TYPES[0]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!link) {
    return (
      <ProShell>
        <PageShell className="max-w-2xl">
          <h1 className="text-h1 text-fg-heading">
            That connection isn&apos;t here
          </h1>
          <ButtonLink href={routes.pro()} variant="primary" className="mt-8">
            Back to your work
          </ButtonLink>
        </PageShell>
      </ProShell>
    );
  }

  const service = serviceFor(link.serviceKey);
  const property = getProperty(link.propertyId);
  const output = outputs.find((o) => o.trustLinkId === link.id);
  const revoked = link.status === "revoked";

  /* FR-08-08 — resolved from the consented scope, never from the record */
  const can = (id: string) => link.sharedItems.includes(id);

  const submit = () => {
    if (title.trim().length === 0) {
      setError("Give the report a title so the buyer knows what it is.");
      return;
    }
    submitOutput({
      trustLinkId: link.id,
      type,
      title: title.trim(),
      summary: summary.trim() || "No summary provided.",
      fileName: `${title.trim().toLowerCase().replace(/\s+/g, "-")}.pdf`,
    });
  };

  return (
    <ProShell>
      {/* Permission expiry, persistent — nav §7 */}
      <div
        className={cn(
          "border-b",
          revoked
            ? "border-error-line bg-error-bg"
            : "border-attention-line bg-attention-bg",
        )}
      >
        <div className="mx-auto flex max-w-(--container-content) flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 md:px-8">
          <p className="flex items-center gap-2 text-body-sm text-fg-secondary">
            {revoked ? (
              <>
                <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                The buyer withdrew this Trust Link. Your access has ended.
              </>
            ) : (
              <>
                <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                Access expires{" "}
                {link.expiresAt ? formatUntil(link.expiresAt) : "when withdrawn"}
                {link.expiresAt && ` · ${formatDateTime(link.expiresAt)}`}
              </>
            )}
          </p>
        </div>
      </div>

      <PageShell>
        <Link
          href={routes.pro()}
          className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Your work
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-overline uppercase text-fg-muted">
              {service.label}
            </p>
            <h1 className="mt-3 text-h1 text-fg-heading">
              {can("address") && property
                ? property.address
                : "Property (address not shared)"}
            </h1>
            {can("address") && property && (
              <p className="mt-2 text-body-lg text-fg-secondary">
                {property.suburb} QLD {property.postcode}
              </p>
            )}
          </div>
          <StatusChip tone={revoked ? "neutral" : "success"}>
            {revoked ? "Access ended" : output ? "Output submitted" : "Active"}
          </StatusChip>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* --------------------------------------------------------- main */}
          <div className="min-w-0 lg:col-span-8">
            {/* what you were given — FR-08-08 */}
            <section aria-labelledby="context-heading">
              <h2 id="context-heading" className="text-h3 text-fg-heading">
                What the buyer shared
              </h2>
              <p className="measure mt-2 text-body-sm text-fg-muted">
                This is the whole of it. Anything not listed was kept private and
                is not available to you.
              </p>

              <dl className="mt-6 divide-y divide-line-subtle border-y border-line-subtle">
                {can("first_name") && (
                  <Row label="Their first name" value={state.user.firstName} />
                )}
                {can("address") && property && (
                  <Row
                    label="Property"
                    value={`${property.address}, ${property.suburb} QLD ${property.postcode}`}
                  />
                )}
                {can("attributes") && property && (
                  <Row
                    label="Property details"
                    value={`${property.beds ?? "—"} bed · ${property.baths ?? "—"} bath · ${property.cars ?? "—"} car · ${property.propertyType}`}
                  />
                )}
                {can("notes") && property && (
                  <Row
                    label="Their notes"
                    value={property.note || "No note recorded."}
                    italic
                  />
                )}
                {can("readiness") && (
                  <Row
                    label="Readiness summary"
                    value="Area states only — individual answers are never shared."
                  />
                )}
                {can("timing") && (
                  <Row label="Their timing" value="3 to 6 months" />
                )}
                {can("phone") && (
                  <Row label="Phone" value={state.user.phone ?? "Not held"} />
                )}
                {can("email") && <Row label="Email" value={state.user.email} />}
                <Row label="Purpose" value={link.purpose} />
              </dl>

              {/* Absence made explicit */}
              {SCOPE_ITEMS.some((i) => !can(i.id)) && (
                <div className="mt-6 rounded-xl border border-line-subtle bg-surface-sunken p-5">
                  <p className="flex items-center gap-2 text-body-sm font-medium text-fg-heading">
                    <EyeOff aria-hidden="true" className="size-4 text-fg-muted" />
                    Kept private by the buyer
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {SCOPE_ITEMS.filter((i) => !can(i.id)).map((i) => (
                      <li
                        key={i.id}
                        className="rounded-full border border-line-subtle px-3 py-1 text-caption text-fg-muted"
                      >
                        {i.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* ------------------------------------------------ P06 output */}
            <section aria-labelledby="submit-heading" className="mt-14">
              <h2 id="submit-heading" className="text-h3 text-fg-heading">
                {output ? "Your submitted work" : "Submit your work"}
              </h2>

              {output ? (
                <Reveal>
                  <div className="mt-5 rounded-2xl border border-line-subtle bg-surface-card p-6">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success-bg text-success-fg">
                        <Check aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-h4 text-fg-heading">{output.title}</p>
                        <p className="text-body-sm text-fg-muted">
                          {output.type} · sent {formatDateTime(output.submittedAt)}
                        </p>
                        <p className="measure mt-3 text-body-sm text-fg-secondary">
                          {output.summary}
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-caption text-fg-muted">
                          <FileText aria-hidden="true" className="size-3.5" />
                          {output.fileName}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 border-t border-line-subtle pt-4 text-body-sm text-fg-secondary">
                      It has landed against the property in the buyer&apos;s own
                      record, and their progress has moved on.
                    </p>
                  </div>
                </Reveal>
              ) : revoked ? (
                <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-10 text-center text-body-sm text-fg-muted">
                  You can&apos;t submit work on a withdrawn connection.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="mt-6 space-y-5 rounded-2xl border border-line-subtle bg-surface-card p-6"
                >
                  <Field
                    label="Type"
                    hint="⚠️ Prototype list — the approved output types are not yet defined by the client."
                  >
                    {({ id, describedBy }) => (
                      <Select
                        id={id}
                        aria-describedby={describedBy}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        {OUTPUT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>

                  <Field label="Title">
                    {({ id, invalid }) => (
                      <Input
                        id={id}
                        value={title}
                        aria-invalid={invalid || undefined}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Pre-purchase building inspection — 12 Green Street"
                      />
                    )}
                  </Field>

                  <Field
                    label="Summary for the buyer"
                    optional
                    hint="A plain-language headline of what you found."
                  >
                    {({ id, describedBy }) => (
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="No major structural concerns. Cracked render at the rear needs attention within 12 months."
                      />
                    )}
                  </Field>

                  <div className="rounded-xl border border-dashed border-line px-4 py-5 text-center">
                    <Upload
                      aria-hidden="true"
                      className="mx-auto size-5 text-fg-muted"
                    />
                    <p className="mt-2 text-body-sm text-fg-muted">
                      File upload isn&apos;t wired in this prototype. A filename
                      is generated from the title so the flow can be shown
                      end to end.
                    </p>
                  </div>

                  {error && (
                    <p role="alert" className="text-body-sm text-danger-fg">
                      {error}
                    </p>
                  )}

                  <Button type="submit" variant="primary" size="lg">
                    Submit to the buyer
                  </Button>
                </form>
              )}
            </section>
          </div>

          {/* --------------------------------------------------------- rail */}
          <div className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-24">
              <RailPanel title="This connection">
                <dl className="space-y-2.5 text-body-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-muted">Service</dt>
                    <dd className="text-right text-fg">{service.label}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-muted">Authorised</dt>
                    <dd className="text-right text-fg">
                      {link.authorizedAt
                        ? formatDateTime(link.authorizedAt)
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-muted">Period</dt>
                    <dd className="text-right text-fg">{link.expiryDays} days</dd>
                  </div>
                </dl>
              </RailPanel>

              <RailPanel tone="wash">
                <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                  <Lock
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                  <span>
                    Every time you open this, the access check runs again. When
                    the period ends, or if the buyer withdraws, this page stops
                    showing their information.
                  </span>
                </p>
              </RailPanel>

              <p className="flex items-start gap-2.5 text-caption text-fg-muted">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                Messaging and two-way document sharing are not built in this
                prototype — both need a scope decision.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    </ProShell>
  );
}

function Row({
  label,
  value,
  italic = false,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="text-body-sm text-fg-muted">{label}</dt>
      <dd
        className={cn("text-body-sm text-fg", italic && "italic text-fg-secondary")}
      >
        {value}
      </dd>
    </div>
  );
}
