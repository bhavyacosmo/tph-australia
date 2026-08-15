import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shells/dashboard-shell";
import { RequireRole } from "@/components/auth/require-role";

/**
 * Admin.
 *
 * In production every route here also requires MFA (NFR-1.8), which this
 * prototype does not implement — see src/lib/mock/accounts.ts.
 *
 * `ADM-08` governs everything inside: admin sees professionals, listings and
 * Trust Link STATE. There is deliberately no route from here to a buyer's
 * notes, readiness answers or a returned report.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="admin">
      <DashboardShell role="admin">{children}</DashboardShell>
    </RequireRole>
  );
}
