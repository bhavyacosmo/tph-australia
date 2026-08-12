"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Pencil } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { RecordHeader } from "@/components/prop-id/prop-id-shell";
import { useJourneyStore } from "@/lib/store/journey-store";
import { BUYING_STAGE_LABEL, TIMING_LABEL } from "@/lib/mock/seed";
import { formatDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * S17 — Prop ID journeys.
 *
 * FR-05-03 — the buyer journey stores goal, timing, stage, progress and last
 * activity, and the user can **create, resume, rename and archive** it.
 *
 * Rename is implemented for real, because a user running two searches needs to
 * tell them apart. Create and archive are single-journey no-ops in this
 * prototype and are therefore not offered as controls — an inert "New journey"
 * button would be exactly the dead control `ENT-01` forbids.
 */
export default function PropIdJourneysPage() {
  const { state, journey, milestones, updateJourney, activeProperties } =
    useJourneyStore();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(journey.name);

  const completed = milestones.filter((m) => m.state === "done").length;

  const save = () => {
    updateJourney({ name: draft.trim() || journey.name });
    setEditing(false);
  };

  return (
    <div>
      <RecordHeader
        title="Journeys"
        count={`${state.journeys.length}`}
        subtitle="A journey is one search. Everything you save — properties, comparisons, readiness — belongs to one."
      />

      <RevealGroup className="mt-8 space-y-4" stagger={0.05}>
        {state.journeys.map((j) => (
          <RevealItem key={j.id}>
            <article className="rounded-2xl border border-line-subtle bg-surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  {editing && j.id === journey.id ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <label htmlFor="journey-name" className="sr-only">
                        Journey name
                      </label>
                      <Input
                        id="journey-name"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-auto min-w-64"
                        autoFocus
                      />
                      <Button variant="primary" onClick={save}>
                        <Check aria-hidden="true" className="size-4" />
                        Save
                      </Button>
                      <Button
                        variant="tertiary"
                        onClick={() => {
                          setDraft(journey.name);
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-h3 text-fg-heading">{j.name}</h2>
                      {/* FR-05-03 — rename */}
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Rename
                      </Button>
                    </div>
                  )}
                  <p className="mt-2 text-body-sm text-fg-muted">
                    Started {formatDate(j.createdAt)} · last activity{" "}
                    {formatRelative(j.lastSavedAt)}
                  </p>
                </div>
                <StatusChip tone={j.archived ? "neutral" : "success"}>
                  {j.archived ? "Archived" : "Active"}
                </StatusChip>
              </div>

              <dl className="mt-6 grid gap-5 border-t border-line-subtle pt-5 sm:grid-cols-4">
                <div>
                  <dt className="text-caption uppercase tracking-wider text-fg-muted">
                    Stage
                  </dt>
                  <dd className="mt-1 text-body-sm text-fg">
                    {j.stage ? BUYING_STAGE_LABEL[j.stage] : "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption uppercase tracking-wider text-fg-muted">
                    Timing
                  </dt>
                  <dd className="mt-1 text-body-sm text-fg">
                    {j.timing ? TIMING_LABEL[j.timing] : "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption uppercase tracking-wider text-fg-muted">
                    Area
                  </dt>
                  <dd className="mt-1 text-body-sm text-fg">
                    {j.targetArea || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption uppercase tracking-wider text-fg-muted">
                    Progress
                  </dt>
                  <dd className="tabular mt-1 text-body-sm text-fg">
                    {completed} of {milestones.length} · {activeProperties.length}{" "}
                    saved
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {/* FR-05-12 — resume from the last saved state */}
                <ButtonLink href={routes.journey(j.id)} variant="secondary">
                  Resume this journey
                  <ArrowRight aria-hidden="true" className="size-4" />
                </ButtonLink>
                <Link
                  href={routes.journeySetup(j.id)}
                  className="flex min-h-11 items-center text-body-sm text-fg-link underline-offset-4 hover:underline"
                >
                  Change your answers
                </Link>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-8 text-body-sm text-fg-muted">
        Running a second search — an investment as well as a home — is supported
        by the data model but not wired up in this prototype.
      </p>
    </div>
  );
}
