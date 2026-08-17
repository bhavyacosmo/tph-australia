/**
 * Platform-wide demo data: accounts, seller-owned stock, buyer interest and the
 * operations event log.
 *
 * Added August 2026 alongside the seller role. Everything here is fictional.
 *
 * ⚠️ SCOPE. A seller who lists property, and a buyer who contacts them, is a
 * marketplace. The documented Stage 1 product is buyer-side only — no listing
 * portal ([C-13], FR-03-03/04), professionals engaged BY the buyer, and TPH
 * explicitly not representing sellers. This module exists because the client
 * asked for the four-role ecosystem directly. The obligations it implies
 * (listing accuracy, agent-conduct rules, dispute handling, who is liable for a
 * seller's claims) are unresolved and recorded in the conflict register.
 */

import { LISTINGS } from "./marketplace";
import type {
  Interest,
  Listing,
  PlatformEvent,
  PlatformUser,
  Role,
} from "./types";

/** The demo seller owns these seeded properties, so their dashboard has stock. */
export const DEMO_SELLER_ID = "seller-demo";
export const DEMO_SELLER_NAME = "Michael Tran";

const SELLER_OWNED: readonly string[] = ["l3", "l6"];

/**
 * Every listing, with its defaults resolved once.
 *
 * Seeded stock has no `status` or `sellerId` in the source module — those
 * fields only exist because a seller can now create listings. Resolving the
 * defaults here rather than rewriting eight literals keeps "shipped with the
 * prototype" and "created during the demo" visibly different things.
 */
export function seedListings(): Listing[] {
  return LISTINGS.map((l) => ({
    ...l,
    status: "published" as const,
    sellerId: SELLER_OWNED.includes(l.id) ? DEMO_SELLER_ID : null,
    sellerName: SELLER_OWNED.includes(l.id) ? DEMO_SELLER_NAME : null,
    sellerContact: "through_tph" as const,
    createdAt: "2026-08-01T09:00:00+10:00",
  }));
}

/* --------------------------------------------------------------- accounts */

/**
 * The account directory.
 *
 * The four `demo: true` rows are the ones a reviewer can sign in as. The rest
 * exist so the admin tables show a plausible platform rather than four rows —
 * they are records, not credentials, and cannot be signed in to.
 */
export const SEED_USERS: PlatformUser[] = [
  {
    id: "u-buyer-demo",
    role: "buyer",
    name: "Barbara Nguyen",
    phone: "0400 000 001",
    email: "barbara@example.com",
    context: "Buying in Carindale",
    joinedAt: "2026-07-28T09:12:00+10:00",
    suspended: false,
    demo: true,
  },
  {
    id: DEMO_SELLER_ID,
    role: "seller",
    name: DEMO_SELLER_NAME,
    phone: "0400 000 004",
    email: "michael@example.com",
    context: "Selling in Mansfield",
    joinedAt: "2026-07-30T14:40:00+10:00",
    suspended: false,
    demo: true,
  },
  {
    id: "u-pro-demo",
    role: "professional",
    name: "Craig Mullins",
    phone: "0400 000 002",
    email: "craig@buildcheck.example",
    context: "BuildCheck · Building inspector",
    joinedAt: "2026-07-15T08:05:00+10:00",
    suspended: false,
    demo: true,
  },
  {
    id: "u-admin-demo",
    role: "admin",
    name: "TPH Operations",
    phone: "0400 000 003",
    email: "ops@propertyhelpline.example",
    context: "Internal team",
    joinedAt: "2026-06-01T08:00:00+10:00",
    suspended: false,
    demo: true,
  },

  /* ------------------------------------------------- records, not accounts */
  {
    id: "u-b2",
    role: "buyer",
    name: "Priya Raman",
    phone: "0411 204 887",
    email: "priya.r@example.com",
    context: "Buying in Coorparoo",
    joinedAt: "2026-08-02T19:30:00+10:00",
    suspended: false,
    demo: false,
  },
  {
    id: "u-b3",
    role: "buyer",
    name: "Tom Feeney",
    phone: "0422 771 300",
    email: "tfeeney@example.com",
    context: "Buying in Clayfield",
    joinedAt: "2026-08-05T11:02:00+10:00",
    suspended: false,
    demo: false,
  },
  {
    id: "u-b4",
    role: "buyer",
    name: "Hana Ito",
    phone: "0433 918 265",
    email: "hana.ito@example.com",
    context: "Just looking",
    joinedAt: "2026-08-09T21:44:00+10:00",
    suspended: true,
    demo: false,
  },
  {
    id: "u-s2",
    role: "seller",
    name: "Denise Whitlam",
    phone: "0407 553 210",
    email: "d.whitlam@example.com",
    context: "Selling in Holland Park",
    joinedAt: "2026-08-03T16:15:00+10:00",
    suspended: false,
    demo: false,
  },
  {
    id: "u-s3",
    role: "seller",
    name: "Arun Kapoor",
    phone: "0418 660 042",
    email: "arun.k@example.com",
    context: "Selling in Norman Park",
    joinedAt: "2026-08-08T10:20:00+10:00",
    suspended: false,
    demo: false,
  },
  {
    id: "u-p2",
    role: "professional",
    name: "Sofia Andrade",
    phone: "0455 300 118",
    email: "sofia@clearpest.example",
    context: "ClearPest Brisbane · Timber pest",
    joinedAt: "2026-07-18T09:45:00+10:00",
    suspended: false,
    demo: false,
  },
  {
    id: "u-p3",
    role: "professional",
    name: "Rachel Deane",
    phone: "0466 002 947",
    email: "rachel@ashgrovelaw.example",
    context: "Ashgrove Property Law · Conveyancer",
    joinedAt: "2026-07-21T13:10:00+10:00",
    suspended: false,
    demo: false,
  },
];

