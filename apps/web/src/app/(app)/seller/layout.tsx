import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shells/dashboard-shell";
import { RequireRole } from "@/components/auth/require-role";

/**
 * The seller surface.
 *
 * ⚠️ SCOPE. A seller listing property, and buyers contacting them, is a
 * marketplace — the documented Stage 1 product is buyer-side only and states
 * that TPH does not represent sellers ([C-13], FR-03-03/04). Built on direct
 * client instruction; the unresolved obligations are in the conflict register.
 */
export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="seller">
      <DashboardShell role="seller">{children}</DashboardShell>
    </RequireRole>
  );
}
