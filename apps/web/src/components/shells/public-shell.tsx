import Link from "next/link";
import type { ReactNode } from "react";

import { TphLogo } from "@/components/brand/tph-logo";
import { Container } from "@/components/ui/section";
import { MobileNav } from "@/components/shells/mobile-nav";
import { PublicAuthActions } from "@/components/shells/public-auth-actions";
import { PublicFooter } from "@/components/shells/public-footer";
import { ThemeToggle } from "@/components/shells/theme-toggle";
import { PageTransition } from "@/components/motion/page-transition";
import { cn } from "@/lib/utils";

/**
 * PublicShell — the unauthenticated chrome.
 * docs/03-experience/05-navigation-structure.md §6
 *
 * One dominant CTA: "Start buyer journey". [VB] p.16 principle 2.
 *
 * Non-buyer journeys (Selling, Renting, Getting property ready) live in the
 * FOOTER, not the header. [H1] p.6 permits them as content and enquiry routes,
 * but they must not have navigational parity with the buyer journey (C-14).
 */

/**
 * Public navigation — PM wireframe §1, transcript L25-27.
 *
 * The client read domain.com.au's nav aloud ("find a property, research, find
 * agents, for owners, news") and said *"that's where we're gonna put the other
 * stuff, the home compass everything"*. So the SHAPE is domain's; the contents
 * are ours.
 *
 * This also fixes a real defect: the previous nav and footer linked to
 * /how-it-works, /learn, /privacy-and-your-control and /for-professionals, none
 * of which existed — four 404s in the chrome.
 */
const PRIMARY_NAV = [
  { label: "Property search", href: "/search" },
  { label: "Research", href: "/research" },
  { label: "Professionals", href: "/professionals" },
  { label: "Home Compass", href: "/journey" },
  { label: "Trust Link", href: "/trust-link" },
];

function PublicHeader() {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line-subtle",
        // Translucent chrome so content passes beneath it rather than
        // colliding with it. Falls back to a solid surface without blur.
        "bg-surface-card/85 backdrop-blur-xl supports-[not(backdrop-filter:blur(0))]:bg-surface-card",
      )}
    >
      <Container className="flex h-[var(--header-h)] items-center gap-6">
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-md"
          aria-label="The Property Helpline — home"
        >
          <TphLogo variant="full" />
        </Link>

        <nav
          aria-label="Main"
          className="hidden flex-1 items-center gap-0.5 lg:flex"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-body-sm font-medium text-fg-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] hover:bg-surface-sunken hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <ThemeToggle />
          <PublicAuthActions />
          <MobileNav items={PRIMARY_NAV} />
        </div>
      </Container>
    </header>
  );
}

export function PublicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      {/* WCAG 2.4.1 Bypass Blocks — first in tab order */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <PublicHeader />
      <main id="main" className={cn("flex flex-1 flex-col", className)}>
        <PageTransition>{children}</PageTransition>
      </main>
      <PublicFooter />
    </>
  );
}
