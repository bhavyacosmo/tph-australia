/**
 * The single seed for the prototype — ONE user's journey.
 *
 * docs/03-experience/20-remaining-ui-implementation-plan.md §1, §8
 *
 * Continuity is the point: the four properties below are the same four the
 * homepage story uses, and the same four that flow through the shortlist,
 * comparison, Prop ID, Trust Link and returned output. No screen invents its
 * own data.
 *
 * Every value is either the user's OWN entry or licensed Council open data.
 * Never a listing, never a valuation, never a rating.
 */

import type {
  ActivityEntry,
  Comparison,
  Criterion,
  EvidenceValue,
  Journey,
  Milestone,
  ProfessionalApplication,
  Property,
  User,
} from "./types";

/** Fixed "today" so the prototype never drifts. Matches the docs' worked date. */
export const TODAY = "2026-08-16";

export const CRITERIA_VERSION = "criteria-v1";
export const FORMULA_VERSION = "readiness-formula-v1";
export const QUESTION_VERSION = "readiness-questions-v1";

/* ------------------------------------------------------------------ criteria */

/**
 * Criteria v1 — FR-03-12 requires: price · property basics · school/catchment
 * note · flood-risk note/link · shopping · transport · sport · gym/library ·
 * commute · inspection note · personal rating. All eleven are present.
 *
 * `property_type` and `zoning` are additions: type is part of FR-03-01's add
 * form, and zoning is available Council open data ([BCC]).
 */
export const CRITERIA: Criterion[] = [
  {
    key: "asking_price",
    label: "Asking price",
    kind: "own",
    group: "price",
    hint: "What you understood the asking price to be. We don't value property.",
  },
  { key: "property_type", label: "Property type", kind: "own", group: "property" },
  { key: "basics", label: "Beds · baths · parking", kind: "own", group: "property" },
  {
    key: "zoning",
    label: "Primary zoning",
    kind: "confirmed",
    group: "official",
    hint: "From Brisbane City Council open data, with the date it was checked.",
  },
  {
    key: "flood",
    label: "Flood",
    kind: "screening",
    group: "official",
    hint: "A screening indicator only. Confirm in Council's FloodWise report before you rely on it.",
  },
  {
    key: "school_catchment",
    label: "School catchment note",
    kind: "own",
    group: "lifestyle",
    hint: "Your own note. Always confirm catchments with the school or department.",
  },
  { key: "shopping", label: "Shopping", kind: "own", group: "lifestyle" },
  { key: "transport", label: "Transport", kind: "own", group: "lifestyle" },
  { key: "sport", label: "Sport", kind: "own", group: "lifestyle" },
  { key: "gym_library", label: "Gym / library", kind: "own", group: "lifestyle" },
  { key: "commute", label: "Commute to work", kind: "own", group: "lifestyle" },
  {
    key: "inspection_note",
    label: "Inspection note",
    kind: "own",
    group: "decision",
    hint: "What you noticed. Not a building inspection.",
  },
  {
    key: "personal_rating",
    label: "Your rating",
    kind: "own",
    group: "decision",
    hint: "Your own ranking out of five. Nobody else sees it.",
  },
];

/* -------------------------------------------------------- evidence shorthand */

const own = (value: string): EvidenceValue => ({ value, kind: "own" });

const bcc = (value: string): EvidenceValue => ({
  value,
  kind: "confirmed",
  source: "Brisbane City Council",
  checkedOn: "2026-08-12",
});

const flood = (value: string): EvidenceValue => ({
  value,
  kind: "screening",
  source: "Brisbane City Council flood awareness",
  checkedOn: "2026-08-12",
  limitation:
    "This is a screening indicator, not a formal flood assessment or a property-specific report.",
  officialUrl: "https://fam.brisbane.qld.gov.au/",
  officialLabel: "Council FloodWise property report",
});

const noData: EvidenceValue = {
  value: "",
  kind: "nodata",
  source: "Brisbane City Council",
  checkedOn: "2026-08-12",
};

/* -------------------------------------------------------------------- people */

