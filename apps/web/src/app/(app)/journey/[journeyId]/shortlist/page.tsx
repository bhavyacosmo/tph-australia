import { AppShell } from "@/components/shells/app-shell";
import { Shortlist } from "@/components/journey/shortlist";

/** S11 — Shortlist. FR-03-05…08, FR-03-16. */
export default async function ShortlistPage({
  params,
}: PageProps<"/journey/[journeyId]/shortlist">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <Shortlist journeyId={journeyId} />
    </AppShell>
  );
}
