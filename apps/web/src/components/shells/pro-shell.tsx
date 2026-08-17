"use client";

import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shells/dashboard-shell";
import { PendingVerification } from "@/components/pro/pending-verification";
import { useJourneyStore } from "@/lib/store/journey-store";

/**
 * The professional surface.
 *
 * Superseded, August 2026: this used to own a bespoke top-nav-only chrome with
 * three queues. It now delegates to the shared `DashboardShell`, so the
 * professional gets the same top nav + persistent sidebar as every other role.
 *
 * What survives from the old shell is the thing that mattered about it — the
 * navy header. A professional must never be able to mistake which surface they
 * are on (docs/03-experience/05-navigation-structure.md §7), so `DashboardShell`
 * keeps the dark bar for this role and for admin.
 *
 * ── The verification gate ────────────────────────────────────────────────────
 * It also holds the gate, for every professional route at once. Until an admin
 * approves the application, the queues behind this are not merely empty — they
 * are unreachable by design, because the professional is not in the directory
 * and no buyer can select them. Rendering the queues anyway would imply work
 * could arrive. Putting the gate in the shell rather than on each page means a
 * new professional route cannot forget it.
 */
export function ProShell({ children }: { children: ReactNode }) {
  const { myApplication } = useJourneyStore();

  const awaiting =
    myApplication !== undefined && myApplication.status !== "verified";

  return (
    <DashboardShell role="professional">
      {awaiting ? (
        <PendingVerification application={myApplication} />
      ) : (
        children
      )}
    </DashboardShell>
  );
}
