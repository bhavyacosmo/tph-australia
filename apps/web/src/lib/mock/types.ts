import type { ReadinessAssessment } from "./readiness";

/**
 * Domain types for the prototype.
 *
 * These mirror docs/04-architecture/04-database-design.md closely enough that
 * the store can be replaced with real API calls without touching a screen.
 * Nothing here is persisted server-side — see src/lib/store/journey-store.tsx.
 */

/* ------------------------------------------------------------------ evidence */

/**
 * Provenance of a single fact. The discriminator the real product uses so a
 * cell can never be ambiguous about where its value came from (FR-03-13).
 *
 *   own        — the user typed it
 *   confirmed  — confirmed_from_open_dataset
 *   screening  — screening_only; MUST carry a limitation ([BCC] p.9, FR-03-14)
 *   nodata     — no_data_returned; MUST NOT render as a favourable value
 *                (FR-03-15)
 */
export type EvidenceKind = "own" | "confirmed" | "screening" | "nodata";

export interface EvidenceValue {
  value: string;
  kind: EvidenceKind;
  /** Required for `confirmed` and `screening` — FR-03-14 */
  source?: string;
  /** ISO date the source was checked — FR-03-14 */
  checkedOn?: string;
  /** Required for `screening` — the limitation, in plain language */
  limitation?: string;
  /** Required for `screening` — where to confirm officially */
  officialUrl?: string;
  officialLabel?: string;
}

/* ------------------------------------------------------------------ criteria */

/**
 * Comparison criteria are VERSIONED DATA, not hard-coded (FR-03-11). This
 * module is the v1 set; a saved comparison records which version it used
 * (FR-03-23).
 */
export type CriterionKey =
  | "asking_price"
  | "property_type"
  | "basics"
  | "zoning"
  | "flood"
  | "school_catchment"
  | "shopping"
  | "transport"
  | "sport"
  | "gym_library"
  | "commute"
  | "inspection_note"
  | "personal_rating";

export interface Criterion {
  key: CriterionKey;
  label: string;
  /** What kind of value this criterion normally carries */
  kind: EvidenceKind;
  group: "price" | "property" | "official" | "lifestyle" | "decision";
  /** Shown in the "why we ask" affordance */
  hint?: string;
}

/* ---------------------------------------------------------------- properties */

/** FR-03-16 — the five documented statuses. `removed` is modelled as archived. */
export type PropertyStatus =
  | "researching"
  | "inspecting"
  | "offer_consideration"
  | "paused"
  | "archived";

