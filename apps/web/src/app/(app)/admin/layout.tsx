import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/require-role";

/**
 * Admin. In production this also requires MFA on every route (NFR-1.8), which
 * this prototype does not implement — see src/lib/mock/accounts.ts.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
