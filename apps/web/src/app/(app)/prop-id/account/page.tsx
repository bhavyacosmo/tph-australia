"use client";

import { useRouter } from "next/navigation";
import { Info, Lock, LogOut, Phone, RotateCcw, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { ROLE_LABEL } from "@/lib/mock/accounts";
import { BUYING_STAGE_LABEL, TIMING_LABEL } from "@/lib/mock/seed";
import { formatDate, formatPrice } from "@/lib/format";

/**
 * S08 — Account. The "Profile/account" the PM wireframe §8 asks for.
 *
 * FR-05-01 — name, verified email, optional phone, preferences, acceptance.
 * FR-05-02 — **the phone number is private unless a Trust Link shares it**, and
 *            that is stated on the field rather than assumed.
 *
 * Nothing here is editable in the prototype: changing an email means verifying
 * it (S04) and changing a password means real authentication, neither of which
 * exists. Read-only with an honest note beats a form that silently does nothing.
 */
export default function PropIdAccountPage() {
  const router = useRouter();
  const { state, session, journey, signOut, resetDemo, displayName } =
    useJourneyStore();

  return (
    <div>
      <RecordHeader
        title="Account"
        subtitle="Who you are on the platform, and what stays private."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* --------------------------------------------------------- you */}
        <Reveal>
          <section
            aria-labelledby="you-heading"
            className="rounded-2xl border border-line-subtle bg-surface-card p-6"
          >
            <h2 id="you-heading" className="text-h4 text-fg-heading">
              Your details
            </h2>
            <dl className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
              <Row label="Name" value={displayName} />
              <Row
                label="Email"
                value={state.user.email || "Not recorded in this prototype"}
                chip={state.user.emailVerified ? "Verified" : undefined}
              />
              <Row
                label="Phone"
                value={session?.phone ?? state.user.phone ?? "Not recorded"}
                privateNote
              />
              <Row
                label="Signed in as"
                value={session ? ROLE_LABEL[session.role] : "—"}
              />
            </dl>

            {/* FR-05-02, made visible */}
            <p className="mt-5 flex items-start gap-3 rounded-xl bg-trustlink-wash p-4 text-body-sm text-fg-secondary">
              <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-action" />
              <span>
                Your phone number is private. It is only ever visible to a
                professional if you switch it on in a Trust Link — and you can
                withdraw that at any time.
              </span>
            </p>
          </section>
        </Reveal>

        {/* ------------------------------------------------------- journey */}
        <Reveal>
          <section
            aria-labelledby="journey-heading"
            className="rounded-2xl border border-line-subtle bg-surface-card p-6"
          >
            <h2 id="journey-heading" className="text-h4 text-fg-heading">
              Your search settings
            </h2>
            <dl className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
              <Row label="Journey" value={journey.name} />
              <Row
                label="Where you're up to"
                value={journey.stage ? BUYING_STAGE_LABEL[journey.stage] : "Not set"}
              />
              <Row label="Area" value={journey.targetArea || "Not set"} />
              <Row
                label="Timing"
                value={journey.timing ? TIMING_LABEL[journey.timing] : "Not set"}
              />
              <Row
                label="Budget"
                value={
                  journey.budget.max
                    ? `Up to ${formatPrice(journey.budget.max)}`
                    : "Not set"
                }
              />
              <Row
                label="Looking for"
                value={
                  journey.requirements.propertyTypes.length > 0
                    ? journey.requirements.propertyTypes.join(", ")
                    : "Not set"
                }
              />
              <Row label="Started" value={formatDate(journey.createdAt)} />
            </dl>
          </section>
        </Reveal>
      </div>

      {/* --------------------------------------------------------- controls */}
      <section aria-labelledby="controls-heading" className="mt-10">
        <h2 id="controls-heading" className="text-h4 text-fg-heading">
          Session
        </h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              signOut();
              router.push("/sign-in");
            }}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </Button>
          <Button variant="tertiary" onClick={resetDemo}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset demo data
          </Button>
        </div>
      </section>

      <p className="mt-10 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          These details are read-only in the prototype. Changing an email requires
          verifying it, and changing a password requires real authentication —
          neither is built, so we show the fields rather than a form that would do
          nothing. Data access, export and deletion requests are a launch
          requirement and are not implemented here.
        </span>
      </p>

      <p className="mt-4 flex items-start gap-3 text-body-sm text-fg-muted">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          Signing out keeps your journey. Everything you have saved is still here
          when you come back.
        </span>
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  chip,
  privateNote = false,
}: {
  label: string;
  value: string;
  chip?: string;
  privateNote?: boolean;
}) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="flex items-center gap-1.5 text-body-sm text-fg-muted">
        {privateNote && <Phone aria-hidden="true" className="size-3.5" />}
        {label}
      </dt>
      <dd className="flex flex-wrap items-center gap-2 text-body-sm text-fg">
        {value}
        {chip && <StatusChip tone="success">{chip}</StatusChip>}
        {privateNote && <StatusChip tone="neutral">Private</StatusChip>}
      </dd>
    </div>
  );
}
