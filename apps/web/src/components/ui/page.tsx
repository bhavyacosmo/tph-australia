import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Application page scaffolding.
 * docs/03-experience/18-manager-ui-reference-analysis.md §3, §8
 *
 * The manager references share one page skeleton: a left-aligned large title
 * with a one-line subtitle and generous top space, and — on the working screens
 * — a right utility rail carrying state, the next action and reassurance. That
 * rail is called out in the analysis as "a defining pattern of this design
 * language", so it is a layout primitive here rather than something each screen
 * reinvents.
 *
 * Deliberately NOT a card: app pages sit directly on the page surface, so the
 * content hierarchy comes from type and rhythm instead of nested boxes.
 */

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-(--container-content) px-5 py-10 md:px-8 md:py-14 xl:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Breadcrumbs({
  trail,
}: {
  /** Last item is the current page and is not a link — nav §9 */
  trail: { label: string; href?: string }[];
}) {
  return (
    // Hidden on mobile — the back affordance and stage bar suffice (nav §9)
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className="flex flex-wrap items-center gap-1 text-body-sm text-fg-muted">
        {trail.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                /* WCAG 2.5.8 AA — 24px minimum target. Breadcrumbs are desktop
                   only, so the 44px touch floor does not apply, but 24px does. */
                className="inline-flex min-h-6 items-center rounded-sm underline-offset-4 hover:text-fg hover:underline"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg-secondary">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-overline uppercase text-fg-muted">{eyebrow}</p>
        )}
        <h1 className={cn("text-h1 text-fg-heading", eyebrow && "mt-3")}>
          {title}
        </h1>
        {subtitle && (
          <p className="measure mt-4 text-body-lg text-fg-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  );
}

/**
 * Two-column working layout: content, then the utility rail.
 *
 * The rail comes SECOND in the DOM so a phone reads content first, and is
 * placed into the right-hand columns at `lg`. On desktop it is sticky, because
 * its job is to stay available while the reader works down a long page.
 */
export function PageLayout({
  children,
  rail,
  className,
}: {
  children: ReactNode;
  rail?: ReactNode;
  className?: string;
}) {
  if (!rail) {
    return <div className={cn("mt-10", className)}>{children}</div>;
  }

  return (
    <div className={cn("mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12", className)}>
      <div className="min-w-0 lg:col-span-8">{children}</div>
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">{rail}</div>
      </aside>
    </div>
  );
}

/**
 * A rail panel. Quiet by default so it never competes with the one dominant
 * action on the page (FR-02-03).
 */
export function RailPanel({
  title,
  children,
  tone = "default",
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: "default" | "sunken" | "brand" | "wash";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5",
        tone === "default" && "border-line-subtle bg-surface-card",
        tone === "sunken" && "border-line-subtle bg-surface-sunken",
        tone === "wash" && "border-transparent bg-trustlink-wash",
        tone === "brand" && "border-transparent bg-brand text-white",
        className,
      )}
    >
      {title && (
        <h2
          className={cn(
            "text-overline uppercase",
            tone === "brand" ? "text-white/60" : "text-fg-muted",
          )}
        >
          {title}
        </h2>
      )}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}

/**
 * EmptyState — docs/03-experience/12-ui-patterns.md
 *
 * An empty state must explain what goes here and offer the action that fills
 * it. "No items" with a grey icon is a dead end, and `ENT-01` forbids dead
 * ends.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-line bg-surface-card px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-surface-sunken text-fg-muted">
          {icon}
        </div>
      )}
      <h2 className="mt-5 text-h3 text-fg-heading">{title}</h2>
      <p className="measure mx-auto mt-3 text-body text-fg-secondary">{body}</p>
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
