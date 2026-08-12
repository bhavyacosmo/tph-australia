import { ProRequestDetail } from "@/components/pro/pro-request-detail";

/**
 * P03a — request detail, PRE-ACCEPTANCE.
 *
 * **FR-08-07 — purpose, broad location, timing and reason ONLY.**
 *
 * This route and the authorised-context route (P04a) must stay separate; the
 * screen inventory forbids merging them, because they have different
 * data-visibility rules and merging them risks a leak. The prototype models that
 * by deriving each screen from a different projection of the Trust Link rather
 * than one object with a flag.
 */
export default async function ProRequestPage({
  params,
}: PageProps<"/pro/requests/[trustLinkId]">) {
  const { trustLinkId } = await params;

  return <ProRequestDetail trustLinkId={trustLinkId} />;
}
