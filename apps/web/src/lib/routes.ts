/**
 * Route builders, and which of them exist yet.
 *
 * The prototype is delivered in phases (see
 * docs/03-experience/20-remaining-ui-implementation-plan.md §2–§6). Chrome such
 * as the journey stage bar references screens from later phases, and `ENT-01`
 * forbids a control that leads nowhere — so navigation asks `isBuilt()` and
 * renders anything not yet implemented as inert rather than as a 404.
 *
 * Flip entries on as each phase lands. When every phase is in, `BUILT` covers
 * every route and the predicate becomes a no-op.
 */

export const routes = {
  home: () => "/",
  saveBoundary: () => "/save-boundary",

  journey: (id: string) => `/journey/${id}`,
  journeySetup: (id: string) => `/journey/${id}/setup`,
  shortlist: (id: string) => `/journey/${id}/shortlist`,
  addProperty: (id: string) => `/journey/${id}/shortlist/add`,
  property: (id: string, propertyId: string) =>
    `/journey/${id}/property/${propertyId}`,
  compare: (id: string) => `/journey/${id}/compare`,

  readiness: (id: string) => `/journey/${id}/readiness`,
  readinessStep: (id: string, step: string) =>
    `/journey/${id}/readiness/${step}`,
  readinessResult: (id: string) => `/journey/${id}/readiness/result`,

  /* PM direction, August 2026 — search, directory, Trust Link, pro, admin */
  search: () => "/search",
  listing: (listingId: string) => `/search/${listingId}`,
  professionals: () => "/professionals",
  professional: (professionalId: string) => `/professionals/${professionalId}`,
  trustLinkNew: () => "/trustlink/new",
  trustLink: (id: string) => `/trustlink/${id}`,
  pro: () => "/pro",
  proRequests: () => "/pro/requests",
  proRequest: (id: string) => `/pro/requests/${id}`,
  proConnections: () => "/pro/connections",
  proConnection: (id: string) => `/pro/connections/${id}`,
  proTasks: () => "/pro/tasks",
  proOutputs: () => "/pro/outputs",
  proServices: () => "/pro/services",
  proProfile: () => "/pro/profile",

  /* Seller — added August 2026 with the four-role platform */
  seller: () => "/seller",
  sellerProperties: () => "/seller/properties",
  sellerList: () => "/seller/list",
  sellerInterest: () => "/seller/interest",
  sellerProfile: () => "/seller/profile",

  admin: () => "/admin",
  adminUsers: () => "/admin/users",
  adminProfessionals: () => "/admin/professionals",
  adminVerification: () => "/admin/verification",
  adminProperties: () => "/admin/properties",
  adminTrustLinks: () => "/admin/trust-links",
  adminSettings: () => "/admin/settings",

  propId: () => "/prop-id",
  propIdJourneys: () => "/prop-id/journeys",
  propIdReadiness: () => "/prop-id/readiness",
  propIdProperties: () => "/prop-id/properties",
  /* PM wireframe §4 — notes, documents, decisions, saved searches */
  propIdNotes: () => "/prop-id/notes",
  propIdDocuments: () => "/prop-id/documents",
  propIdDecisions: () => "/prop-id/decisions",
  propIdSearches: () => "/prop-id/searches",
  propIdAccount: () => "/prop-id/account",
  propIdComparisons: () => "/prop-id/comparisons",
  propIdTrustLinks: () => "/prop-id/trust-links",
  propIdOutputs: () => "/prop-id/outputs",
  propIdProgress: () => "/prop-id/progress",
} as const;

/**
 * Route prefixes that exist. Checked longest-first, so a specific child can be
 * marked built without its whole subtree being claimed.
 *
 * Phase 1 ✅ · Phase 2–5 pending.
 */
const BUILT: readonly string[] = [
  "/",
  "/save-boundary",
  "/journey",
  "/prop-id",
  "/search",
  "/professionals",
  "/trustlink",
  "/pro",
  "/seller",
  "/admin",
  "/sign-in",
];

const NOT_BUILT: readonly string[] = ["/journey/*/trust-link"];

function matches(pattern: string, path: string): boolean {
  const p = pattern.split("/");
  const s = path.split("/");
  if (p.length > s.length) return false;
  return p.every((seg, i) => seg === "*" || seg === s[i]);
}

/** Whether a route has been implemented. */
export function isBuilt(path: string): boolean {
  if (NOT_BUILT.some((pattern) => matches(pattern, path))) return false;
  return BUILT.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
