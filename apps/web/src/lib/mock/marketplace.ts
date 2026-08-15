/**
 * Demo listings, professionals, services and transaction stages.
 *
 * Introduced by the PM wireframe and the client call of 10 August 2026.
 * See docs/03-experience/21-pm-direction-gap-analysis.md for the conflicts each
 * of these opens against the original client documents — in particular that a
 * property portal is excluded by C-13 / FR-03-03 / FR-03-04 and no listing
 * supply has been agreed.
 *
 * Everything here is hand-written demo content. There is no feed, no scraping
 * and no API.
 */

import type {
  Listing,
  Professional,
  ServiceKey,
  TransactionStage,
} from "./types";

/* ----------------------------------------------------------------- services */

export interface Service {
  key: ServiceKey;
  label: string;
  /** What the buyer is actually asking for, in their words */
  need: string;
  blurb: string;
  /** The purpose recorded on the Trust Link (FR-07-02, controlled list) */
  purpose: string;
  /** Which transaction stage this service staffs */
  stageKey: string;
}

export const SERVICES: Service[] = [
  {
    key: "buyers_agent",
    label: "Property / Buyer's Agent",
    need: "Someone on my side to search and negotiate",
    blurb:
      "Acts for you, not the seller. Searches, shortlists and negotiates on your behalf.",
    purpose: "Buyer representation and negotiation",
    stageKey: "agent",
  },
  {
    key: "building_inspector",
    label: "Building Inspector",
    need: "Check the building before I commit",
    blurb:
      "A pre-purchase inspection of the structure and condition, with a written report.",
    purpose: "Pre-purchase building inspection",
    stageKey: "building_pest",
  },
  {
    key: "pest_inspector",
    label: "Pest Inspector",
    need: "Check for termites and pest damage",
    blurb:
      "A timber pest inspection, usually booked alongside the building inspection.",
    purpose: "Timber pest inspection",
    stageKey: "building_pest",
  },
  {
    key: "conveyancer",
    label: "Conveyancer / Legal",
    need: "Review the contract and handle settlement",
    blurb:
      "Contract review, searches and settlement. Engaged before you sign, not after.",
    purpose: "Contract review and conveyancing",
    stageKey: "conveyancer",
  },
];

export function serviceFor(key: ServiceKey): Service {
  return SERVICES.find((s) => s.key === key) ?? SERVICES[0];
}

/* ------------------------------------------------------------ professionals */

/**
 * The Brisbane cohort. Business names are invented for the prototype.
 *
 * `verification` follows PRO-05: WHAT was checked and WHEN — never a bare
 * "Verified" badge, which the mockup analysis flagged as a legal exposure
 * (M2-G3). Two entries are deliberately unverified, because the client
 * introduced a verified/non-verified distinction on the call (L335) that the
 * original documents do not contain. The UI states the difference plainly.
 *
 * ⚠️ No count of professionals is stated anywhere in the UI — cohort size is
 * still open ([C-01]).
 */
