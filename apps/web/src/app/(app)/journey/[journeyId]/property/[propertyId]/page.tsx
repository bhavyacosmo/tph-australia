import { AppShell } from "@/components/shells/app-shell";
import { PropertyDetail } from "@/components/journey/property-detail";

/** S13 — Property detail. FR-03-13/14/16/17, FR-03-21. Reference R3 (partial). */
export default async function PropertyDetailPage({
  params,
}: PageProps<"/journey/[journeyId]/property/[propertyId]">) {
  const { journeyId, propertyId } = await params;

  return (
    <AppShell>
      <PropertyDetail journeyId={journeyId} propertyId={propertyId} />
    </AppShell>
  );
}