export const SEED_USER: User = {
  firstName: "Barbara",
  lastName: "Nguyen",
  email: "barbara.n@example.com",
  // FR-05-02 — held, but private unless a Trust Link shares it
  phone: "0412 000 000",
  emailVerified: true,
};

/* ------------------------------------------------------------------- journey */

export const SEED_JOURNEY: Journey = {
  id: "j1",
  name: "Carindale and around",
  stage: "actively_looking",
  targetArea: "Carindale, Camp Hill, Coorparoo",
  timing: "3_6_months",
  helpWanted: ["compare_properties", "know_if_ready", "find_professional"],
  /* PM wireframe §2 — Requirements and Budget */
  requirements: {
    propertyTypes: ["House", "Townhouse"],
    minBeds: 3,
    minBaths: 1,
    mustHaves: "Level block, north-facing living, walk to a bus stop.",
  },
  budget: { max: 1250000, depositReady: true },
  setupCompletedAt: "2026-07-28T09:14:00+10:00",
  createdAt: "2026-07-28T09:02:00+10:00",
  lastSavedAt: "2026-08-15T19:41:00+10:00",
  archived: false,
};

/* ---------------------------------------------------------------- properties */

export const SEED_PROPERTIES: Property[] = [
  {
    id: "p1",
    journeyId: "j1",
    address: "12 Green Street",
    suburb: "Carindale",
    postcode: "4152",
    propertyType: "House",
    askingPrice: 1180000,
    beds: 3,
    baths: 2,
    cars: 2,
    sourceUrl: null,
    note: "Cracked render near the back door — ask about it. Best street of the four.",
    status: "inspecting",
    ranking: 5,
    imageKey: "exterior",
    evidence: {
      asking_price: own("$1,180,000"),
      property_type: own("House"),
      basics: own("3 · 2 · 2"),
      zoning: bcc("Low density residential"),
      flood: flood("Low"),
      school_catchment: own("Belmont SS — checked with the office"),
      shopping: own("Westfield Carindale, 6 min drive"),
      transport: own("Bus 222 at the corner"),
      sport: own("Netball courts 5 min walk"),
      gym_library: own("Carindale library 6 min"),
      commute: own("24 min"),
      inspection_note: own("Cracked render at rear"),
      personal_rating: own("5 of 5"),
    },
    createdAt: "2026-07-28T09:22:00+10:00",
    updatedAt: "2026-08-15T19:41:00+10:00",
  },
  {
    id: "p2",
    journeyId: "j1",
    address: "8 River Avenue",
    suburb: "Camp Hill",
    postcode: "4152",
    propertyType: "House",
    askingPrice: 1120000,
    beds: 3,
    baths: 1,
    cars: 1,
    sourceUrl: null,
    note: "Busy road at the front. Cheapest of the four but only one bathroom.",
    status: "researching",
    ranking: 3,
    imageKey: "interior",
    evidence: {
      asking_price: own("$1,120,000"),
      property_type: own("House"),
      basics: own("3 · 1 · 1"),
      zoning: bcc("Low density residential"),
      flood: flood("Low"),
      school_catchment: own("Camp Hill SS — not confirmed yet"),
      shopping: own("Martha Street shops, walk"),
      transport: own("Bus on Old Cleveland Rd"),
      sport: own("Whites Hill reserve"),
      gym_library: own("Gym 10 min drive"),
      commute: own("19 min"),
      inspection_note: own("Busy road"),
      personal_rating: own("3 of 5"),
    },
    createdAt: "2026-08-02T18:40:00+10:00",
    updatedAt: "2026-08-11T08:15:00+10:00",
  },
  {
    id: "p3",
    journeyId: "j1",
    address: "25 Pine Road",
    suburb: "Mansfield",
    postcode: "4122",
    propertyType: "House",
    askingPrice: 1210000,
    beds: 4,
    baths: 2,
    cars: 2,
    sourceUrl: null,
    note: "Best layout by a long way. Medium flood indicator — needs the Council report.",
    status: "offer_consideration",
    ranking: 4,
    imageKey: null,
    evidence: {
      asking_price: own("$1,210,000"),
      property_type: own("House"),
      basics: own("4 · 2 · 2"),
      zoning: bcc("Low–medium density residential"),
      flood: flood("Medium"),
      school_catchment: own("Mansfield SS"),
      shopping: own("Mt Gravatt Plaza"),
      transport: own("Bus 174"),
      sport: own("Mansfield tennis"),
      gym_library: own("Library 8 min"),
      commute: own("31 min"),
      inspection_note: own("Best layout"),
      personal_rating: own("4 of 5"),
    },
    createdAt: "2026-08-05T20:05:00+10:00",
    updatedAt: "2026-08-14T12:30:00+10:00",
  },
  {
    id: "p4",
    journeyId: "j1",
    address: "4 Oak Terrace",
    suburb: "Coorparoo",
    postcode: "4151",
    propertyType: "Townhouse",
    askingPrice: 1090000,
    beds: 2,
    baths: 1,
    cars: 1,
    sourceUrl: null,
    note: "Small kitchen. Would need work before we move in.",
    status: "researching",
    ranking: 2,
    imageKey: null,
    evidence: {
      asking_price: own("$1,090,000"),
      property_type: own("Townhouse"),
      basics: own("2 · 1 · 1"),
      // FR-03-15 — an empty official value renders as "No data returned"
      zoning: noData,
      flood: flood("Low"),
      school_catchment: own("Coorparoo SS"),
      shopping: own("Coorparoo Square"),
      transport: own("Train 12 min walk"),
      sport: own("Pool nearby"),
      gym_library: own("Gym in complex"),
      commute: own("22 min"),
      inspection_note: own("Small kitchen"),
      personal_rating: own("2 of 5"),
    },
    createdAt: "2026-08-09T11:12:00+10:00",
    updatedAt: "2026-08-09T11:12:00+10:00",
  },
];