export const PROFESSIONALS: Professional[] = [
  {
    id: "pro-buildcheck",
    serviceKey: "building_inspector",
    category: "Building inspector",
    name: "BuildCheck",
    contactName: "Craig Mullins",
    area: "Brisbane southside",
    approach:
      "Pre-purchase inspections with a same-day verbal summary and a written report within two business days.",
    experience: "12 years · 4,000+ Brisbane inspections",
    verification: { what: "QBCC licence", checkedOn: "2026-08-12" },
    feeNote: "Indicative $550–$690 depending on property size",
    serviceAreas: ["Carindale", "Camp Hill", "Coorparoo", "Mansfield"],
    photoUrl: "/img/pro/pro-buildcheck.jpg",
  },
  {
    id: "pro-truline",
    serviceKey: "building_inspector",
    category: "Building inspector",
    name: "Truline Inspections",
    contactName: "Dan Whitcombe",
    area: "Brisbane north and inner west",
    approach:
      "Structural focus, with thermal imaging on request. Reports include photographs of every defect noted.",
    experience: "8 years · former site supervisor",
    verification: { what: "QBCC licence", checkedOn: "2026-08-09" },
    feeNote: "Indicative $600 flat for homes under 350m²",
    serviceAreas: ["Ashgrove", "Paddington", "Windsor", "Clayfield"],
    photoUrl: "/img/pro/pro-truline.jpg",
  },
  {
    id: "pro-clearpest",
    serviceKey: "pest_inspector",
    category: "Timber pest inspector",
    name: "ClearPest Brisbane",
    contactName: "Sofia Andrade",
    area: "Greater Brisbane",
    approach:
      "Timber pest inspection to AS 4349.3, booked to run alongside your building inspection where possible.",
    experience: "11 years · timber pest only",
    verification: { what: "Pest management technician licence", checkedOn: "2026-08-12" },
    feeNote: "Indicative $340, or $180 when combined with a building inspection",
    serviceAreas: ["Greater Brisbane"],
    photoUrl: "/img/pro/pro-clearpest.jpg",
  },
  {
    id: "pro-ashgrove-law",
    serviceKey: "conveyancer",
    category: "Conveyancer",
    name: "Ashgrove Property Law",
    contactName: "Rachel Deane",
    area: "Brisbane and Ipswich",
    approach:
      "Contract review and settlement for owner-occupier purchases. Fixed fee quoted before you commit.",
    experience: "Small practice, 4 staff",
    verification: { what: "Practising certificate", checkedOn: "2026-08-12" },
    feeNote: "Fixed fee from $1,450 plus disbursements",
    serviceAreas: ["Greater Brisbane", "Ipswich"],
    photoUrl: "/img/pro/pro-ashgrove-law.jpg",
  },
  {
    id: "pro-meridian-legal",
    serviceKey: "conveyancer",
    category: "Property lawyer",
    name: "Meridian Legal",
    contactName: null,
    area: "Brisbane CBD",
    approach:
      "Property law practice handling contract review, special conditions and settlement.",
    experience: "Practice since 2014",
    /* Not yet checked by TPH — the UI says so rather than implying otherwise */
    verification: null,
    feeNote: null,
    serviceAreas: ["Brisbane CBD", "Inner south"],
    photoUrl: null,
  },
  {
    id: "pro-kerbside",
    serviceKey: "buyers_agent",
    category: "Buyer's agent",
    name: "Kerbside Buyer Advocacy",
    contactName: "Sarah Nolan",
    area: "Greater Brisbane",
    approach:
      "Search, shortlist and negotiation on the buyer's side only. Never acts for a seller.",
    experience: "9 years buyer-side only",
    verification: { what: "Real estate agent licence", checkedOn: "2026-08-12" },
    feeNote: "Engagement fee plus success fee — quoted per brief",
    serviceAreas: ["Greater Brisbane"],
    photoUrl: "/img/pro/pro-kerbside.jpg",
  },
  {
    id: "pro-eastside-buyers",
    serviceKey: "buyers_agent",
    category: "Buyer's agent",
    name: "Eastside Buyers Co",
    contactName: null,
    area: "Brisbane east",
    approach:
      "Buyer representation across the eastern suburbs, including auction bidding.",
    experience: "Founded 2021",
    verification: null,
    feeNote: null,
    serviceAreas: ["Carindale", "Cannon Hill", "Wynnum"],
    photoUrl: null,
  },
];

export function professionalsFor(key: ServiceKey): Professional[] {
  // Verified first — the distinction is the point of the directory.
  return PROFESSIONALS.filter((p) => p.serviceKey === key).sort((a, b) =>
    a.verification && !b.verification ? -1 : !a.verification && b.verification ? 1 : 0,
  );
}

export function professionalById(id: string): Professional | undefined {
  return PROFESSIONALS.find((p) => p.id === id);
}

/* ---------------------------------------------------------------- listings */

/**
 * ⚠️ DEMO LISTINGS — not a feed. See the note at the top of this file.
 *
 * Price is a "guide", never a valuation (FR-03-18). There is no agent block, no
 * "days on market" and no auction countdown: TPH does not represent sellers, and
 * implying an agency relationship it does not have would be misleading.
 */
