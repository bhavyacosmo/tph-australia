import { AppShell } from "@/components/shells/app-shell";
import { ReadinessIntro } from "@/components/readiness/readiness-intro";

/** S14 — Readiness intro. FR-04-11, RDY-04. */
export default async function ReadinessIntroPage({
  params,
}: PageProps<"/journey/[journeyId]/readiness">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <ReadinessIntro journeyId={journeyId} />
    </AppShell>
  );
}
