"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, CheckCircle2, Inbox, Link2 } from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { ThemeToggle } from "@/components/shells/theme-toggle";
import { SessionMenu } from "@/components/shells/session-menu";
import { useJourneyStore } from "@/lib/store/journey-store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The professional shell.
 *
 * Deliberately different chrome from the consumer product
 * (docs/03-experience/05-navigation-structure.md §7) so a professional can never
 * mistake which surface they are on: a navy bar, a PROFESSIONAL label, and three
 * queues instead of the buyer's tools.
 *
 * ⚠️ Scope note. [C-02] scoped the professional surface to Path A — nine screens,
 * no dashboard, no tasks, no documents manager. The PM wireframe §7 asks for a
 * dashboard with Documents, Tasks and Outputs, which is Path B and was quoted
 * separately. The queues below are built; Documents and Tasks are shown as
 * honest placeholders rather than half-built systems.
 */

const NAV = [
  { label: "Requests", href: routes.pro(), icon: Inbox, exact: true },
  { label: "Active", href: "/pro/connections", icon: Link2 },
  { label: "Completed", href: "/pro/completed", icon: CheckCircle2 },
];

export function ProShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { trustLinks } = useJourneyStore();

  const pending = trustLinks.filter((t) => t.status === "pending").length;

  return (
    <div className="flex min-h-full flex-col bg-surface-page">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900">
        <div className="mx-auto flex w-full max-w-(--container-content) items-center gap-6 px-5 md:px-8 xl:px-10">
          <Link
            href={routes.pro()}
            className="flex h-[var(--header-h)] shrink-0 items-center gap-3"
          >
            <TphLogo variant="mark" inverse />
            <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/60 sm:block">
              Professional
            </span>
          </Link>

          <nav
            aria-label="Professional"
            className="hidden flex-1 items-center gap-1 md:flex"
          >
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center gap-2 rounded-md px-3 text-body-sm font-medium",
                    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                    active ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-4" />
                  {item.label}
                  {item.label === "Requests" && pending > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-green-500 text-[0.625rem] font-semibold text-white">
                      {pending}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "pro-nav"}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-green-400"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <SessionMenu tone="dark" />
          </div>
        </div>
      </header>

      {/* Mobile queue nav */}
      <nav
        aria-label="Professional sections"
        className="border-b border-line-subtle bg-surface-card md:hidden"
      >
        <ul className="mx-auto flex max-w-(--container-content) gap-1 px-5 py-2">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-1.5 rounded-md text-body-sm",
                    active
                      ? "bg-surface-sunken font-medium text-fg-heading"
                      : "text-fg-secondary",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-line-subtle bg-surface-card py-6">
        <p className="mx-auto max-w-(--container-content) px-5 text-caption text-fg-muted md:px-8">
          <Briefcase aria-hidden="true" className="mr-2 inline size-3.5 align-text-bottom" />
          Professional surface · prototype. Access to a buyer&apos;s information
          is limited to what their Trust Link permits, and ends when it expires.
        </p>
      </footer>
    </div>
  );
}
