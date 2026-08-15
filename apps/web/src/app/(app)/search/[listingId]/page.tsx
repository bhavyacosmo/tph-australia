import { ListingDetail } from "@/components/search/listing-detail";

/**
 * Listing detail.
 *
 * The id is resolved in the CLIENT, not here. A property a seller published in
 * this session lives in localStorage, so a server lookup against the seed module
 * would 404 the one listing the cross-role demonstration depends on.
 *
 * ⚠️ Demo data — see src/lib/mock/marketplace.ts and src/lib/mock/platform.ts.
 */
export default async function ListingPage({
  params,
}: PageProps<"/search/[listingId]">) {
  const { listingId } = await params;
  return <ListingDetail listingId={listingId} />;
}
