import { SearchResults } from "@/components/search/search-results";

/**
 * Property search results.
 *
 * ⚠️ PROTOTYPE. Searches a hand-written demo index of eight properties. There is
 * no feed, no scraping and no API — C-13 / FR-03-03 / FR-03-04 exclude a listing
 * portal, and no supply source has been agreed. See
 * docs/03-experience/21-pm-direction-gap-analysis.md.
 */
export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  return (
    <SearchResults
      where={first(params.where) ?? ""}
      mode={first(params.mode) === "rent" ? "rent" : "buy"}
      type={first(params.type) ?? "Any type"}
      beds={first(params.beds) ?? "Any"}
      price={first(params.price) ?? "any"}
    />
  );
}