export const LISTINGS: Listing[] = [
  {
    id: "l1",
    listingType: "buy",
    address: "12 Green Street",
    suburb: "Carindale",
    postcode: "4152",
    propertyType: "House",
    priceGuide: "$1,150,000 – $1,220,000",
    priceValue: 1180000,
    beds: 3,
    baths: 2,
    cars: 2,
    landSize: "612m²",
    headline: "Renovated post-war home on a quiet street",
    description:
      "A three-bedroom home on a level block, walking distance to the bus and a short drive to Westfield Carindale. Renovated kitchen, original timber floors, north-facing rear deck.",
    features: [
      "North-facing deck",
      "Renovated kitchen",
      "Original timber floors",
      "Double carport",
      "Level 612m² block",
      "Air conditioning",
    ],
    imageKey: "exterior-1",
    inspectionNote: "Saturday 10:00 – 10:30am",
  },
  {
    id: "l2",
    listingType: "buy",
    address: "8 River Avenue",
    suburb: "Camp Hill",
    postcode: "4152",
    propertyType: "House",
    priceGuide: "$1,080,000 – $1,150,000",
    priceValue: 1120000,
    beds: 3,
    baths: 1,
    cars: 1,
    landSize: "405m²",
    headline: "Character home close to Martha Street",
    description:
      "Three bedrooms with high ceilings and VJ walls, a short walk to the Martha Street cafés. One bathroom, single carport, fenced yard. Faces a through road.",
    features: [
      "High ceilings",
      "VJ walls",
      "Walk to cafés",
      "Fenced yard",
      "Single carport",
    ],
    imageKey: "interior-1",
    inspectionNote: "Saturday 11:00 – 11:30am",
  },
  {
    id: "l3",
    listingType: "buy",
    address: "25 Pine Road",
    suburb: "Mansfield",
    postcode: "4122",
    propertyType: "House",
    priceGuide: "$1,180,000 – $1,250,000",
    priceValue: 1210000,
    beds: 4,
    baths: 2,
    cars: 2,
    landSize: "728m²",
    headline: "Four bedrooms with the best layout of the group",
    description:
      "Single-level four-bedroom home with separate living and dining, a covered outdoor area and a large rear yard. In the Mansfield State School catchment.",
    features: [
      "Single level",
      "Separate living and dining",
      "Covered outdoor area",
      "Large rear yard",
      "Solar",
    ],
    imageKey: "listing-3",
    inspectionNote: null,
  },
  {
    id: "l4",
    listingType: "buy",
    address: "4 Oak Terrace",
    suburb: "Coorparoo",
    postcode: "4151",
    propertyType: "Townhouse",
    priceGuide: "$1,050,000 – $1,120,000",
    priceValue: 1090000,
    beds: 2,
    baths: 1,
    cars: 1,
    landSize: null,
    headline: "Low-maintenance townhouse near the train",
    description:
      "Two-bedroom townhouse in a small complex, twelve minutes' walk to Coorparoo station. Compact kitchen, courtyard, single garage. Body corporate applies.",
    features: [
      "12 min walk to station",
      "Private courtyard",
      "Single garage",
      "Small complex of 6",
    ],
    imageKey: "listing-4",
    inspectionNote: "Saturday 12:00 – 12:30pm",
  },
  {
    id: "l5",
    listingType: "buy",
    address: "31 Sandgate Road",
    suburb: "Clayfield",
    postcode: "4011",
    propertyType: "House",
    priceGuide: "$1,420,000 – $1,500,000",
    priceValue: 1460000,
    beds: 4,
    baths: 3,
    cars: 2,
    landSize: "556m²",
    headline: "Queenslander with a modern rear extension",
    description:
      "Traditional front rooms with a contemporary open-plan extension to the rear. Four bedrooms, three bathrooms, pool. Close to Clayfield College.",
    features: [
      "Queenslander character",
      "Rear extension",
      "In-ground pool",
      "Ducted air conditioning",
      "Walk to schools",
    ],
    imageKey: "listing-5",
    inspectionNote: "Saturday 9:00 – 9:30am",
  },
  {
    id: "l6",
    listingType: "buy",
    address: "9 Rosewood Street",
    suburb: "Holland Park",
    postcode: "4121",
    propertyType: "House",
    priceGuide: "$960,000 – $1,020,000",
    priceValue: 990000,
    beds: 3,
    baths: 1,
    cars: 1,
    landSize: "480m²",
    headline: "Solid brick home, first time offered in 30 years",
    description:
      "Original three-bedroom brick home on a level block. Sound but dated — suits a buyer planning to renovate. Quiet street near Seville Road shops.",
    features: [
      "Solid brick",
      "Level block",
      "Original condition",
      "Quiet street",
      "Renovation potential",
    ],
    imageKey: "listing-6",
    inspectionNote: null,
  },
  {
    id: "l7",
    listingType: "rent",
    address: "5/18 Bennett Street",
    suburb: "Norman Park",
    postcode: "4170",
    propertyType: "Apartment",
    priceGuide: "$720 per week",
    priceValue: 720,
    beds: 2,
    baths: 2,
    cars: 1,
    landSize: null,
    headline: "Two-bedroom apartment with river breezes",
    description:
      "Top-floor apartment with two bedrooms, two bathrooms and a secure car space. Walk to Norman Park station.",
    features: ["Top floor", "Secure parking", "Walk to station", "Balcony"],
    imageKey: "listing-7",
    inspectionNote: null,
  },
  {
    id: "l8",
    listingType: "rent",
    address: "42 Cavendish Road",
    suburb: "Coorparoo",
    postcode: "4151",
    propertyType: "House",
    priceGuide: "$890 per week",
    priceValue: 890,
    beds: 3,
    baths: 2,
    cars: 2,
    landSize: null,
    headline: "Three-bedroom house with a fenced yard",
    description:
      "Renovated three-bedroom home with air conditioning throughout, a fenced rear yard and a double carport.",
    features: ["Fenced yard", "Air conditioning", "Double carport", "Pets on application"],
    imageKey: "listing-8",
    inspectionNote: null,
  },
];

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