export interface Property {
  id: string;
  journeyId: string;
  /** FR-03-01 */
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  /** Nullable — a user may not know it yet */
  askingPrice: number | null;
  beds: number | null;
  baths: number | null;
  cars: number | null;
  /** FR-03-01 optional URL/source. NOT scraped — FR-03-03 */
  sourceUrl: string | null;
  /** FR-03-17 */
  note: string;
  status: PropertyStatus;
  /** FR-03-17 simple personal ranking, 1–5. Null until set */
  ranking: number | null;
  /** Which bundled photograph to use. Keyed, not a URL, so assets swap once */
  imageKey: "exterior" | "interior" | null;
  /**
   * Set when this record came from a demo listing rather than manual entry.
   * Keeps the two provenances distinguishable — a saved listing is still the
   * user's own record, but we can show where it started.
   */
  listingId?: string | null;
  /** Media key carried over from the listing, resolved via mock/media.ts */
  listingImageKey?: string | null;
  evidence: Partial<Record<CriterionKey, EvidenceValue>>;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------- journey */

/** FR-02-01 — the four things journey setup must capture */
export type BuyingStage =
  | "just_looking"
  | "actively_looking"
  | "ready_to_offer"
  | "under_contract";

export type Timing = "0_3_months" | "3_6_months" | "6_12_months" | "unsure";

export type HelpWanted =
  | "compare_properties"
  | "know_if_ready"
  | "find_professional"
  | "keep_organised";

/**
 * What the buyer is looking for — PM wireframe §2 "Requirements".
 * Not in the original FR-02-01 list, which covers stage, area, timing and help.
 */
export interface Requirements {
  propertyTypes: string[];
  minBeds: number | null;
  minBaths: number | null;
  /** Free text — the things that matter to them, in their words */
  mustHaves: string;
}

/** PM wireframe §2 "Budget". Also not in FR-02-01. */
export interface Budget {
  max: number | null;
  depositReady: boolean | null;
}

export interface Journey {
  id: string;
  /** FR-05-03 — user can rename */
  name: string;
  stage: BuyingStage | null;
  targetArea: string;
  timing: Timing | null;
  helpWanted: HelpWanted[];
  /** New in the PM direction */
  requirements: Requirements;
  budget: Budget;
  setupCompletedAt: string | null;
  createdAt: string;
  /** FR-05-13 — the system must show when data was last saved */
  lastSavedAt: string;
  archived: boolean;
}

/* ---------------------------------------------------------------- comparison */

export interface Comparison {
  id: string;
  journeyId: string;
  propertyIds: string[];
  criteriaVersion: string;
  completedAt: string | null;
  updatedAt: string;
}

/* ------------------------------------------------------------- professionals */

/**
 * The four services the prototype launches with.
 * PM wireframe §5 · transcript L387 ("pest inspector, building inspector, and
 * conveyancer" plus property agent).
 *
 * ⚠️ The client gave three different lists across the call (L387, L597) and the
 * wireframe. This is the wireframe's list, which is the PM's distillation.
 * See docs/03-experience/21-pm-direction-gap-analysis.md.
 */
export type ServiceKey =
  | "buyers_agent"
  | "building_inspector"
  | "pest_inspector"
  | "conveyancer";

export interface Professional {
  id: string;
  serviceKey: ServiceKey;
  /** Display category — one of the Stage 1 categories ([SG] p.5) */
  category: string;
  name: string;
  /** The individual a buyer would deal with, where the business publishes one */
  contactName: string | null;
  area: string;
  approach: string;
  /** Experience in plain words. Never a rating or review count ([C-15]) */
  experience: string;
  /**
   * PRO-05 — WHAT was checked and WHEN. Never a bare "Verified".
   * `null` means TPH has NOT checked this professional, which the UI must say
   * plainly rather than leave ambiguous (transcript L335 introduces a
   * verified/non-verified distinction that the original documents do not have).
   */
  verification: { what: string; checkedOn: string } | null;
  /** Indicative fee statement, if the professional publishes one */
  feeNote: string | null;
  serviceAreas: string[];
  /**
   * Swappable media. Empty in the prototype — we do not fabricate photographs
   * of people. Drop real headshots into /public/img/pro/ and set this.
   */
  photoUrl: string | null;
}

/* ----------------------------------------------------------------- listings */

/**
 * A demo property listing.
 *
 * ⚠️ PROTOTYPE DATA ONLY. The original documents exclude a listing portal
 * (C-13, FR-03-03 no scraping, FR-03-04 no listing sync) and no supply source
 * has been agreed — that is the first blocker in the gap analysis. Everything
 * here is hand-written demo content behind one module so a real feed, an agency
 * partnership or admin-entered stock can replace it without touching a screen.
 */
export interface Listing {
  id: string;
  listingType: "buy" | "rent";
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  /** Display string — a guide, never presented as a valuation (FR-03-18) */
  priceGuide: string;
  priceValue: number;
  beds: number;
  baths: number;
  cars: number;
  landSize: string | null;
  headline: string;
  description: string;
  features: string[];
  /** Key into src/lib/mock/media.ts, not a URL */
  imageKey: string;
  inspectionNote: string | null;
}

/* ------------------------------------------------------------ saved searches */

/**
 * A saved search — transcript L223: *"he wanna save it, save that search. That
 * search can go to pro file basically straight away."*
 *
 * Distinct from a saved PROPERTY: this stores the criteria, so the buyer can
 * re-run it. It lives in Prop ID alongside the properties, which is what "can go
 * to pro file" describes.
 */
export interface SavedSearch {
  id: string;
  journeyId: string;
  /** What the user typed */
  where: string;
  mode: "buy" | "rent";
  propertyType: string;
  beds: string;
  price: string;
  /** Result count at the moment it was saved, for context on return */
  resultCount: number;
  createdAt: string;
}

/* ------------------------------------------------- professional applications */

/**
 * A professional applying through the website.
 *
 * ⚠️ CONFLICT — see docs/03-experience/21-pm-direction-gap-analysis.md.
 *   [C-03] / `[H1]` p.11: professional profiles are ADMIN-CREATED; there is no
 *   public registration funnel.
 *   Transcript L195-197: asked whether professionals can sign up on the website,
 *   the client said "No, we need this. This is part of the launch" — but the
 *   reason he gave is the Trust Link authorisation flow, i.e. the professional
 *   PORTAL, not a registration form.
 *
 * Reconciliation implemented: a professional may APPLY publicly, which creates a
 * `pending` application. It is not an account and it is not listed anywhere until
 * an admin reviews it and records what was checked (PRO-05). That satisfies the
 * client's "they come through the website" and C-03's "admin controls who is
 * listed" without choosing one over the other.
 */
export type ApplicationStatus = "pending" | "verified" | "declined";

export interface ProfessionalApplication {
  id: string;
  businessName: string;
  contactName: string;
  serviceKey: ServiceKey;
  area: string;
  approach: string;
  /** What the applicant SAYS they hold. Never presented as checked by TPH. */
  claimedCredential: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  submittedAt: string;
  /** Set by an admin when they record a check — PRO-05 */
  verification: { what: string; checkedOn: string; by: string } | null;
  declineReason: string | null;
}

/* ------------------------------------------------ professional admin overrides */

/**
 * Admin-applied state on top of the seeded professional cohort, so verification
 * and suspension are demonstrable without mutating the seed module.
 */
export interface ProfessionalOverride {
  suspended?: boolean;
  verification?: { what: string; checkedOn: string } | null;
}

/* --------------------------------------------------------------- trust links */

/**
 * A Trust Link, through its whole life.
 *
 * Request and "active connection" are the same object at different states
 * rather than two entities — the transcript describes one thing moving through
 * states (L365-409): select professional → send → professional authorizes →
 * connection activated.
 */
export type TrustLinkStatus =
  | "pending"
  | "authorized"
  | "active"
  | "declined"
  | "completed"
  | "revoked";

export interface TrustLinkActivity {
  at: string;
  what: string;
  by: "you" | "professional" | "system";
}

export interface TrustLink {
  id: string;
  journeyId: string;
  propertyId: string;
  professionalId: string;
  serviceKey: ServiceKey;
  /** FR-07-02 — a stated purpose from a controlled list */
  purpose: string;
  note: string;
  /** FR-07-03/04 — item ids the user chose to share. Optional items start OFF */
  sharedItems: string[];
  /** FR-07-05 — how the professional may make contact */
  contactChannel: "through_tph" | "email" | "phone";
  /** FR-07-06 — the permission period, in days */
  expiryDays: number;
  status: TrustLinkStatus;
  createdAt: string;
  authorizedAt: string | null;
  expiresAt: string | null;
  activity: TrustLinkActivity[];
}

/* ------------------------------------------------------------------ outputs */

export interface Output {
  id: string;
  trustLinkId: string;
  propertyId: string;
  professionalId: string;
  /** ⚠️ [OQ-18] — the approved output types are not defined by the client */
  type: string;
  title: string;
  summary: string;
  fileName: string;
  submittedAt: string;
  /** [OQ-22] — whether opening is enough, or receipt is confirmed explicitly */
  receiptConfirmedAt: string | null;
}

/* -------------------------------------------------------- transaction stages */

/**
 * Progress Map v2 — the transaction journey.
 *
 * ⚠️ PROVISIONAL. The client asked for the real purchase journey ("agent →
 * conveyancer → …", transcript L753-779) and called it "the heart" of the
 * product, then said he would supply the stages (L823). The PM wireframe
 * records the same gap: "Final stages are still to be provided by the client."
 *
 * These five are the example he gave. They are marked provisional in the UI and
 * live in one array so the real list drops in cleanly.
 *
 * This does NOT replace the eight Progress Map Lite milestones (FR-09-01,
 * [C-18]) — those still track the Home Compass journey. The two models measure
 * different things and are shown separately.
 */
export type StageStatus = "upcoming" | "in_progress" | "completed";

export interface TransactionStage {
  key: string;
  label: string;
  blurb: string;
  status: StageStatus;
  /** Which of the four services staffs this stage, if any */
  serviceKey: ServiceKey | null;
  professionalId: string | null;
  trustLinkId: string | null;
  /** Plain-language state line */
  detail: string;
  completedAt: string | null;
  /**
   * True where the stage sits outside the documented Stage 1 scope — Finance
   * implies a mortgage broker, which [SG] p.5 excludes. Surfaced in the UI
   * rather than hidden.
   */
  outsideStage1?: boolean;
}

/* --------------------------------------------------------------------- role */

export type Role = "buyer" | "professional" | "admin";

/**
 * ⚠️ A MOCK session. See src/lib/mock/accounts.ts — this is not authentication,
 * it only shapes which experience the prototype shows.
 */
export interface Session {
  role: Role;
  phone: string;
  name: string;
  context: string;
  signedInAt: string;
}

/* ------------------------------------------------------------------ progress */

/** FR-09-01 — the eight Progress Map Lite milestones, [H1] p.14 exactly */
export type MilestoneKey =
  | "journey_started"
  | "first_property_saved"
  | "comparison_completed"
  | "readiness_completed"
  | "professional_selected"
  | "trust_link_authorised"
  | "output_received"
  | "ready_for_next_action";

export type MilestoneState = "todo" | "in_progress" | "done";

export interface Milestone {
  key: MilestoneKey;
  label: string;
  /** FR-09-02 — milestone state AND owner */
  owner: "you" | "professional" | "tph";
  state: MilestoneState;
  detail: string;
  completedAt: string | null;
}

/* ------------------------------------------------------------------ activity */

export interface ActivityEntry {
  id: string;
  at: string;
  /** Plain-language description. This is the user-facing subset of the audit */
  what: string;
  kind: "journey" | "property" | "comparison" | "readiness" | "trustlink" | "output";
}

/* ---------------------------------------------------------------------- user */

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  /** FR-05-02 — private unless explicitly shared through a Trust Link */
  phone: string | null;
  emailVerified: boolean;
}

/* --------------------------------------------------------------------- state */

/** A property entered but not yet committed, because the user hit the save
 *  boundary (FR-01-15). Holding it is what `ENT-03` tests: the entry must
 *  survive account creation, not be retyped. */
export type PendingProperty = Omit<
  Property,
  "id" | "journeyId" | "createdAt" | "updatedAt" | "evidence"
>;

export interface AppState {
  /** ⚠️ Mock session. Null when signed out. Not authentication. */
  session: Session | null;
  user: User;
  journeys: Journey[];
  properties: Property[];
  comparisons: Comparison[];
  /** New in the PM direction */
  trustLinks: TrustLink[];
  outputs: Output[];
  stages: TransactionStage[];
  savedSearches: SavedSearch[];
  applications: ProfessionalApplication[];
  professionalOverrides: Record<string, ProfessionalOverride>;
  /** FR-05-06 · RDY-06 — newest first, superseded assessments retained */
  readiness: ReadinessAssessment[];
  milestones: Milestone[];
  activity: ActivityEntry[];
  /** Set once the user has passed the save boundary (FR-01-15) */
  hasPropId: boolean;
  pendingProperty: PendingProperty | null;
}
