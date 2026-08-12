"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { useJourneyStore } from "@/lib/store/journey-store";
import { HOME_FOR } from "@/lib/mock/accounts";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

/**
 * Mobile disclosure for the public shell.
 *
 * Primary navigation is never hidden behind a hamburger on tablet and above
 * (docs/03-experience/13-ux-guidelines.md §7 — designing for less
 * technology-confident users). This component is `md:hidden` only.
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const { session } = useJourneyStore();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="inline-flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-sunken hover:text-fg"
      >
        {open ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <Menu aria-hidden="true" className="size-5" />
        )}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div
        id="mobile-nav-panel"
        hidden={!open}
        className={cn(
          "absolute inset-x-0 top-full z-40 border-b border-line-subtle",
          "bg-surface-card shadow-elev-2",
        )}
      >
        <nav aria-label="Main" className="flex flex-col p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-md px-3 text-body-sm font-medium text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              {item.label}
            </Link>
          ))}

          {/* Session-aware, like the desktop header — a signed-in user must
              never be offered "Sign in", and must never be shown a route into
              another role's experience. */}
          <div className="mt-3 flex flex-col gap-2 border-t border-line-subtle pt-4">
            {session ? (
              <ButtonLink
                href={HOME_FOR[session.role]}
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setOpen(false)}
              >
                Your dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink
                  href="/sign-in"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </ButtonLink>
                <ButtonLink
                  href="/journey/start"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setOpen(false)}
                >
                  Start buyer journey
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
