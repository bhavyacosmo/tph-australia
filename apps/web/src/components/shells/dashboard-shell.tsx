"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, ExternalLink, Home, LogOut, RotateCcw } from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { ThemeToggle } from "@/components/shells/theme-toggle";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/mock/accounts";
import { isActiveSection, ROLE_HOME, SIDEBAR } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock/types";

/**
 * The one authenticated shell.
 *
 * Top navigation, a persistent left sidebar, and a content area that changes
 * when a sidebar row is clicked. All four roles use it — that consistency was
 * the explicit direction ("Do NOT create completely different layouts for every
 * section"), and it is also the reason a reviewer switching roles can tell
 * immediately that this is one product rather than four.
 *
 * It generalises the Prop ID sidebar, which was the only surface with this
 * pattern and which the client's own reference screenshot showed. What is new
 * is that the sidebar contents, the accent, the identity block and the badge
 * counts are all driven by role.
 *
 * Role is never inferred from the URL. It comes from the session, so a
 * mismatched route cannot render the wrong chrome — `RequireRole` in each
 * layout has already redirected by the time this paints.
 */

/**
 * Per-role accent on the header only.
 *
 * The professional and admin surfaces keep the navy bar they already had, so a
 * professional can never mistake which surface they are on
 * (docs/03-experience/05-navigation-structure.md §7). Consumer roles keep the
 * light bar. Same structure, different weight.
 */
const DARK_HEADER: Record<Role, boolean> = {
  buyer: false,
  seller: false,
  professional: true,
  admin: true,
};

export function DashboardShell({
  role,
  children,
  /** Rendered under the header, above the sidebar split — e.g. a stage bar */
  banner,
}: {
  role: Role;
  children: ReactNode;
  banner?: ReactNode;
}) {
  const onDark = DARK_HEADER[role];

  return (
    <div className="flex min-h-full flex-col bg-surface-page">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-40 border-b",
          onDark
            ? "border-white/10 bg-navy-900"
            : "border-line-subtle bg-surface-card/85 backdrop-blur-xl supports-[not(backdrop-filter:blur(0))]:bg-surface-card",
        )}
      >
        <div className="mx-auto flex w-full max-w-(--container-content) items-center gap-4 px-5 md:px-8 xl:px-10">
          <Link
            href={ROLE_HOME[role]}
            className="flex h-[var(--header-h)] shrink-0 items-center gap-3"
            aria-label={`The Property Helpline — ${ROLE_LABEL[role].toLowerCase()} dashboard`}
          >
            <TphLogo variant="full" inverse={onDark} />
          </Link>

          <span
            className={cn(
              "hidden rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] sm:inline-block",
              onDark ? "bg-white/12 text-white/75" : "bg-surface-sunken text-fg-muted",
            )}
          >
            {ROLE_LABEL[role]}
          </span>

          <div className="ml-auto flex items-center gap-1">
            {/* Every dashboard keeps a way back to the public site. Without it
                the authenticated area becomes a trap, which `ENT-01` forbids. */}
            <Link
              href="/"
              className={cn(
                "hidden min-h-11 items-center gap-2 rounded-md px-3 text-body-sm font-medium md:inline-flex",
                "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                onDark
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
              )}
            >
              <Home aria-hidden="true" className="size-4" />
              Public site
            </Link>
            <NotificationBell role={role} onDark={onDark} />
            <ThemeToggle />
            <AccountMenu role={role} onDark={onDark} />
          </div>
        </div>
      </header>

      {banner}

      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-(--container-content) px-5 md:px-8 xl:px-10">
          <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12">
            {/*
              Suspense because the sidebar reads `useSearchParams` — three admin
              rows point at /admin/users and are told apart by their query. Next
              requires the boundary or the whole route opts out of static
              rendering. The fallback reserves the column so the content does not
              jump sideways on hydration.
            */}
            <Suspense fallback={<div className="lg:min-h-dvh" />}>
              <Sidebar role={role} />
            </Suspense>
            <div className="min-w-0 py-8 md:py-10">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ sidebar */

