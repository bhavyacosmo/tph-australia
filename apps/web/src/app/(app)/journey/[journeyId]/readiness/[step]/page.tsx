import { AppShell } from "@/components/shells/app-shell";
import { ReadinessStep } from "@/components/readiness/readiness-step";

/**
 * S15 — Readiness assessment step. FR-04-01…07, FR-04-12, RDY-05.
 *
 * `result` is a sibling static segment, so it resolves before this dynamic one
 * and never lands here.
 */
export default async function ReadinessStepPage({
  params,
}: PageProps<"/journey/[journeyId]/readiness/[step]">) {
  const { journeyId, step } = await params;

  return (
    <AppShell>
      <ReadinessStep journeyId={journeyId} step={Number(step)} />
    </AppShell>
  );
}
