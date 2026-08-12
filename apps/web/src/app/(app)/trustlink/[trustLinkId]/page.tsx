import { TrustLinkWorkspace } from "@/components/trustlink/trustlink-workspace";

/**
 * S24a — the Trust Link, from the buyer's side.
 *
 * Covers both the "request sent" state and the "connection activated" state the
 * client described (transcript L203: *"Then connection activated"*), because
 * they are the same object at different points in its life.
 *
 * FR-07-10 — who · why · what · how · when, plus the full activity trail and
 * the ability to withdraw.
 */
export default async function TrustLinkPage({
  params,
}: PageProps<"/trustlink/[trustLinkId]">) {
  const { trustLinkId } = await params;

  return <TrustLinkWorkspace trustLinkId={trustLinkId} />;
}
