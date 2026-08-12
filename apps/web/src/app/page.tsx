import { ArrowRight } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

import { SearchHero } from "@/components/marketing/search-hero";
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

      {/* 7 · Close — typographic, deliberately empty after a dense page */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        <div aria-hidden="true" className="grain absolute inset-0" />
        <Container className="relative py-24 md:py-32 lg:py-40">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.035em] text-white">
                Your journey.
                <br />
                Your record.
                <br />
                <span className="text-green-400">Yours to control.</span>
              </p>

              <div className="rule-fade my-12 opacity-40" />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/*
                  Secondary variant — the hero carries the one filled primary
                  for this screen ([VB] p.16 principle 2).
                */}
                <ButtonLink
                  href="/journey/start"
                  variant="secondary"
                  size="lg"
                  className="group"
                >
                  Start buyer journey
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </ButtonLink>
                <p className="text-body-sm text-white/60">
                  Free to start. Brisbane City Council area, buying journey.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PublicShell>
  );
}
