"use client";

import { useState } from "react";

import { EmptyState, SectionHeader } from "@/components/ui/page";
import { useJourneyStore } from "@/lib/store/journey-store";
import { ROLE_LABEL } from "@/lib/mock/accounts";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlatformEvent } from "@/lib/mock/types";

/**
 * The platform activity log.
 *
 * Third person, one line per event, attributed to whoever did it — distinct
 * from the buyer's own diary, which is written in second person and belongs to
 * them. Merging the two would put a user's private phrasing into an operations
 * screen.
 *
 * `ADM-08` again: entries record that something happened, never what was in it.
 * "Craig Mullins submitted a building report" is an event; the report is not.
 */
const KINDS: { key: PlatformEvent["kind"] | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "auth", label: "Sign-ins" },
  { key: "listing", label: "Listings" },
  { key: "interest", label: "Buyer interest" },
  { key: "trustlink", label: "Trust Links" },
  { key: "output", label: "Outputs" },
  { key: "verification", label: "Verification" },
  { key: "account", label: "Accounts" },
];

export default function AdminActivityPage() {
  const { platformEvents } = useJourneyStore();
  const [kind, setKind] = useState<PlatformEvent["kind"] | "all">("all");

  const filtered =
    kind === "all"
      ? platformEvents
      : platformEvents.filter((e) => e.kind === kind);

  return (
    <>
      <SectionHeader
        title="Activity"
        subtitle="What has happened across all four roles, newest first."
        count={`${filtered.length} entries`}
      />

      {/* -------------------------------------------------------- filters */}
      <div className="mt-7 flex flex-wrap gap-2">
        {KINDS.map((option) => {
          const active = kind === option.key;
          const count =
            option.key === "all"
              ? platformEvents.length
              : platformEvents.filter((e) => e.kind === option.key).length;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setKind(option.key)}
              aria-pressed={active}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-full border px-4 text-body-sm",
                "transition-[border-color,background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                active
                  ? "border-action bg-trustlink-wash font-medium text-fg-heading"
                  : "border-line-subtle bg-surface-card text-fg-secondary hover:border-line",
              )}
            >
              {option.label}
              <span className="tabular text-caption text-fg-muted">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Nothing of that kind yet"
          body="Try a different filter, or walk the demo — signing in, publishing a listing and authorising a Trust Link all write here."
        />
      ) : (
        <ul className="mt-8 divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
          {filtered.map((event) => (
            <li key={event.id} className="flex flex-wrap gap-x-5 gap-y-1.5 px-5 py-4">
              <span className="min-w-0 flex-1">
                <span className="block text-body-sm text-fg">{event.what}</span>
                <span className="block text-caption text-fg-muted">
                  {event.actorName}
                  {event.actorRole !== "system" &&
                    ` · ${ROLE_LABEL[event.actorRole]}`}
                </span>
              </span>
              <span
                className="shrink-0 text-caption text-fg-muted"
                title={formatDateTime(event.at)}
              >
                {formatRelative(event.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
