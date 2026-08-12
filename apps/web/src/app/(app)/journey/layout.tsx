import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/require-role";

/** Home Compass is the buyer's working area. */
export default function JourneyLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="buyer">{children}</RequireRole>;
}
