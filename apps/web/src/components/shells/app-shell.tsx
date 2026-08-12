"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Compass, Lock, LogOut, RotateCcw, User, UserPlus } from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { ThemeToggle } from "@/components/shells/theme-toggle";
import { JourneyStageBar } from "@/components/shells/journey-stage-bar";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * AppShell — the authenticated consumer chrome.
 * docs/03-experience/05-navigation-structure.md §2, §5
 *
 * Two primary destinations, not five. `Properties` implies portal search
 * ([C-13]); `Trusted Partners` is reached from the journey when the user is
 * ready, never browsed as a marketplace ([H1] p.7); `Get Property Ready` is
 * content. `Learn` joins this nav when the content routes land.
 *
 * Mobile gets a bottom tab bar (nav §5) because the primary destinations must
 * stay thumb-reachable on a phone.
 */

const NAV = [
  { label: "Home Compass", href: routes.journey("j1"), icon: Compass, match: "/journey" },
  { label: "Prop ID", href: routes.propId(), icon: Lock, match: "/prop-id" },
];

export function AppShell({
  children,
  /** The journey stage bar is journey context — not shown inside Prop ID */
  showStageBar = true,
}: {
  children: ReactNode;
  showStageBar?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col bg-surface-page">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line-subtle bg-surface-card/85 backdrop-blur-xl supports-[not(backdrop-filter:blur(0))]:bg-surface-card">
        <div className="mx-auto flex w-full max-w-(--container-content) items-center gap-6 px-5 md:px-8 xl:px-10">
          <Link
            href={routes.journey("j1")}
            className="flex h-[var(--header-h)] shrink-0 items-center"
            aria-label="The Property Helpline — your journey"
          >
            <TphLogo variant="full" />
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center gap-2 rounded-md px-3 text-body-sm font-medium",
                    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                    active
                      ? "text-fg-heading"
                      : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-4" />
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-action"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <NotificationBell />
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      {showStageBar && <JourneyStageBar />}

      <main id="main" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      <MobileTabs />
    </div>
  );
}

/* --------------------------------------------------------------- mobile tabs */

function MobileTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-subtle bg-surface-card/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-caption",
                  active ? "text-action" : "text-fg-muted",
                )}
              >
                <item.icon aria-hidden="true" className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------- notifications */

/**
 * Notifications are a dropdown, not a page — nav §2. At pilot scale there is
 * never enough volume to justify a route.
 *
 * FR-08-17 — nothing promotional appears here without consent. Every item is a
 * state change in the user's own journey.
 */
function NotificationBell() {
  const { activity } = useJourneyStore();
  const [open, setOpen] = useState(false);
  const [readAt, setReadAt] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const unread = activity.filter((a) => !readAt || a.at > readAt).slice(0, 10);

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
        className="relative grid size-11 place-items-center rounded-md text-fg-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-fg"
      >
        <Bell aria-hidden="true" className="size-4.5" />
        {unread.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-action text-[0.625rem] font-semibold text-action-fg"
          >
            {unread.length}
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
                Recent activity
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

            {activity.length === 0 ? (
              <p className="px-4 py-6 text-body-sm text-fg-muted">
                Nothing yet. Activity appears here as you go.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {activity.slice(0, 10).map((a) => (
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

/* ------------------------------------------------------------- account menu */

function AccountMenu() {
  const router = useRouter();
  const { state, session, signOut, resetDemo, startFresh } = useJourneyStore();
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
        className="flex min-h-11 items-center gap-2 rounded-md pl-2 pr-2.5 text-body-sm font-medium text-fg-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-fg"
      >
        <span className="grid size-7 place-items-center rounded-full bg-brand text-caption font-semibold text-brand-fg">
          {state.user.firstName.charAt(0)}
        </span>
        <span className="hidden sm:inline">Hi, {state.user.firstName}</span>
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
                {session?.name ?? `${state.user.firstName} ${state.user.lastName}`}
              </p>
              <p className="truncate text-caption text-fg-muted">
                {session?.context ?? state.user.email}
              </p>
            </div>

            <Link
              href={routes.propId()}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2.5 px-4 text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <User aria-hidden="true" className="size-4" />
              Your Prop ID
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

            {/*
              Prototype affordances, labelled as such. "New visitor" is not a
              product feature — it clears the journey so a reviewer can see the
              screens a returning user never meets: the empty shortlist, the
              journey at step one, and the save boundary (FR-01-15).
            */}
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
              }}
              className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset demo data
            </button>
            <button
              type="button"
              onClick={() => {
                startFresh();
                setOpen(false);
                router.push(routes.journeySetup("j1"));
              }}
              className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <UserPlus aria-hidden="true" className="size-4" />
              Start as a new visitor
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
