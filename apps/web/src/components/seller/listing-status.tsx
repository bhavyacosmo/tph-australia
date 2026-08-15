import type { StatusTone } from "@/components/ui/status-chip";
import type { ListingStatus } from "@/lib/mock/types";

/**
 * Listing status → words and tone, defined once.
 *
 * `removed_by_admin` is deliberately distinct from `withdrawn`. A seller whose
 * property was taken down by the platform must be told that, not shown the same
 * chip they would see after withdrawing it themselves — otherwise the one piece
 * of information they need is the one the UI hides.
 */
export const LISTING_STATUS: Record<
  ListingStatus,
  { label: string; tone: StatusTone; detail: string }
> = {
  draft: {
    label: "Draft",
    tone: "neutral",
    detail: "Only you can see this. Publish it when you're ready.",
  },
  published: {
    label: "Published",
    tone: "success",
    detail: "Visible in buyer search and on the homepage.",
  },
  withdrawn: {
    label: "Withdrawn",
    tone: "attention",
    detail: "You took this off the market. Republish it whenever you like.",
  },
  removed_by_admin: {
    label: "Removed by TPH",
    tone: "danger",
    detail:
      "The Property Helpline removed this listing. Contact us to discuss it.",
  },
};
