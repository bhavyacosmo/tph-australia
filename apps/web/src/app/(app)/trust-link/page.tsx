import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  Lock,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SCOPE_ITEMS, SERVICES } from "@/lib/mock/marketplace";
import { routes } from "@/lib/routes";

export const metadata = { title: "How Trust Link works" };

/**
 * The public Trust Link explainer — the nav destination the PM wireframe asks
 * for (§1: "Navigation should provide access to … TrustLink"), and the trust
 * proposition screen the original inventory calls S27.
 *
 * It is an explainer, not the flow: creating a Trust Link requires a saved
 * property and a signed-in buyer, so the flow itself stays behind the guard.
 *
 * The privacy section carries the `#privacy` anchor the footer points at.
 */
export default function TrustLinkPage() {
  const steps = [
    {
      title: "You choose what you need",
      body: "One of four services. Nothing is sent by choosing.",
      icon: Eye,
    },
    {
      title: "You choose who",
      body: "Read as many profiles as you like. They don't know you're looking.",
      icon: UserCheck,
    },
    {
      title: "You choose what they see",
      body: "Item by item. Everything optional starts switched off.",
      icon: Lock,
    },
    {
      title: "They accept, and only then it opens",
      body: "The professional sees the purpose and the area before deciding. Nothing else.",
      icon: Check,
    },
    {
      title: "It ends by itself",
      body: "You set the period. You can withdraw sooner, and access stops immediately.",
      icon: Clock,
    },
  ];

  return (
    <PublicShell>
      {/* -------------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        <div aria-hidden="true" className="grain absolute inset-0" />
        <Container className="relative py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-overline uppercase text-white/55">Trust Link</p>
            <h1 className="mt-4 text-display text-white">
              A permission record, not a lead form
            </h1>
            <p className="measure mt-6 text-body-lg text-white/75">
              Everywhere else, asking a question about a property means handing
              over your details and waiting for the calls. A Trust Link is the
              opposite: you decide who, what, how and for how long — and you can
              take it back.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-14 md:py-20">
        {/* ------------------------------------------------------- the steps */}
        <section aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-h2 text-fg-heading">
            How it works
          </h2>
          <ol className="mt-10 divide-y divide-line-subtle border-y border-line-subtle">
            {steps.map((step, i) => (
              <li key={step.title} className="grid gap-4 py-6 md:grid-cols-[auto_1fr_1fr] md:gap-8">
                <p
                  aria-hidden="true"
                  className="tabular text-body-sm font-semibold text-line-strong md:pt-1"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="flex items-start gap-3">
                  <step.icon
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-action"
                  />
                  <h3 className="text-body font-semibold text-fg-heading">
                    {step.title}
                  </h3>
                </div>
                <p className="text-body-sm text-fg-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ----------------------------------------------------- the services */}
        <section aria-labelledby="services-heading" className="mt-20">
          <h2 id="services-heading" className="text-h2 text-fg-heading">
            What you can ask for
          </h2>
          <p className="measure mt-4 text-body text-fg-secondary">
            Four to start with. More categories come later.
          </p>
          <RevealGroup
            className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle md:grid-cols-2"
            stagger={0.05}
          >
            {SERVICES.map((service) => (
              <RevealItem key={service.key}>
                <div className="h-full bg-surface-card p-6">
                  <h3 className="text-h4 text-fg-heading">{service.label}</h3>
                  <p className="mt-2 text-body-sm text-fg-secondary">
                    {service.need}
                  </p>
                  <p className="measure mt-3 text-body-sm text-fg-muted">
                    {service.blurb}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* ---------------------------------------------------------- privacy */}
        <section
          id="privacy"
          aria-labelledby="privacy-heading"
          className="mt-20 scroll-mt-24 border-t border-line-subtle pt-14"
        >
          <h2 id="privacy-heading" className="text-h2 text-fg-heading">
            Your privacy and control
          </h2>
          <p className="measure mt-4 text-body-lg text-fg-secondary">
            You are not the product. We don&apos;t sell leads, and nothing about
            you reaches a professional without a Trust Link you authorised.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-line-subtle bg-surface-card p-6">
              <h3 className="flex items-center gap-2 text-h4 text-fg-heading">
                <Check aria-hidden="true" className="size-4 text-action" />
                What a professional can see
              </h3>
              <p className="mt-2 text-body-sm text-fg-muted">
                Only what you switch on. Every one of these starts off except the
                property address, which the service cannot be done without.
              </p>
              <ul className="mt-5 space-y-2.5">
                {SCOPE_ITEMS.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2.5 text-body-sm text-fg-secondary"
                  >
                    {item.required ? (
                      <Lock
                        aria-hidden="true"
                        className="mt-1 size-3 shrink-0 text-action"
                      />
                    ) : (
                      <X
                        aria-hidden="true"
                        className="mt-1 size-3 shrink-0 text-fg-muted"
                      />
                    )}
                    <span>
                      {item.label}
                      {item.required && (
                        <span className="text-fg-muted"> — required</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-transparent bg-trustlink-wash p-6">
              <h3 className="flex items-center gap-2 text-h4 text-fg-heading">
                <ShieldCheck aria-hidden="true" className="size-4 text-action" />
                What never happens
              </h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Your details are sold or passed to a third party.",
                  "A professional is notified because you read their profile.",
                  "An enquiry form sends your number to an agent.",
                  "A Trust Link is widened without you doing it yourself.",
                  "Access continues after the period you set.",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-body-sm text-fg-secondary"
                  >
                    <X aria-hidden="true" className="mt-1 size-3 shrink-0 text-action" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Reveal>
          <section className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-line-subtle bg-surface-card p-8">
            <div className="min-w-0">
              <h2 className="text-h3 text-fg-heading">
                Ready when you are
              </h2>
              <p className="measure mt-2 text-body text-fg-secondary">
                Save the property you&apos;re considering, then create a Trust Link
                from your journey.
              </p>
            </div>
            <ButtonLink href={routes.search()} variant="primary" size="lg">
              Find a property
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </section>
        </Reveal>
      </Container>
    </PublicShell>
  );
}
