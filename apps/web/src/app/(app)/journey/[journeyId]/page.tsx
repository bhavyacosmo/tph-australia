import { AppShell } from "@/components/shells/app-shell";
import { JourneyHome } from "@/components/journey/journey-home";

/** S09 — Buyer journey home. FR-02-02, FR-02-03. Reference R8. */
export default async function JourneyHomePage({
  params,
}: PageProps<"/journey/[journeyId]">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <JourneyHome journeyId={journeyId} />
    </AppShell>
  );
}
