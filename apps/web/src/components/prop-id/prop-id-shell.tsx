import type { ReactNode } from "react";

import { SectionHeader } from "@/components/ui/page";

/**
 * Superseded, August 2026.
 *
 * The sidebar this file used to own became `DashboardShell`, so all four roles
 * share one shell instead of Prop ID being the only surface with the pattern.
 * The section list moved to `lib/nav.ts` (the buyer sidebar), where it gained
 * Home Compass and lost nothing.
 *
 * Both exports are kept so nothing changes at the call site — every Prop ID
 * page already imports `RecordHeader` from here.
 */
export function PropIdShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** The record sub-page header. Now the shared one, under its original name. */
export function RecordHeader(props: {
  title: string;
  subtitle: string;
  count?: string;
  actions?: ReactNode;
}) {
  return <SectionHeader {...props} />;
}
