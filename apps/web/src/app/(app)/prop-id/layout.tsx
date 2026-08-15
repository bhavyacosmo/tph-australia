import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shells/dashboard-shell";
import { RequireRole } from "@/components/auth/require-role";

/**
 * Prop ID is the buyer's dashboard.
 *
 * It now uses the shared `DashboardShell` — the same top nav + persistent
 * sidebar every role gets — rather than its own one-off sidebar. The journey
 * stage bar is still absent here: Prop ID is the record, not the working area
 * (nav §2, §4).
 */
export default function PropIdLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="buyer">
      <DashboardShell role="buyer">{children}</DashboardShell>
    </RequireRole>
  );
}
