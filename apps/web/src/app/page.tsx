import { PublicShell } from "@/components/shells/public-shell";

import { SearchHero } from "@/components/marketing/search-hero";
import { JourneyCallout } from "@/components/marketing/journey-callout";
import { HomeMarketplace } from "@/components/marketing/home-marketplace";
import { FourTools } from "@/components/marketing/four-tools";
import { ActGatherCompare } from "@/components/marketing/story/act-gather-compare";
import { ActControl } from "@/components/marketing/story/act-control";
import { ActReturn } from "@/components/marketing/story/act-return";
import { ActContinue } from "@/components/marketing/story/act-continue";

/**
 * S01 — Landing.
 *
 * Art direction: docs/03-experience/19-homepage-art-direction.md
 * Requirements:  docs/02-product/04-functional-requirements.md — FR-01-01…06
 *
 * RESTRUCTURED for the PM wireframe and the client call of 10 August 2026.
 *
 * The client asked for a search-led homepage in the shape of domain.com.au,
 * with properties on one side and professionals on the other, because the
 * highest-volume visitor is a window shopper (transcript L235-243). The
 * approved storytelling did not go away — it moved below the fold and now does
 * the job of converting that window shopper into a serious buyer:
 *
 *   SEARCH → BROWSE → FOUR TOOLS → COMPARE → CONTROL → RETURNED → CONTINUES → YOURS
 *
 * Tonal rhythm still alternates so no two adjacent sections share a treatment:
 *   dark · page · sunken · white · dark · white · tint · dark
 *
 * FR-01-03 is still satisfied by demonstration rather than prose: comparison,
 * Trust Link and Prop ID are all operated, not described.
 *
 * `story/hero-scene.tsx`, `story/act-help.tsx` and `story/type-interstitial.tsx`
 * are intentionally retained and unused — the previous hero can be restored in
 * one line if the client prefers it.
 */
export default function LandingPage() {
  return (
    <PublicShell>
      {/* 0 · Search — the window shopper's entry (transcript L15-27, L245-259) */}
      <SearchHero />

      {/* 1 · Properties left, professionals right — the client's "most
             important thing" (L77) */}
      <HomeMarketplace />

      {/* 2 · The bridge from looking to acting. The client named this phrase
             himself (L169) */}
      <FourTools />

      {/* 3 · Compare — the tool demonstrated, not described (FR-01-03) */}
      <ActGatherCompare />

      {/* 4 · Control — Trust Link, the strongest moment (FR-01-03) */}
      <ActControl />

      {/* 5 · Returned — Prop ID continuity (FR-01-03) */}
      <ActReturn />

      {/* 6 · Continues — Progress Map, eight milestones */}
      <ActContinue />

      {/*
        7 · Close — one typographic statement per audience.

        Navy for the buyer, green for the seller, light for the professional:
        each panel is the colour of the surface that person actually works on,
        so the three read as one system. Added on client instruction,
        15 August 2026; the buyer panel is the original close, unchanged in
        wording and destination.
      */}
      <JourneyCallout
        tone="navy"
        lines={["Your journey.", "Your record."]}
        accentLine="Yours to control."
        cta="Start buyer journey"
        href="/journey/start"
        note="Free to start. Brisbane City Council area, buying journey."
      />

      <JourneyCallout
        tone="green"
        lines={["Your property.", "Your price."]}
        accentLine="Your call."
        cta="List your property"
        href="/sign-in?role=seller"
        note="Free to list. You decide how a buyer is able to reach you."
      />

      {/*
        The professional's claim is the one the product can actually keep: a
        request arrives with a purpose and a suburb, and nothing else reaches
        them until they accept it (FR-08-07). No promise here about fees or
        lead volume — neither is defined.
      */}
      <JourneyCallout
        tone="light"
        lines={["No cold leads.", "No guessing."]}
        /* Seventeen characters, the same as "Yours to control." — anything
           longer wraps to a second line at 88px and breaks the three-line
           rhythm the other two panels set. */
        accentLine="You accept first."
        cta="Join as a professional"
        href="/sign-in?role=professional"
        note="Buyers come to you through a Trust Link, on terms they set."
      />
    </PublicShell>
  );
}
