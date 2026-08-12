import type { ReactNode } from "react";

import { AppShell } from "@/components/shells/app-shell";
import { PropIdShell } from "@/components/prop-id/prop-id-shell";
import { RequireRole } from "@/components/auth/require-role";

/**
 * Prop ID is the record, not the working area — so it carries its own sidebar
 * and does NOT show the journey stage bar (nav §2, §4).
 *
 * It is the buyer's private record, so it is behind the buyer guard.
 */
export default function PropIdLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="buyer">
      <AppShell showStageBar={false}>
        <PropIdShell>{children}</PropIdShell>
      </AppShell>
    </RequireRole>
  );
}
