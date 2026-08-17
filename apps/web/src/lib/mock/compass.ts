import type { BuyingStage, HelpWanted, Timing } from "./types";

/**
 * The Home Compass questions — the canonical copy, in one place.
 *
 * These six questions are now asked in two places: the full-page setup at
 * /journey/[id]/setup, where a buyer works through them at their own pace, and
 * the homepage filter wizard, which asks the same six one at a time before a
 * search.
 *
 * They are the SAME questions, so they live here rather than being typed twice.
 * Two copies would drift the first time a word changed, and the two surfaces
 * would then be asking subtly different things and writing to the same record.
 *
 * The option lists are NOT duplicated here either — they already exist in
 * seed.ts (`REQUIREMENT_TYPES`, `BUDGET_OPTIONS`, `TIMING_LABEL`,
 * `HELP_WANTED_LABEL`, `BUYING_STAGE_LABEL`) and both surfaces read them from
 * there.
 *
 * FR-02-04 — plain language, no "criteria", no "onboarding".
 * FR-02-07 — every question carries what the answer will be used for, before
 * it is given. That is what `why` is doing, and it is help text rather than a
 * tooltip because a tooltip is unreachable on touch.
 */

export type CompassKey =
  | "location"
  | "requirements"
  | "budget"
  | "timing"
  | "help"
  | "stage";

export interface CompassQuestion {
  key: CompassKey;
  title: string;
  why: string;
  /** Shown under the answer controls where the source copy has one. */
  helper?: string;
  /** False where an answer is genuinely optional. */
  required: boolean;
}

export const COMPASS_QUESTIONS: CompassQuestion[] = [
  {
    key: "location",
    title: "Where are you looking?",
    why: "Council data we can show you — zoning, flood indicators — is Brisbane City Council area only at this stage. Naming your suburbs tells us whether we can help.",
    required: true,
  },
  {
    key: "requirements",
    title: "What are you looking for?",
    why: "This shapes what we put in front of you, and it becomes the criteria you compare properties on later.",
    required: false,
  },
  {
    key: "budget",
    title: "What's your budget?",
    why: "A range, not a commitment. We don't lend, we don't assess you, and this is never shared with anyone — it only filters what we show you.",
    required: true,
  },
  {
    key: "timing",
    title: "When are you hoping to move?",
    why: "Timing changes the order of things. If you're months away, getting your finances clear matters more than booking an inspection.",
    required: true,
  },
  {
    key: "help",
    title: "What help do you want?",
    why: "Choose as many as you like. This only affects what we suggest — it doesn't contact anyone, and nothing is shared.",
    required: false,
  },
  {
    key: "stage",
    title: "Where are you up to?",
    why: "It decides what we put in front of you first. Someone going to inspections needs different help from someone still working out a budget.",
    required: true,
  },
];

/** The one-line descriptions under each buying stage. */
export const STAGE_DESCRIPTION: Record<BuyingStage, string> = {
  just_looking: "Working out what's possible.",
  actively_looking: "Going to inspections.",
  ready_to_offer: "Ready to act on the right one.",
  under_contract: "Already signed on a property.",
};

export const STAGE_ORDER: BuyingStage[] = [
  "just_looking",
  "actively_looking",
  "ready_to_offer",
  "under_contract",
];

export const TIMING_ORDER: Timing[] = [
  "0_3_months",
  "3_6_months",
  "6_12_months",
  "unsure",
];

export const HELP_ORDER: HelpWanted[] = [
  "compare_properties",
  "know_if_ready",
  "find_professional",
  "keep_organised",
];