/* ---------------------------------------------------------------- comparison */

/**
 * Started but not completed. The seed deliberately leaves the comparison
 * unfinished so the journey's next recommended action is a real, performable
 * step — a reviewer can complete it and watch the milestone, the counter and
 * the next action all advance (FR-02-03, FR-09-02).
 */
export const SEED_COMPARISON: Comparison = {
  id: "c1",
  journeyId: "j1",
  propertyIds: ["p1", "p2", "p3", "p4"],
  criteriaVersion: CRITERIA_VERSION,
  completedAt: null,
  updatedAt: "2026-08-14T12:34:00+10:00",
};

/* ------------------------------------------------------------- professionals */

/*
  Professionals now live in ./marketplace.ts, which owns the four launch
  services, the verified/non-verified distinction the client introduced on the
  call, and the wider Brisbane cohort. There is one source, not two.
*/

/* ------------------------------------------------------------------ progress */

/** FR-09-01 — the eight milestones, [H1] p.14. One model only ([C-18]). */
export const SEED_MILESTONES: Milestone[] = [
  {
    key: "journey_started",
    label: "Journey started",
    owner: "you",
    state: "done",
    detail: "You told us your area, timing and what help you wanted.",
    completedAt: "2026-07-28T09:14:00+10:00",
  },
  {
    key: "first_property_saved",
    label: "First property saved",
    owner: "you",
    state: "done",
    detail: "12 Green Street, Carindale — with your own note.",
    completedAt: "2026-07-28T09:22:00+10:00",
  },
  {
    key: "comparison_completed",
    label: "Comparison completed",
    owner: "you",
    state: "in_progress",
    detail: "Four homes, side by side, on thirteen criteria.",
    completedAt: null,
  },
  {
    key: "readiness_completed",
    label: "Readiness completed",
    owner: "you",
    state: "todo",
    detail: "Six areas checked, with a short action plan.",
    completedAt: null,
  },
  {
    key: "professional_selected",
    label: "Professional selected",
    owner: "you",
    state: "todo",
    detail: "Choose someone. Nothing is sent when you do.",
    completedAt: null,
  },
  {
    key: "trust_link_authorised",
    label: "Trust Link authorised",
    owner: "you",
    state: "todo",
    detail: "You choose what to share, and for how long.",
    completedAt: null,
  },
  {
    key: "output_received",
    label: "Report received",
    owner: "professional",
    state: "todo",
    detail: "The report, against the right property.",
    completedAt: null,
  },
  {
    key: "ready_for_next_action",
    label: "Ready for next step",
    owner: "you",
    state: "todo",
    detail: "Add another home, or connect a conveyancer.",
    completedAt: null,
  },
];