function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.toString();
  const reduce = useReducedMotion();
  const { session, journey, trustLinks, myInterests, applications } =
    useJourneyStore();

  const badges: Record<NonNullable<(typeof SIDEBAR)[Role][number]["badge"]>, number> =
    {
      "pending-requests": trustLinks.filter((t) => t.status === "pending").length,
      "new-interest": myInterests.filter((i) => i.status === "sent").length,
      "pending-verification": applications.filter((a) => a.status === "pending")
        .length,
    };

  return (
    <div className="border-b border-line-subtle py-6 lg:border-b-0 lg:border-r lg:py-10 lg:pr-8">
      <div className="lg:sticky lg:top-24">
        {/* Identity block. The reference puts who-you-are above the nav. */}
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-body-sm font-semibold text-brand-fg">
            {(session?.name ?? "?").charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-sm font-semibold text-fg-heading">
              {session?.name ?? ROLE_LABEL[role]}
            </p>
            <p className="truncate text-caption text-fg-muted">
              {session?.context ?? ROLE_LABEL[role]}
            </p>
          </div>
        </div>

        <nav aria-label={`${ROLE_LABEL[role]} sections`} className="mt-7">
          {/* Horizontal scroll chips below lg — nav §5 */}
          <ul className="-mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {SIDEBAR[role].map((section) => {
              const active = isActiveSection(section, pathname, search);
              const count = section.badge ? badges[section.badge] : 0;
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
                        layoutId={reduce ? undefined : `dash-active-${role}`}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
                    {count > 0 && (
                      <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-action px-1.5 text-[0.625rem] font-semibold text-action-fg">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SidebarFooter role={role} lastSavedAt={journey.lastSavedAt} />
      </div>
    </div>
  );
}

/** One reassurance per role, in the place the reference puts it. */
function SidebarFooter({
  role,
  lastSavedAt,
}: {
  role: Role;
  lastSavedAt: string;
}) {
  const COPY: Record<Role, { title: string; body: string }> = {
    buyer: {
      title: "Nothing is shared",
      body: "No professional can see any of this until you authorise a Trust Link — and you choose what it contains.",
    },
    seller: {
      title: "Buyers stay private",
      body: "You see a buyer's first name and their message. Contact details reach you only if they choose to share them.",
    },
    professional: {
      title: "Scope is the buyer's",
      body: "You can see exactly what a buyer's Trust Link permits, for as long as it lasts. Nothing more.",
    },
    admin: {
      title: "Actions are recorded",
      body: "Verification, suspension and listing changes are written to the activity log against your name.",
    },
  };

  return (
    <>
      <div className="mt-8 hidden rounded-xl bg-trustlink-wash p-4 lg:block">
        <p className="text-body-sm font-medium text-fg-heading">
          {COPY[role].title}
        </p>
        <p className="mt-1.5 text-caption text-fg-secondary">{COPY[role].body}</p>
      </div>

      {/* FR-05-13 — when the record was last saved, always in view */}
      <p className="mt-6 hidden text-caption text-fg-muted lg:block" title={lastSavedAt}>
        Last saved {formatRelative(lastSavedAt)}
      </p>
    </>
  );
}

/* -------------------------------------------------------------- notifications */

/**
 * A dropdown, not a page — at pilot scale there is never enough volume to
 * justify a route (nav §2).
 *
 * The buyer reads their OWN diary; every other role reads the platform log
 * filtered to things they did or that concern them. Showing a buyer the
 * operations feed would leak other people's activity into a consumer screen.
 */
function NotificationBell({ role, onDark }: { role: Role; onDark: boolean }) {
  const { activity, platformEvents } = useJourneyStore();
  const [open, setOpen] = useState(false);
  const [readAt, setReadAt] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const items =
    role === "buyer"
      ? activity.map((a) => ({ id: a.id, at: a.at, what: a.what }))
      : platformEvents
          .filter((e) => (role === "admin" ? true : e.actorRole === role))
          .map((e) => ({ id: e.id, at: e.at, what: e.what }));

  const unread = items.filter((a) => !readAt || a.at > readAt);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={
          unread.length > 0
            ? `Notifications, ${unread.length} unread`
            : "Notifications"
        }
        className={cn(
          "relative grid size-11 place-items-center rounded-md transition-colors duration-[var(--duration-fast)]",
          onDark
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
        )}
      >
        <Bell aria-hidden="true" className="size-4.5" />
        {unread.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-action text-[0.625rem] font-semibold text-action-fg"
          >
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="notifications"
            initial={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-line-subtle bg-surface-card shadow-elev-3"
          >
            <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3">
              <p className="text-body-sm font-semibold text-fg-heading">
                {role === "buyer" ? "Recent activity" : "Recent on the platform"}
              </p>
              {unread.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReadAt(new Date().toISOString())}
                  className="min-h-11 text-body-sm text-fg-link underline-offset-4 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-6 text-body-sm text-fg-muted">
                Nothing yet. Activity appears here as you go.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {items.slice(0, 10).map((a) => (
                  <li
                    key={a.id}
                    className="border-b border-line-subtle px-4 py-3 last:border-0"
                  >
                    <p className="text-body-sm text-fg">{a.what}</p>
                    <p className="mt-0.5 text-caption text-fg-muted">
                      {formatRelative(a.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------- account menu */

/**
 * Who you are, and one way out.
 *
 * There is deliberately **no way to change role from here**. Each experience is
 * its own authenticated product, and the only route between them is signing out
 * and back in — which is also what makes the cross-role demonstration honest.
 */
function AccountMenu({ role, onDark }: { role: Role; onDark: boolean }) {
  const router = useRouter();
  const { session, signOut, resetDemo } = useJourneyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-md pl-2 pr-2.5 text-body-sm font-medium",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
          onDark
            ? "text-white/85 hover:bg-white/10 hover:text-white"
            : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid size-7 place-items-center rounded-full text-caption font-semibold",
            onDark ? "bg-white/15 text-white" : "bg-brand text-brand-fg",
          )}
        >
          {(session?.name ?? "?").charAt(0)}
        </span>
        <span className="hidden sm:inline">
          {(session?.name ?? "").split(" ")[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="account"
            initial={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-line-subtle bg-surface-card shadow-elev-3"
          >
            <div className="border-b border-line-subtle px-4 py-3">
              <p className="text-body-sm font-semibold text-fg-heading">
                {session?.name}
              </p>
              <p className="truncate text-caption text-fg-muted">
                {session?.context}
              </p>
              <p className="mt-2 inline-flex rounded-full bg-surface-sunken px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider text-fg-muted">
                {ROLE_LABEL[role]}
              </p>
            </div>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2.5 px-4 text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              Public site
            </Link>

            <button
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
                router.push("/sign-in");
              }}
              className="flex min-h-11 w-full items-center gap-2.5 border-t border-line-subtle px-4 text-left text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>

            {/* Prototype affordance, labelled as such. */}
            <div className="border-t border-line-subtle bg-surface-sunken px-4 py-2">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-fg-muted">
                Prototype
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                setOpen(false);
                router.push("/sign-in");
              }}
              className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset all demo data
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
