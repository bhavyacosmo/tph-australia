import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/require-role";

/** Creating and reading a Trust Link is the buyer's side of the connection. */
export default function TrustLinkLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="buyer">{children}</RequireRole>;
}
