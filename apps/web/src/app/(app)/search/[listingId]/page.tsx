import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/search/listing-detail";
import { listingById } from "@/lib/mock/marketplace";

/** Listing detail. ⚠️ Demo data — see src/lib/mock/marketplace.ts. */
export default async function ListingPage({
  params,
}: PageProps<"/search/[listingId]">) {
  const { listingId } = await params;
  const listing = listingById(listingId);

  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}
