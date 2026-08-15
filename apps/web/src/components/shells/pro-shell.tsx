import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shells/dashboard-shell";

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
 * Kept as a named export so the existing professional pages need no edit.
 */
export function ProShell({ children }: { children: ReactNode }) {
  return <DashboardShell role="professional">{children}</DashboardShell>;
}
