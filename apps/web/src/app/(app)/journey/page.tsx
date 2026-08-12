import { redirect } from "next/navigation";

import { SEED_JOURNEY } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";

/**
 * FR-05-10 — after sign-in the system MUST show the most recently active
 * journey. With one seeded journey that resolves to a redirect; with several it
 * would sort by `lastSavedAt`.
 */
export default function JourneyIndex() {
  redirect(routes.journey(SEED_JOURNEY.id));
}
