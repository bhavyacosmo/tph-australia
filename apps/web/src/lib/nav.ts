import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Columns3,
  Compass,
  FileText,
  Gauge,
  Home,
  Inbox,
  Link2,
  ListChecks,
  Map,
  MessageSquare,
  PenLine,
  PlusCircle,
  Route,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/lib/mock/types";

/**
 * The four role sidebars.
 *
 * One shell, four lists — the client's direction was explicit that the
 * authenticated product must not be four differently-shaped applications
 * ("Do NOT create completely different layouts for every section").
 *
 * Ordering rule, applied to all four: the thing you came to look at first, then
 * the things you act on, then the record, then your account. Never alphabetical.
 */

export interface NavSection {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match the pathname exactly rather than by prefix */
  exact?: boolean;
  /**
   * Extra prefixes that should light this row up. Used where a list page and
   * its detail pages live at different paths (a professional's request queue is
   * /pro/requests, but a single request is /pro/requests/<id>).
   */
  also?: string[];
  /** Which store counter, if any, appears as a badge */
  badge?: "pending-requests" | "new-interest" | "pending-verification";
}

/* -------------------------------------------------------------------- buyer */

/**
 * Prop ID is the buyer's dashboard, so it is not a row in its own sidebar —
 * "Overview" is that. Home Compass IS a row, because it is a different surface
 * (the working area) and the buyer needs one tap back to it.
 */
const BUYER: NavSection[] = [
  { label: "Overview", href: "/prop-id", icon: Gauge, exact: true },
  { label: "Home Compass", href: "/journey/j1", icon: Compass, also: ["/journey"] },
  { label: "Journeys", href: "/prop-id/journeys", icon: Route },
  { label: "Properties", href: "/prop-id/properties", icon: Home },
  { label: "Saved searches", href: "/prop-id/searches", icon: Search },
  { label: "Comparisons", href: "/prop-id/comparisons", icon: Columns3 },
  { label: "Notes", href: "/prop-id/notes", icon: PenLine },
  { label: "Decisions", href: "/prop-id/decisions", icon: Scale },
  { label: "Readiness", href: "/prop-id/readiness", icon: ShieldCheck },
  { label: "Connections", href: "/prop-id/trust-links", icon: Link2 },
  { label: "Documents", href: "/prop-id/documents", icon: FileText },
  { label: "Progress Map", href: "/prop-id/progress", icon: Map },
  { label: "Profile", href: "/prop-id/account", icon: UserCog },
];

/* ------------------------------------------------------------------- seller */

const SELLER: NavSection[] = [
  { label: "Overview", href: "/seller", icon: Gauge, exact: true },
  { label: "My properties", href: "/seller/properties", icon: Home },
  { label: "List a property", href: "/seller/list", icon: PlusCircle },
  {
    label: "Interested buyers",
    href: "/seller/interest",
    icon: MessageSquare,
    badge: "new-interest",
  },
  /* "Property activity" removed on client instruction, 17 Aug 2026 — the
     seller overview already carries a Recent list, and a whole section for it
     was more navigation than the content justified. */
  { label: "Profile", href: "/seller/profile", icon: UserCog },
];

/* ------------------------------------------------------------- professional */

/**
 * ⚠️ [C-02] scoped the professional surface to Path A — queues only, no
 * dashboard, no documents manager, no task system. The PM wireframe §7 and this
 * brief both ask for the fuller surface, which is Path B and was quoted
 * separately. Built here; the scope difference is in the conflict register.
 *
 * "Documents" and "Outputs" are two lenses on the SAME records — a returned
 * report is the document. They are not two stores, and the Documents page says
 * so, because a professional who thinks there are two will look for a file in
 * the wrong one.
 */
const PROFESSIONAL: NavSection[] = [
  { label: "Overview", href: "/pro", icon: Gauge, exact: true },
  {
    label: "New requests",
    href: "/pro/requests",
    icon: Inbox,
    badge: "pending-requests",
  },
  { label: "Active connections", href: "/pro/connections", icon: Link2 },
  { label: "Completed", href: "/pro/completed", icon: CheckCircle2 },
  { label: "Tasks", href: "/pro/tasks", icon: ListChecks },
  { label: "Outputs", href: "/pro/outputs", icon: FileText },
  { label: "Services", href: "/pro/services", icon: Briefcase },
  { label: "Profile", href: "/pro/profile", icon: UserCog },
];

/* -------------------------------------------------------------------- admin */

/**
 * Buyers, Sellers and Suspended are filtered views of ONE users table, not
 * separate pages. Three near-identical screens would drift apart the first time
 * a column changed; a filter cannot.
 */
const ADMIN: NavSection[] = [
  { label: "Overview", href: "/admin", icon: Gauge, exact: true },
  { label: "Users", href: "/admin/users", icon: Users, exact: true },
  { label: "Buyers", href: "/admin/users?role=buyer", icon: Home },
  { label: "Sellers", href: "/admin/users?role=seller", icon: Store },
  { label: "Professionals", href: "/admin/professionals", icon: Briefcase },
  {
    label: "Verification",
    href: "/admin/verification",
    icon: BadgeCheck,
    badge: "pending-verification",
  },
  { label: "Properties", href: "/admin/properties", icon: Map },
  { label: "Trust Links", href: "/admin/trust-links", icon: Link2 },
  /* "Activity" removed on client instruction, 17 Aug 2026. The operations log
     still exists and still records everything — the admin overview shows the
     most recent entries, and the notification bell carries the rest. What went
     is the dedicated page, not the audit trail. */
  { label: "Suspended", href: "/admin/users?status=suspended", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const SIDEBAR: Record<Role, NavSection[]> = {
  buyer: BUYER,
  seller: SELLER,
  professional: PROFESSIONAL,
  admin: ADMIN,
};

/** Where the logo in each dashboard points. */
export const ROLE_HOME: Record<Role, string> = {
  buyer: "/prop-id",
  seller: "/seller",
  professional: "/pro",
  admin: "/admin",
};

/**
 * Whether a sidebar row is the current page.
 *
 * Query strings matter here: /admin/users, ?role=buyer and ?status=suspended
 * are three rows pointing at one route, and only one of them should light up.
 */
export function isActiveSection(
  section: NavSection,
  pathname: string,
  search: string,
): boolean {
  const [path, query] = section.href.split("?");

  if (query) return pathname === path && search === query;
  /* A row with no query must not claim the page when a filter is applied. */
  if (section.exact) return pathname === path && !search;

  if (pathname === path) return !search;
  if (pathname.startsWith(`${path}/`)) return true;
  return (section.also ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
