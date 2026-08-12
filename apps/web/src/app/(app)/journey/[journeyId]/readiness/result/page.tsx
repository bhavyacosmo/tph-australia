import { AppShell } from "@/components/shells/app-shell";
import { ReadinessResult } from "@/components/readiness/readiness-result";

/** S16 — Readiness result and action plan. FR-04-10, FR-04-14, FR-04-15. */
export default async function ReadinessResultPage({
  params,
}: PageProps<"/journey/[journeyId]/readiness/result">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <ReadinessResult journeyId={journeyId} />
    </AppShell>
  );
}