/* ------------------------------------------------------------------ activity */

export const SEED_ACTIVITY: ActivityEntry[] = [
  {
    id: "a5",
    at: "2026-08-15T19:41:00+10:00",
    what: "You updated your note on 12 Green Street",
    kind: "property",
  },
  {
    id: "a4",
    at: "2026-08-14T12:34:00+10:00",
    what: "You started comparing 4 properties",
    kind: "comparison",
  },
  {
    id: "a3",
    at: "2026-08-09T11:12:00+10:00",
    what: "You saved 4 Oak Terrace, Coorparoo",
    kind: "property",
  },
  {
    id: "a2",
    at: "2026-08-05T20:05:00+10:00",
    what: "You saved 25 Pine Road, Mansfield",
    kind: "property",
  },
  {
    id: "a1",
    at: "2026-07-28T09:14:00+10:00",
    what: "You started the journey “Carindale and around”",
    kind: "journey",
  },
];

/* -------------------------------------------------------------------- labels */

export const PROPERTY_STATUS_LABEL: Record<Property["status"], string> = {
  researching: "Researching",
  inspecting: "Inspecting",
  offer_consideration: "Considering an offer",
  paused: "Paused",
  archived: "Archived",
};

export const BUYING_STAGE_LABEL: Record<
  NonNullable<Journey["stage"]>,
  string
> = {
  just_looking: "Just starting to look",
  actively_looking: "Actively looking",
  ready_to_offer: "Ready to make an offer",
  under_contract: "Already under contract",
};

export const TIMING_LABEL: Record<NonNullable<Journey["timing"]>, string> = {
  "0_3_months": "In the next 3 months",
  "3_6_months": "3 to 6 months",
  "6_12_months": "6 to 12 months",
  unsure: "Not sure yet",
};

export const HELP_WANTED_LABEL: Record<Journey["helpWanted"][number], string> = {
  compare_properties: "Compare properties properly",
  know_if_ready: "Know whether I'm ready",
  find_professional: "Find the right professional",
  keep_organised: "Keep everything in one place",
};

/** The eight-property limit — FR-03-06 */
export const SHORTLIST_LIMIT = 8;

/** Requirements options — PM wireframe §2 */
export const REQUIREMENT_TYPES = [
  "House",
  "Townhouse",
  "Unit or apartment",
  "Duplex",
  "Land",
];

export const BUDGET_OPTIONS = [
  { value: 900000, label: "Up to $900k" },
  { value: 1100000, label: "Up to $1.1m" },
  { value: 1250000, label: "Up to $1.25m" },
  { value: 1500000, label: "Up to $1.5m" },
  { value: 2000000, label: "Over $1.5m" },
];

/**
 * One seeded application, so the admin verification flow has something to
 * demonstrate on first load. ⚠️ Fictional business; the credential is what the
 * applicant CLAIMS, not something TPH has checked.
 */
export const SEED_APPLICATIONS: ProfessionalApplication[] = [
  {
    id: "app-1",
    businessName: "Sandgate Building Reports",
    contactName: "Marcus Hale",
    serviceKey: "building_inspector",
    area: "Brisbane north",
    approach:
      "Pre-purchase inspections across the northern suburbs, reports within 24 hours.",
    claimedCredential: "QBCC licence 1234567 (claimed, not yet checked)",
    email: "marcus@example.com",
    phone: "0400 111 222",
    status: "pending",
    submittedAt: "2026-08-10T09:30:00+10:00",
    verification: null,
    declineReason: null,
  },
];
