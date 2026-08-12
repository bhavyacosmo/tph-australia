import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  FileSearch,
  Info,
  Landmark,
  Waves,
} from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { CRITERIA } from "@/lib/mock/seed";
import { routes } from "@/lib/routes";

export const metadata = { title: "Research" };

/**
 * Research.
 *
 * ⚠️ SCOPE NOTE. "Research" is in the new nav because the client read
 * domain.com.au's navigation aloud — *"find a property, research, find agents,
 * for owners, news"* — and said *"that's where we're gonna put the other stuff,
 * the home compass everything"* (transcript L25-27). He did NOT define a Research
 * product, and neither does the wireframe.
 *
 * So this page does not invent one. It is the honest minimum: it explains what
 * TPH can actually tell you about an address today (the Council open-data
 * criteria that already exist in the comparison), and it holds the non-buyer
 * journeys that C-14 requires to live outside the primary nav. Anything beyond
 * that needs a definition from the client.
 */
export default function ResearchPage() {
  const official = CRITERIA.filter((c) => c.group === "official");

  return (
    <PublicShell>
      <Container className="py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-overline uppercase text-fg-muted">Research</p>
          <h1 className="mt-4 text-h1 text-fg-heading">
            What we can tell you about an address
          </h1>
          <p className="measure mt-5 text-body-lg text-fg-secondary">
            Not a valuation, not a prediction, and not a market report. Licensed
            Council information, shown with its source and the date it was
            checked — plus the notes you make yourself.
          </p>
        </div>

        {/* ------------------------------------------------- council data */}
        <section
          id="council-data"
          aria-labelledby="council-heading"
          className="mt-16 scroll-mt-24"
        >
          <h2 id="council-heading" className="text-h2 text-fg-heading">
            Council information
          </h2>
          <p className="measure mt-4 text-body text-fg-secondary">
            Brisbane City Council area at this stage. Each fact carries where it
            came from, so you always know whether you are looking at an official
            record, an early indicator, or something you typed yourself.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle md:grid-cols-2">
            {official.map((criterion) => (
              <div key={criterion.key} className="bg-surface-card p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-trustlink-wash text-action">
                  {criterion.key === "flood" ? (
                    <Waves aria-hidden="true" className="size-5" />
                  ) : (
                    <Landmark aria-hidden="true" className="size-5" />
                  )}
                </span>
                <h3 className="mt-5 text-h4 text-fg-heading">
                  {criterion.label}
                </h3>
                <p className="measure mt-2 text-body-sm text-fg-secondary">
                  {criterion.hint}
                </p>
              </div>
            ))}
          </div>

          {/* [BCC] p.9 — the limitation travels with the data, everywhere */}
          <p className="mt-6 flex items-start gap-3 rounded-xl border border-attention-line bg-attention-bg px-4 py-3 text-body-sm text-fg-secondary">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-attention-fg"
            />
            <span>
              Flood information we show is a <strong>screening indicator</strong>,
              not a formal assessment. Council&apos;s own FloodWise property report
              is the authority, and we link to it on every property.
            </span>
          </p>

          <div className="mt-8">
            <ButtonLink href={routes.search()} variant="secondary">
              Look up a property
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </div>
        </section>

        {/* ------------------------------------------------ other journeys */}
        <section
          id="other-journeys"
          aria-labelledby="other-heading"
          className="mt-20 scroll-mt-24 border-t border-line-subtle pt-14"
        >
          <h2 id="other-heading" className="text-h2 text-fg-heading">
            Other journeys
          </h2>
          <p className="measure mt-4 text-body text-fg-secondary">
            The buying journey is what we have built. These are on the roadmap,
            and we are not pretending otherwise — there is nothing to sign up to
            yet.
          </p>

          <ul className="mt-8 divide-y divide-line-subtle border-y border-line-subtle">
            {[
              {
                title: "Selling",
                body: "A seller readiness score and a seller-side journey. No wireframe exists for it yet.",
                icon: Building2,
              },
              {
                title: "Renting",
                body: "Not built. Rental search appears as a toggle in the prototype only.",
                icon: FileSearch,
              },
              {
                title: "Getting property ready",
                body: "Trades and preparation services. Out of the current scope.",
                icon: Landmark,
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-4 py-5">
                <item.icon
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-fg-muted"
                />
                <div className="min-w-0">
                  <h3 className="text-body font-semibold text-fg-heading">
                    {item.title}
                  </h3>
                  <p className="measure mt-1 text-body-sm text-fg-secondary">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* -------------------------------------------------------- learn */}
        <section
          id="learn"
          aria-labelledby="learn-heading"
          className="mt-20 scroll-mt-24 border-t border-line-subtle pt-14"
        >
          <h2 id="learn-heading" className="text-h2 text-fg-heading">
            Learn
          </h2>
          <p className="measure mt-4 text-body text-fg-secondary">
            Plain-English guides on the parts of a purchase people get caught by
            — what a building inspection covers, what a conveyancer does, what
            flood mapping means.
          </p>
          <p className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-line bg-surface-card px-5 py-4 text-body-sm text-fg-muted">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              No articles have been written for this prototype. The section exists
              because &ldquo;Research&rdquo; is in the navigation the client asked
              for — but what it should contain has not been defined yet, and we
              would rather show that honestly than fill it with placeholder
              articles.
            </span>
          </p>
        </section>

        <Reveal>
          <section className="mt-20 rounded-3xl bg-brand p-8 text-white md:p-10">
            <h2 className="max-w-xl text-h2 text-white">
              Research is only useful if it stays with the property
            </h2>
            <p className="measure mt-4 text-body text-white/75">
              Anything you look up gets attached to your own record of that home,
              alongside your notes — so in three weeks you still know why you
              ruled it in or out.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={routes.search()} variant="primary" size="lg">
                Search properties
              </ButtonLink>
              <Link
                href="/trust-link"
                className="inline-flex min-h-13 items-center rounded-md border border-white/20 px-7 text-body text-white/85 transition-colors duration-[var(--duration-fast)] hover:border-white/40 hover:bg-white/10"
              >
                How Trust Link works
              </Link>
            </div>
          </section>
        </Reveal>
      </Container>
    </PublicShell>
  );
}
