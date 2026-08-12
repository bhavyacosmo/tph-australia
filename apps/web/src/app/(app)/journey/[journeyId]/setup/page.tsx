import { AppShell } from "@/components/shells/app-shell";
import { JourneySetup } from "@/components/journey/journey-setup";

/** S09a — Journey setup. FR-02-01, FR-02-04, FR-02-05, FR-02-07. */
export default async function JourneySetupPage({
  params,
}: PageProps<"/journey/[journeyId]/setup">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <JourneySetup journeyId={journeyId} />
    </AppShell>
  );
}
