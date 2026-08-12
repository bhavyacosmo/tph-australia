import { ProConnection } from "@/components/pro/pro-connection";

/**
 * P04a — the authorised context, plus P06 output submission.
 *
 * **FR-08-08 — only the consented scope items are visible.** The permission
 * expiry is shown persistently in the header (nav §7) so the professional is
 * always aware the access is bounded.
 *
 * A leak here would be a release-blocking defect, which is why the component
 * derives every field from `link.sharedItems` rather than reading the buyer's
 * record directly.
 */
export default async function ProConnectionPage({
  params,
}: PageProps<"/pro/connections/[trustLinkId]">) {
  const { trustLinkId } = await params;

  return <ProConnection trustLinkId={trustLinkId} />;
}
