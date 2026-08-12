"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { useJourneyStore } from "@/lib/store/journey-store";
import { HOME_FOR, ROLE_LABEL } from "@/lib/mock/accounts";

/**
 * The right-hand cluster of the public header.
 *
 * Signed out: one text link and one filled CTA (FR-01-02, [VB] p.16 principle 2).
 * Signed in:  a single route back into whichever experience you belong to —
 *             never a list of the others.
 *
 * The public pages (homepage, search, listings, directory) stay readable either
 * way, because a window shopper is the highest-volume visitor and should never
 * hit a wall (transcript L235-243).
 */
export function PublicAuthActions() {
  const { session } = useJourneyStore();

  if (session) {
    return (
      <>
        <span className="hidden text-body-sm text-fg-muted lg:inline">
          {ROLE_LABEL[session.role]}
        </span>
        {/*
          Hidden below `sm`: the logo, theme toggle and hamburger already fill a
          375px header, and adding this pushed the row into horizontal overflow.
          The mobile drawer carries "Your dashboard", so nothing is lost.
        */}
        <ButtonLink
          href={HOME_FOR[session.role]}
          variant="primary"
          size="md"
          className="group hidden sm:inline-flex"
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Your dashboard
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
          />
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="hidden min-h-11 items-center rounded-md px-3 text-body-sm font-medium text-fg-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] hover:bg-surface-sunken hover:text-fg sm:inline-flex"
      >
        Sign in
      </Link>
      <ButtonLink
        href="/journey/start"
        variant="primary"
        size="md"
        className="hidden lg:inline-flex"
      >
        Start buyer journey
      </ButtonLink>
    </>
  );
}
