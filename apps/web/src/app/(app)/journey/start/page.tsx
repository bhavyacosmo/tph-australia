import { redirect } from "next/navigation";

import { SEED_JOURNEY } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";

/**
 * "Start buyer journey" — the public CTA's destination (FR-01-02).
 *
 * A stable entry point the marketing pages can link to without knowing a journey
 * id. In production this creates the journey for the session and redirects into
 * its setup; here it resolves to the seeded journey.
 *
 * Static segments resolve before dynamic ones, so this never collides with
 * `/journey/[journeyId]`.
 */
export default function StartJourney() {
  redirect(routes.journeySetup(SEED_JOURNEY.id));
}