/* --------------------------------------------------------------- interest */

/** One buyer already waiting in the demo seller's inbox, so it is not empty. */
export const SEED_INTERESTS: Interest[] = [
  {
    id: "int-seed-1",
    listingId: "l3",
    listingAddress: "25 Pine Road, Mansfield",
    buyerName: "Priya",
    buyerPhone: null,
    sharePhone: false,
    message:
      "Is the covered outdoor area council approved? And would you consider an early inspection this week?",
    status: "sent",
    createdAt: "2026-08-13T18:22:00+10:00",
    thread: [],
  },
];

/* --------------------------------------------------------- platform events */

export const SEED_PLATFORM_EVENTS: PlatformEvent[] = [
  {
    id: "pe-1",
    at: "2026-08-13T18:22:00+10:00",
    actorRole: "buyer",
    actorName: "Priya Raman",
    what: "Registered interest in 25 Pine Road, Mansfield",
    kind: "interest",
  },
  {
    id: "pe-2",
    at: "2026-08-12T11:05:00+10:00",
    actorRole: "admin",
    actorName: "TPH Operations",
    what: "Recorded a QBCC licence check for BuildCheck",
    kind: "verification",
  },
  {
    id: "pe-3",
    at: "2026-08-10T09:31:00+10:00",
    actorRole: "seller",
    actorName: DEMO_SELLER_NAME,
    what: "Published 9 Rosewood Street, Holland Park",
    kind: "listing",
  },
  {
    id: "pe-4",
    at: "2026-08-09T21:44:00+10:00",
    actorRole: "admin",
    actorName: "TPH Operations",
    what: "Suspended the account for Hana Ito after a duplicate-signup report",
    kind: "account",
  },
  {
    id: "pe-5",
    at: "2026-08-06T10:00:00+10:00",
    actorRole: "buyer",
    actorName: "Barbara Nguyen",
    what: "Started a buyer journey in Carindale",
    kind: "property",
  },
];

/* ------------------------------------------------------------------ labels */

export const INTEREST_STATUS_LABEL: Record<Interest["status"], string> = {
  sent: "New",
  seen: "Opened",
  replied: "Replied",
  closed: "Closed",
};

export const ROLE_ORDER: Role[] = ["buyer", "seller", "professional", "admin"];

/* ------------------------------------------------- seller listing options */

/** Australian-relevant options for the seller's listing form. */
export const LISTING_PROPERTY_TYPES = [
  "House",
  "Townhouse",
  "Apartment",
  "Unit",
  "Duplex",
  "Land",
];

export const UTILITY_OPTIONS = [
  "Town water",
  "Rainwater tank",
  "Mains electricity",
  "Solar panels",
  "Mains gas",
  "NBN connected",
  "Sewerage connected",
  "Septic system",
  "Air conditioning",
  "Ceiling insulation",
];

export const NEARBY_OPTIONS = [
  "Primary school",
  "High school",
  "Childcare",
  "Bus stop",
  "Train station",
  "Shopping centre",
  "Local shops and cafés",
  "Parkland",
  "Sports fields",
  "Hospital or medical centre",
];

/* ------------------------------------------- professional onboarding options */

/**
 * The specific jobs a professional can say they take on, per service.
 *
 * These are the applicant's own claims about their work — they are not a
 * qualification, and nothing here is checked. Only the four Stage 1 services
 * are listed ([SG] p.5); adding a trade needs its own verification rule before
 * it can appear.
 */
export const SERVICE_TASKS: Record<string, string[]> = {
  building_inspector: [
    "Pre-purchase building inspection",
    "Structural assessment",
    "Thermal imaging",
    "Handover / new build inspection",
    "Defect report",
    "Pool safety inspection",
  ],
  pest_inspector: [
    "Timber pest inspection (AS 4349.3)",
    "Termite management plan",
    "Combined building and pest",
    "Post-treatment inspection",
  ],
  conveyancer: [
    "Contract review before signing",
    "Special conditions drafting",
    "Title and council searches",
    "Settlement",
    "Off-the-plan purchases",
  ],
  buyers_agent: [
    "Full search and shortlist",
    "Negotiation only",
    "Auction bidding",
    "Due diligence coordination",
    "Interstate / relocation buyers",
  ],
};

/** What an applicant can say they hold. Recorded as a claim, never as fact. */
export const CREDENTIAL_OPTIONS = [
  "QBCC licence",
  "Practising certificate",
  "Real estate agent licence",
  "Pest management technician licence",
  "Professional indemnity insurance",
  "Business registration (ABN)",
];

export const FEATURE_OPTIONS = [
  "Air conditioning",
  "Built-in wardrobes",
  "Covered outdoor area",
  "Dishwasher",
  "Ensuite",
  "Fenced yard",
  "Fireplace",
  "Level block",
  "Pool",
  "Renovated kitchen",
  "Second living area",
  "Shed or workshop",
  "Solar hot water",
  "Study",
];
