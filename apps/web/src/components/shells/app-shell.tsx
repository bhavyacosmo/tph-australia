import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shells/dashboard-shell";
import { JourneyStageBar } from "@/components/shells/journey-stage-bar";

/**
 * AppShell — the buyer's authenticated chrome.
 *
 * Superseded, August 2026: this used to own a two-item top nav, a notification
 * bell, an account menu and a mobile tab bar, all of its own. It now delegates
 * to the shared `DashboardShell`, so Home Compass, Prop ID and the Trust Link
 * screens all sit inside the same top nav + persistent sidebar the seller,
 * professional and admin get.
 *
 * That consistency was the explicit direction. It also fixes a real problem:
 * Home Compass and Prop ID previously had different navigation, so a buyer
 * moving between them lost their bearings at the boundary.
 *
 * `showStageBar` survives unchanged, and is still the correct distinction —
 * Home Compass is where you work, Prop ID is where the record lives, and only
 * the working area carries the stage bar (nav §2, §4).
 *
 * Kept as a named export so the eleven screens using it need no edit.
 */
export function AppShell({
  children,
  showStageBar = true,
}: {
  children: ReactNode;
  showStageBar?: boolean;
}) {
  return (
    <DashboardShell
      role="buyer"
      banner={showStageBar ? <JourneyStageBar /> : undefined}
    >
      {children}
    </DashboardShell>
  );
}
