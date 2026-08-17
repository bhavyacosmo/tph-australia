"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { BuyerOnboarding } from "@/components/onboarding/buyer-onboarding";
import { SellerOnboarding } from "@/components/onboarding/seller-onboarding";
import { ProfessionalOnboarding } from "@/components/onboarding/professional-onboarding";
import { HydrationGate, useJourneyStore } from "@/lib/store/journey-store";
import { HOME_FOR } from "@/lib/mock/accounts";

/**
 * Routes the signed-in person to the right first-run form.
 *
 * Role comes from the SESSION, never from the URL, so there is no way to land
 * on the wrong form by editing an address. Anyone who does not belong here —
 * signed out, already onboarded, or an admin, who never onboards — is sent
 * where they should be instead.
 */
export function Welcome() {
  return (
    <HydrationGate>
      <WelcomeInner />
    </HydrationGate>
  );
}

function WelcomeInner() {
  const router = useRouter();
  const { session, needsOnboarding } = useJourneyStore();

  const misplaced = !session || !needsOnboarding;

  useEffect(() => {
    if (!misplaced) return;
    router.replace(session ? HOME_FOR[session.role] : "/sign-in");
  }, [misplaced, session, router]);

  if (misplaced) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface-page">
        <p className="sr-only" role="status">
          Taking you to your dashboard
        </p>
        <span
          aria-hidden="true"
          className="size-6 animate-spin rounded-full border-2 border-line border-t-action"
        />
      </div>
    );
  }

  if (session.role === "seller") return <SellerOnboarding />;
  if (session.role === "professional") return <ProfessionalOnboarding />;
  return <BuyerOnboarding />;
}
