import { AppShell } from "@/components/shells/app-shell";
import { Compare } from "@/components/journey/compare";

/** S12 — Compare properties. FR-03-09…15, FR-03-23. Highest-risk screen #3. */
export default async function ComparePage({
  params,
}: PageProps<"/journey/[journeyId]/compare">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <Compare journeyId={journeyId} />
    </AppShell>
  );
}
