"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useJourneyStore } from "@/lib/store/journey-store";
import { HOME_FOR } from "@/lib/mock/accounts";
import type { Role } from "@/lib/mock/types";

/**
 * ⚠️ A UI GUARD, NOT A SECURITY BOUNDARY.
 *
 * This shapes which experience the prototype shows. It runs in the browser, so
 * it protects nothing — anyone can edit localStorage. Real route protection has
 * to happen on the server against a real session before production. See
 * src/lib/mock/accounts.ts.
 *
 * Behaviour:
 *   · signed out             → /sign-in, remembering where they were headed
 *   · signed in, wrong role  → their own home, rather than a dead end
 *   · signed in, no profile  → /welcome, to complete it first
 *
 * Redirecting rather than rendering an error is deliberate: in the demo, landing
 * on "you don't have access" reads as a broken prototype, whereas arriving at
 * your own dashboard reads as the product working.
 */
export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, needsOnboarding } = useJourneyStore();

  /*
    Onboarding is part of the gate, not a separate one. A seller who has not
    said who they are has no name to put on a listing, and a professional who
    has not submitted a profile has nothing for an admin to approve — so
    neither can use the surface behind this until they have.
  */
  const allowed = session?.role === role && !needsOnboarding;

  useEffect(() => {
    if (allowed) return;

    if (!session) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (needsOnboarding) {
      router.replace("/welcome");
      return;
    }
    router.replace(HOME_FOR[session.role]);
  }, [allowed, session, needsOnboarding, pathname, router]);

  if (!allowed) {
    /* A brief hold while the redirect runs. The store is already hydrated by
       the time this renders — the (app) layout gates on that — so this is only
       ever on screen for a frame or two. */
    return (
      <div className="grid min-h-dvh place-items-center bg-surface-page">
        <p className="sr-only" role="status">
          Checking your access
        </p>
        <span
          aria-hidden="true"
          className="size-6 animate-spin rounded-full border-2 border-line border-t-action"
        />
      </div>
    );
  }

  return <>{children}</>;
}
