import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/require-role";

/**
 * The professional surface. A buyer reaching this must not see another
 * consumer's request queue, so the guard sends them to their own home.
 */
export default function ProLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="professional">{children}</RequireRole>;
}
