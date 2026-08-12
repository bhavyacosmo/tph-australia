import { ArrowRight, Check, Info, ShieldCheck, X } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SERVICES } from "@/lib/mock/marketplace";

export const metadata = { title: "For professionals" };

/**
 * S28 — For professionals.
 *
 * ⚠️ THE [C-03] CONFLICT LIVES HERE. The original requirement is that
 * professional profiles are admin-created with no public registration funnel.
 * On the call the client said a professional signing up is "part of the launch"
 * (L195-197) — but justified it by the Trust Link authorisation flow, which is
 * about the portal, not a registration form.
 *
 * What this page does: invites an application, and is explicit that an
 * application is not an account and not a listing. An admin still decides, and
 * still records what was checked (PRO-05). Neither source is overridden.
 */
export default function ForProfessionalsPage() {
  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden bg-navy-900">
        <div aria-hidden="true" className="grain absolute inset-0" />
        <Container className="relative py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-overline uppercase text-white/55">
              For professionals
            </p>
            <h1 className="mt-4 text-display text-white">
              Work that arrives with context, not a cold lead
            </h1>
            <p className="measure mt-6 text-body-lg text-white/75">
              A buyer chooses you, decides what you may see, and authorises it
              before you hear anything. When a request reaches you it already has
              the property, the purpose and the permission attached.
            </p>
            <div className="mt-10">
              <ButtonLink href="/for-professionals/apply" variant="primary" size="lg">
                Apply to be listed
                <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="what-heading">
            <h2 id="what-heading" className="text-h2 text-fg-heading">
              What you get
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "A request with the property, the purpose and the timing already stated.",
                "Only the information the buyer chose to share — no guessing, no fishing.",
                "A clear permission period, so you know when access ends.",
                "One place to submit your report, which lands against the right property.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-body text-fg-secondary">
                  <Check aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-action" />
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="not-heading">
            <h2 id="not-heading" className="text-h2 text-fg-heading">
              What this is not
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "Not a lead-generation list. Buyers pick you; we don't push you.",
                "Not pay-per-lead. There is no bidding for position.",
                "Not a rating or review platform. We publish what we checked, not opinions.",
                "Not unrestricted access. Every connection is bounded and can be withdrawn.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-body text-fg-secondary">
                  <X aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-fg-muted" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ------------------------------------------------- who we're taking */}
        <section aria-labelledby="cats-heading" className="mt-20 border-t border-line-subtle pt-14">
          <h2 id="cats-heading" className="text-h2 text-fg-heading">
            Categories at launch
          </h2>
          <p className="measure mt-4 text-body text-fg-secondary">
            Brisbane, and these four services. We are starting deliberately small
            so every listing can actually be checked.
          </p>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li key={service.key} className="bg-surface-card p-5">
                <p className="text-body font-semibold text-fg-heading">
                  {service.label}
                </p>
                <p className="mt-1.5 text-body-sm text-fg-muted">
                  {service.blurb}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------- how listing works */}
        <Reveal>
          <section
            aria-labelledby="process-heading"
            className="mt-20 rounded-3xl border border-transparent bg-trustlink-wash p-8 md:p-10"
          >
            <h2 id="process-heading" className="text-h2 text-fg-heading">
              How being listed works
            </h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "You apply",
                  b: "Tell us who you are, what you do and what you hold. An application is not an account.",
                },
                {
                  n: "02",
                  t: "We check",
                  b: "Someone at TPH reviews your credential and records what was checked and the date.",
                },
                {
                  n: "03",
                  t: "You appear",
                  b: "Your profile goes live with that check published beside it. Buyers can then choose you.",
                },
              ].map((step) => (
                <li key={step.n}>
                  <p aria-hidden="true" className="tabular text-h3 font-bold text-action/40">
                    {step.n}
                  </p>
                  <h3 className="mt-3 text-h4 text-fg-heading">{step.t}</h3>
                  <p className="mt-2 text-body-sm text-fg-secondary">{step.b}</p>
                </li>
              ))}
            </ol>

            <p className="mt-8 flex items-start gap-3 border-t border-action/20 pt-6 text-body-sm text-fg-secondary">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-action" />
              <span>
                We publish <strong>what we checked and when</strong> — never a bare
                &ldquo;verified&rdquo; badge. Being listed is not an endorsement and
                not a guarantee of your work, and we say so on your profile.
              </span>
            </p>
          </section>
        </Reveal>

        <p className="mt-10 flex items-start gap-3 text-body-sm text-fg-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Prototype note: whether professionals apply through the site or are
            invited by TPH is still being confirmed. This page implements the
            version both readings support — a public application that an admin must
            review before anything is published.
          </span>
        </p>
      </Container>
    </PublicShell>
  );
}
