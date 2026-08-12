import type { ReactNode } from "react";

import { HydrationGate } from "@/lib/store/journey-store";

/**
 * The authenticated area.
 *
 * There is no authentication in this prototype. The store itself now lives at
 * the root layout, because the public pages write to it too — what this group
 * adds is the hydration gate, so a screen showing counts, saved properties or
 * Trust Link state never paints stale seed data and then corrects itself.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <HydrationGate>{children}</HydrationGate>;
}
