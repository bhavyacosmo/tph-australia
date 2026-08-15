"use client";

import { Check, MapPin } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { SectionHeader, RailPanel } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SERVICES, serviceFor } from "@/lib/mock/marketplace";
import { cn } from "@/lib/utils";

/**
 * Services.
 *
 * What this professional is listed for, and therefore which requests can reach
 * them. Read-only, and it says why: the service a professional appears under
 * determines what work they are offered, so changing it is a listing change an
 * admin has to make — not a self-service toggle. That is [C-03]'s position and
 * it survives the self-registration reconciliation unchanged.
 *
 * ⚠️ Stage 1 launches with four services ([SG] p.5). The client named longer
 * lists on the call (electrician, plumber, painter, carpenter, lawyer) and this
 * brief repeats them. Adding a service is not a UI change — it needs its own
 * verification rule, its own output type and its own place in the transaction
 * stages. The extra categories are listed below as "not yet open" rather than
 * shown as if a professional could pick them today.
 */
const NOT_YET_OPEN = [
  "Electrician",
  "Plumber",
  "Painter",
  "Carpenter",
  "Landscaper",
  "Removalist",
];

export default function ProServicesPage() {
  const { myProfessional } = useJourneyStore();

  const mine = myProfessional?.serviceKey;

  return (
    <ProShell>
      <SectionHeader
        title="Services"
        subtitle="What you are listed for, and the areas you cover."
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <ul className="space-y-3">
            {SERVICES.map((service) => {
              const active = service.key === mine;
              return (
                <li
                  key={service.key}
                  className={cn(
                    "rounded-2xl border p-5",
                    active
                      ? "border-action bg-trustlink-wash"
                      : "border-line-subtle bg-surface-card",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-body-lg font-semibold text-fg-heading">
                        {service.label}
                      </h2>
                      <p className="measure mt-1.5 text-body-sm text-fg-secondary">
                        {service.blurb}
                      </p>
                    </div>
                    {active ? (
                      <StatusChip
                        tone="success"
                        icon={<Check aria-hidden="true" className="size-3" />}
                      >
                        You are listed here
                      </StatusChip>
                    ) : (
                      <StatusChip tone="neutral">Not listed</StatusChip>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <section aria-labelledby="not-open" className="mt-12">
            <h2 id="not-open" className="text-h4 text-fg-heading">
              Not open yet
            </h2>
            <p className="measure mt-3 text-body text-fg-secondary">
              These trades have been discussed for The Property Helpline but are
              not part of the first stage. Each one needs its own licence check
              and its own place in the purchase journey before it can accept
              work through a Trust Link.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {NOT_YET_OPEN.map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-dashed border-line px-3 py-1.5 text-body-sm text-fg-muted"
                >
                  {label}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-28">
            <RailPanel title="Your service areas">
              <ul className="space-y-2.5">
                {(myProfessional?.serviceAreas ?? []).map((area) => (
                  <li
                    key={area}
                    className="flex items-center gap-2.5 text-body-sm text-fg-secondary"
                  >
                    <MapPin
                      aria-hidden="true"
                      className="size-4 shrink-0 text-fg-muted"
                    />
                    {area}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-caption text-fg-muted">
                Edit these under Profile.
              </p>
            </RailPanel>

            <RailPanel tone="sunken">
              <p className="text-body-sm text-fg-secondary">
                Requests for{" "}
                <span className="font-medium text-fg-heading">
                  {mine ? serviceFor(mine).label.toLowerCase() : "your service"}
                </span>{" "}
                in these areas are the ones that reach your queue. Changing the
                service you are listed under is a change to your listing — ask
                The Property Helpline.
              </p>
            </RailPanel>
          </div>
        </aside>
      </div>
    </ProShell>
  );
}
