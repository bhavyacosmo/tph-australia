"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Columns3,
  FileText,
  Gauge,
  Home,
  Link2,
  Lock,
  Map,
  PenLine,
  Route,
  Scale,
  Search,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Prop ID shell — the records area.
 * docs/03-experience/05-navigation-structure.md §4 · reference R9.
 *
 * R9 is the only reference with a left sidebar, and the analysis approves it for
 * Prop ID only (§3) — Home Compass keeps the journey stage bar instead. The two
 * areas of the product should not feel identical: one is where you work, this is
 * where the record lives.
 *
 * R9's sidebar lists "Documents" between Notes and Trust Links. It is omitted
 * here: FR-05-14 forbids a document vault or folder hierarchy, and the only
 * files Stage 1 stores are outputs returned through a Trust Link (FR-05-16) —
 * which is what "Outputs" is.
 *
 * **Trust Links is reachable in one tap from anywhere in Prop ID** (nav §4). It
 * is the product's control promise; it is never buried under Account.
 */

/**
 * PM wireframe §4 lists: property details, saved property, notes, documents,
 * comparison, readiness, connections, progress, property decisions.
 *
 * All nine are now reachable. Two notes on interpretation:
 *
 *  · **Documents** is scoped to files returned through a Trust Link and the
 *    per-connection view. FR-05-14/15/16 forbid a general vault or folder
 *    hierarchy, so there is no upload and no free-floating storage — see
 *    /prop-id/documents, which says so on the page.
 *  · **Decisions** is not a new object. It is the status, ranking and shortlist
 *    order the buyer has already set, gathered in one place.
 */
const SECTIONS = [
  { label: "Overview", href: routes.propId(), icon: Gauge, exact: true },
  { label: "Journeys", href: routes.propIdJourneys(), icon: Route },
  { label: "Properties", href: routes.propIdProperties(), icon: Home },
  { label: "Saved searches", href: routes.propIdSearches(), icon: Search },
  { label: "Comparisons", href: routes.propIdComparisons(), icon: Columns3 },
  { label: "Notes", href: routes.propIdNotes(), icon: PenLine },
  { label: "Decisions", href: routes.propIdDecisions(), icon: Scale },
  { label: "Readiness", href: routes.propIdReadiness(), icon: ShieldCheck },
  { label: "Connections", href: routes.propIdTrustLinks(), icon: Link2 },
  { label: "Documents", href: routes.propIdDocuments(), icon: FileText },
  { label: "Progress Map", href: routes.propIdProgress(), icon: Map },
  { label: "Account", href: routes.propIdAccount(), icon: UserCog },
];

export function PropIdShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { state, journey } = useJourneyStore();

  return (
    <div className="mx-auto w-full max-w-(--container-content) px-5 md:px-8 xl:px-10">
      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12">
        {/* ------------------------------------------------------- sidebar */}
        <div className="border-b border-line-subtle py-6 lg:border-b-0 lg:border-r lg:py-10 lg:pr-8">
          <div className="lg:sticky lg:top-24">
            {/* Profile block — R9 puts identity above the nav */}
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-propid-surface text-propid-surface-fg">
                <Lock aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-fg-heading">
                  {state.user.firstName}
                  {state.user.lastName && ` ${state.user.lastName}`}
                </p>
                <p className="text-caption text-fg-muted">Prop ID Lite</p>
              </div>
            </div>

            <nav aria-label="Prop ID" className="mt-7">
              {/* Horizontal scroll chips below lg (nav §5) */}
              <ul className="-mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
                {SECTIONS.map((section) => {
                  const active = section.exact
                    ? pathname === section.href
                    : pathname.startsWith(section.href);
                  return (
                    <li key={section.href} className="shrink-0 lg:shrink">
                      <Link
                        href={section.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-body-sm whitespace-nowrap",
                          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                          active
                            ? "font-medium text-fg-heading"
                            : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={reduce ? undefined : "propid-active"}
                            transition={{
                              duration: 0.28,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="absolute inset-0 -z-10 rounded-lg bg-surface-sunken"
                          />
                        )}
                        <section.icon
                          aria-hidden="true"
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-action" : "text-fg-muted",
                          )}
                        />
                        {section.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Help card — R9 closes the sidebar with reassurance */}
            <div className="mt-8 hidden rounded-xl bg-trustlink-wash p-4 lg:block">
              <p className="text-body-sm font-medium text-fg-heading">
                Nothing is shared
              </p>
              <p className="mt-1.5 text-caption text-fg-secondary">
                No professional can see any of this until you authorise a Trust
                Link — and you choose what it contains.
              </p>
            </div>

            {/* FR-05-13 — when the record was last saved, always in view */}
            <p
              className="mt-6 hidden text-caption text-fg-muted lg:block"
              title={journey.lastSavedAt}
            >
              Last saved {formatRelative(journey.lastSavedAt)}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------- content */}
        <div className="min-w-0 py-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}

/** Shared header for the record sub-pages. */
export function RecordHeader({
  title,
  subtitle,
  count,
  actions,
}: {
  title: string;
  subtitle: string;
  count?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-line-subtle pb-7 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-h2 text-fg-heading">{title}</h1>
          {count && (
            <span className="tabular text-body-sm text-fg-muted">{count}</span>
          )}
        </div>
        <p className="measure mt-3 text-body text-fg-secondary">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
}
