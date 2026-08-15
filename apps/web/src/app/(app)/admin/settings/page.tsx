"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { SectionHeader, RailPanel } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { useJourneyStore } from "@/lib/store/journey-store";
import { CRITERIA_VERSION } from "@/lib/mock/seed";
import { FORMULA_VERSION, QUESTION_VERSION } from "@/lib/mock/readiness";
import { SERVICES } from "@/lib/mock/marketplace";
import { SHORTLIST_LIMIT } from "@/lib/mock/seed";

/**
 * Settings.
 *
 * There is no configuration service behind this prototype, so rather than a
 * page of switches that save nowhere, this shows the constants the product
 * actually runs on and where each one lives. It is the honest version of a
 * settings screen at this stage — and it is genuinely useful, because three of
 * these values are marked *draft* and the client still has to confirm them.
 *
 * The one real control is the demo reset, which is a prototype affordance and
 * is labelled as one.
 */
export default function AdminSettingsPage() {
  const router = useRouter();
  const { resetDemo, users, listings, trustLinks } = useJourneyStore();

  const CONFIG = [
    {
      label: "Services offered",
      value: SERVICES.map((s) => s.label).join(", "),
      note: "Stage 1 launches with four ([SG] p.5). Adding a trade needs its own verification rule and output type.",
      source: "src/lib/mock/marketplace.ts",
    },
    {
      label: "Shortlist limit",
      value: `${SHORTLIST_LIMIT} properties`,
      note: "FR-03-06/07 — exceeding it must produce a clear message, not a silent failure.",
      source: "src/lib/mock/seed.ts",
    },
    {
      label: "Comparison criteria version",
      value: CRITERIA_VERSION,
      note: "Saved comparisons record the version they used (FR-03-23), so a later change cannot rewrite history.",
      source: "src/lib/mock/seed.ts",
    },
    {
      label: "Readiness questions",
      value: QUESTION_VERSION,
      note: "⚠️ Draft. The client has not supplied the question set — OQ-21.",
      source: "src/lib/mock/readiness.ts",
      draft: true,
    },
    {
      label: "Readiness formula",
      value: FORMULA_VERSION,
      note: "⚠️ Draft. Thresholds and weighting are assumed (A-32). Bands are shown as words, never a number (A-33).",
      source: "src/lib/mock/readiness.ts",
      draft: true,
    },
    {
      label: "Transaction stages",
      value: "Agent → Finance → Building & Pest → Conveyancer → Settlement",
      note: "⚠️ Provisional. The client said he would supply the final list; the UI marks them as provisional.",
      source: "src/lib/mock/marketplace.ts",
      draft: true,
    },
  ];

  return (
    <>
      <SectionHeader
        title="Settings"
        subtitle="What the platform is currently configured with, and which of it is still a draft."
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <dl className="divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
            {CONFIG.map((item) => (
              <div key={item.label} className="px-5 py-4">
                <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-body-sm font-semibold text-fg-heading">
                    {item.label}
                  </span>
                  {item.draft && (
                    <span className="rounded-full bg-attention-bg px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-attention-fg">
                      Draft
                    </span>
                  )}
                </dt>
                <dd className="mt-1.5 text-body-sm text-fg">{item.value}</dd>
                <dd className="mt-1.5 text-caption text-fg-muted">{item.note}</dd>
                <dd className="mt-1 text-caption text-fg-muted">
                  <code>{item.source}</code>
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-body-sm text-fg-muted">
            These are constants in the codebase, not editable configuration —
            there is no settings service behind this prototype. A page of
            switches that saved nowhere would be worse than this list.
          </p>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-28">
            <RailPanel title="This session">
              <dl className="space-y-3 text-body-sm">
                {[
                  ["Accounts", users.length],
                  ["Listings", listings.length],
                  ["Trust Links", trustLinks.length],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-fg-muted">{label}</dt>
                    <dd className="tabular font-medium text-fg-heading">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </RailPanel>

            <RailPanel>
              <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-attention-fg"
                />
                <span>
                  <span className="block font-medium text-fg-heading">
                    Reset the demonstration
                  </span>
                  Clears everything created in this browser — listings a seller
                  published, enquiries, Trust Links, verifications — and returns
                  the prototype to its seeded state. It also signs you out.
                </span>
              </p>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="mt-4"
                onClick={() => {
                  resetDemo();
                  router.push("/sign-in");
                }}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Reset all demo data
              </Button>
            </RailPanel>
          </div>
        </aside>
      </div>
    </>
  );
}
