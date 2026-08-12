/**
 * Mock data for the homepage story.
 *
 * Every value here is a plausible example of the user's OWN entry or of
 * licensed Council open data — never a listing, a valuation, a rating or a
 * professional's contact detail.
 * See docs/03-experience/19-homepage-art-direction.md §5 and §9.
 */

export interface StoryProperty {
  id: string;
  address: string;
  suburb: string;
  beds: number;
  baths: number;
  cars: number;
  status: "researching" | "inspecting" | "offer_consideration";
}

/** Four saved properties, as a user would have entered them. No prices on cards. */
export const STORY_PROPERTIES: StoryProperty[] = [
  {
    id: "p1",
    address: "12 Green Street",
    suburb: "Carindale QLD 4152",
    beds: 3,
    baths: 2,
    cars: 2,
    status: "inspecting",
  },
  {
    id: "p2",
    address: "8 River Avenue",
    suburb: "Camp Hill QLD 4152",
    beds: 3,
    baths: 1,
    cars: 1,
    status: "researching",
  },
  {
    id: "p3",
    address: "25 Pine Road",
    suburb: "Mansfield QLD 4122",
    beds: 4,
    baths: 2,
    cars: 2,
    status: "offer_consideration",
  },
  {
    id: "p4",
    address: "4 Oak Terrace",
    suburb: "Coorparoo QLD 4151",
    beds: 2,
    baths: 1,
    cars: 1,
    status: "researching",
  },
];

export const STATUS_LABEL: Record<StoryProperty["status"], string> = {
  researching: "Researching",
  inspecting: "Inspecting",
  offer_consideration: "Considering an offer",
};

/**
 * Comparison rows.
 *
 * `kind` is the discriminator the real product uses so a cell can never be
 * ambiguous about its provenance (FR-03-13):
 *   own        — the user typed it
 *   confirmed  — confirmed_from_open_dataset
 *   screening  — screening_only, must carry a limitation ([BCC] p.9)
 *   nodata     — no_data_returned, never rendered as a favourable value
 */
export type CellKind = "own" | "confirmed" | "screening" | "nodata";

export interface ComparisonRow {
  criterion: string;
  cells: { value: string; kind: CellKind }[];
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    criterion: "Asking price",
    cells: [
      { value: "$1,180,000", kind: "own" },
      { value: "$1,120,000", kind: "own" },
      { value: "$1,210,000", kind: "own" },
      { value: "$1,090,000", kind: "own" },
    ],
  },
  {
    criterion: "Primary zoning",
    cells: [
      { value: "Low density residential", kind: "confirmed" },
      { value: "Low density residential", kind: "confirmed" },
      { value: "Low–medium residential", kind: "confirmed" },
      { value: "", kind: "nodata" },
    ],
  },
  {
    criterion: "Flood",
    cells: [
      { value: "Low", kind: "screening" },
      { value: "Low", kind: "screening" },
      { value: "Medium", kind: "screening" },
      { value: "Low", kind: "screening" },
    ],
  },
  {
    criterion: "Commute",
    cells: [
      { value: "24 min", kind: "own" },
      { value: "19 min", kind: "own" },
      { value: "31 min", kind: "own" },
      { value: "22 min", kind: "own" },
    ],
  },
  {
    criterion: "Your note",
    cells: [
      { value: "Cracked render at rear", kind: "own" },
      { value: "Busy road", kind: "own" },
      { value: "Best layout", kind: "own" },
      { value: "Small kitchen", kind: "own" },
    ],
  },
];

/* --------------------------------------------------------- professionals */

/**
 * The Stage 1 professional categories, exactly as scoped.
 *
 * `[SG]` p.5 / docs/02-product/06-user-personas.md §"Professionals — 5–7":
 * 2–3 building inspection businesses · 2 conveyancing or property-law firms ·
 * 1–2 buyer's agents. Mortgage brokers, trades and listing agents are OUT of
 * Stage 1 and must not appear.
 *
 * Business names are invented for the prototype. No count of professionals is
 * stated anywhere — cohort size is still an open blocker ([C-01]).
 *
 * `verification` follows PRO-05: state WHAT was checked and WHEN, never a bare
 * "Verified". Only the building inspector's QBCC wording is established by the
 * documentation; the other two are demonstration wording of the same shape.
 */
export interface StoryProfessional {
  id: string;
  category: string;
  name: string;
  area: string;
  approach: string;
  verification: string;
}

export const PROFESSIONALS: StoryProfessional[] = [
  {
    id: "inspector",
    category: "Building inspector",
    name: "BuildCheck",
    area: "Brisbane southside",
    approach:
      "Pre-purchase inspections with a same-day verbal summary. 12 years, 4,000+ Brisbane inspections.",
    verification: "QBCC licence checked 12 August 2026",
  },
  {
    id: "conveyancer",
    category: "Conveyancer",
    name: "Ashgrove Property Law",
    area: "Brisbane and Ipswich",
    approach:
      "Contract review and settlement for owner-occupier purchases. Fixed fee quoted before you commit.",
    verification: "Practising certificate checked 12 August 2026",
  },
  {
    id: "buyers-agent",
    category: "Buyer's agent",
    name: "Kerbside Buyer Advocacy",
    area: "Greater Brisbane",
    approach:
      "Search, shortlist and negotiation on the buyer's side only. Never acts for a seller.",
    verification: "Agent licence checked 12 August 2026",
  },
];

/** The eight Progress Map Lite milestones — [H1] p.14 exactly. */
export const MILESTONES = [
  { key: "journey_started", label: "Journey started", done: true },
  { key: "first_property_saved", label: "First property saved", done: true },
  { key: "comparison_completed", label: "Comparison completed", done: true },
  { key: "readiness_completed", label: "Readiness completed", done: false },
  { key: "professional_selected", label: "Professional selected", done: false },
  { key: "trust_link_authorised", label: "Trust Link authorised", done: false },
  { key: "output_received", label: "Report received", done: false },
  { key: "ready_for_next_action", label: "Ready for next step", done: false },
] as const;
