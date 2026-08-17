import { Welcome } from "@/components/onboarding/welcome";

export const metadata = { title: "Complete your profile" };

/**
 * First-run profile completion.
 *
 * Deliberately OUTSIDE the `(app)` group and outside `RequireRole`: those
 * redirect an un-onboarded person here, so putting this behind the same guard
 * would loop. It has its own, simpler gate — a session, and nothing else.
 */
export default function WelcomePage() {
  return <Welcome />;
}
