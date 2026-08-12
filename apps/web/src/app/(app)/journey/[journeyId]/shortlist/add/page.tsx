import { AppShell } from "@/components/shells/app-shell";
import { AddProperty } from "@/components/journey/add-property";

/** S10 — Add property. FR-03-01…04, FR-03-21. */
export default async function AddPropertyPage({
  params,
}: PageProps<"/journey/[journeyId]/shortlist/add">) {
  const { journeyId } = await params;

  return (
    <AppShell>
      <AddProperty journeyId={journeyId} />
    </AppShell>
  );
}