/* -------------------------------------------------------- transaction stages */

/**
 * ⚠️ PROVISIONAL — the client has not supplied the final stage list.
 *
 * The five below are the example he gave on the call (L753-779) and in the PM
 * wireframe §9. "Finance" is flagged as outside documented Stage 1 scope because
 * it implies a mortgage broker, which [SG] p.5 excludes.
 *
 * Seed state deliberately has TWO stages live at once — the client was explicit
 * that multiple stages run simultaneously (L777).
 */
export const SEED_STAGES: TransactionStage[] = [
  {
    key: "agent",
    label: "Agent",
    blurb: "Someone acting for you, or dealing directly with the seller's agent.",
    status: "completed",
    serviceKey: "buyers_agent",
    professionalId: "pro-kerbside",
    trustLinkId: null,
    detail: "You engaged Kerbside Buyer Advocacy and briefed them on your search.",
    completedAt: "2026-08-06T10:00:00+10:00",
  },
  {
    key: "finance",
    label: "Finance",
    blurb: "Pre-approval, and knowing what the costs beyond the deposit are.",
    status: "in_progress",
    serviceKey: null,
    professionalId: null,
    trustLinkId: null,
    detail: "You're handling this yourself — no lender or broker connected here.",
    completedAt: null,
    outsideStage1: true,
  },
  {
    key: "building_pest",
    label: "Building & Pest",
    blurb: "Independent checks on the condition of the property before you commit.",
    status: "upcoming",
    serviceKey: "building_inspector",
    professionalId: null,
    trustLinkId: null,
    detail: "Nothing booked yet. Connect an inspector when you're close on a property.",
    completedAt: null,
  },
  {
    key: "conveyancer",
    label: "Conveyancer",
    blurb: "Contract review, searches and settlement.",
    status: "upcoming",
    serviceKey: "conveyancer",
    professionalId: null,
    trustLinkId: null,
    detail: "Engage someone before you sign, not after.",
    completedAt: null,
  },
  {
    key: "settlement",
    label: "Settlement",
    blurb: "The handover itself.",
    status: "upcoming",
    serviceKey: null,
    professionalId: null,
    trustLinkId: null,
    detail: "This becomes live once a contract is in place.",
    completedAt: null,
  },
];

/* ----------------------------------------------------- trust link scope items */

/**
 * What a Trust Link can share.
 *
 * FR-07-04 — every optional item starts OFF. Only the property address is
 * required, because the service cannot be performed without it (FR-07-02).
 */
export interface ScopeItem {
  id: string;
  label: string;
  consequence: string;
  required?: boolean;
  /** Which services actually need this, if it is service-specific */
  services?: ServiceKey[];
}

export const SCOPE_ITEMS: ScopeItem[] = [
  {
    id: "address",
    label: "The property address",
    consequence: "So they know which home this is about.",
    required: true,
  },
  {
    id: "first_name",
    label: "Your first name",
    consequence: "So they know who they're helping.",
  },
  {
    id: "attributes",
    label: "Property details you recorded",
    consequence: "Bedrooms, bathrooms, parking, and the price guide you noted.",
  },
  {
    id: "notes",
    label: "Your notes on this property",
    consequence: "Including anything you flagged as a concern.",
  },
  {
    id: "readiness",
    label: "Your buyer readiness summary",
    consequence: "The area states only — never your individual answers.",
  },
  {
    id: "timing",
    label: "Your timing",
    consequence: "When you're hoping to buy.",
  },
  {
    id: "phone",
    label: "Your phone number",
    consequence: "They could call or text you directly.",
  },
  {
    id: "email",
    label: "Your email address",
    consequence: "They could email you directly.",
  },
];

export const CONTACT_CHANNELS = [
  {
    value: "through_tph" as const,
    label: "Through The Property Helpline only",
    description: "They reply here. Your contact details stay private.",
  },
  {
    value: "email" as const,
    label: "By email",
    description: "Requires sharing your email address.",
    requires: "email",
  },
  {
    value: "phone" as const,
    label: "By phone",
    description: "Requires sharing your phone number.",
    requires: "phone",
  },
];

export const EXPIRY_OPTIONS = [
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days", recommended: true },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];
