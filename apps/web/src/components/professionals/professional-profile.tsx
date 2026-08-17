"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Info, MapPin, ShieldOff } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, RailPanel } from "@/components/ui/page";
import { useJourneyStore } from "@/lib/store/journey-store";
import { Reveal } from "@/components/motion/reveal";
import {
  ProfessionalAvatar,
  VerificationBadge,
} from "@/components/domain/professional-card";
import { serviceFor } from "@/lib/mock/marketplace";
import { routes } from "@/lib/routes";
import type { Professional } from "@/lib/mock/types";

/**
 * S21 — Professional profile.
 *
 * FR-06-06/07 · PRO-05 — the verification line states WHAT was checked and WHEN.
 * [C-16] — the action is "Request via Trust Link", not "Connect".
 * [C-15], [C-D/E/F] — no rating, no review count, no photograph of a person we
 * do not have permission to show, no phone number, no email.
 *
 * Viewing this page does not create anything. The client's own model has the
 * professional only hearing about a buyer once a Trust Link reaches their login
 * (transcript L197-203), and this screen holds that line.
 */
export function ProfessionalProfile({
  professionalId,
}: {
  professionalId: string;
}) {
  /* Resolved from the store: a professional an admin approved in this session
     is not in the seed module, and a suspended one must 404 rather than linger
     at a shareable URL. */
  const { getProfessional } = useJourneyStore();
  const professional = getProfessional(professionalId);

  if (!professional) {
    return (
      <PublicShell>
        <Container className="py-20">
          <EmptyState
            title="That profile isn't available"
            body="It may have been withdrawn, or the link may be out of date."
            action={
              <ButtonLink href={routes.professionals()} variant="primary" size="md">
                See all professionals
              </ButtonLink>
            }
          />
        </Container>
      </PublicShell>
    );
  }

  const service = serviceFor(professional.serviceKey);

  return (
    <PublicShell>
      <Container className="py-10 md:py-14">
        <Link
          href={routes.professionals()}
          className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All professionals
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* --------------------------------------------------------- main */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal>
              <div className="flex flex-wrap items-start gap-6">
                <ProfessionalAvatar
                  professional={professional}
                  className="size-20"
                />
                <div className="min-w-0">
                  <p className="text-overline uppercase text-fg-muted">
                    {professional.category}
                  </p>
                  <h1 className="mt-2 text-h1 text-fg-heading">
                    {professional.name}
                  </h1>
                  {professional.contactName && (
                    <p className="mt-1 text-body-lg text-fg-secondary">
                      {professional.contactName}
                    </p>
                  )}
                  <p className="mt-2 flex items-center gap-1.5 text-body text-fg-muted">
                    <MapPin aria-hidden="true" className="size-4 shrink-0" />
                    {professional.area}
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="mt-8">
              <VerificationBadge professional={professional} size="md" />
            </div>

            <section aria-labelledby="approach-heading" className="mt-10">
              <h2 id="approach-heading" className="text-h3 text-fg-heading">
                How they work
              </h2>
              <p className="measure mt-4 text-body text-fg-secondary">
                {professional.approach}
              </p>
            </section>

            <section aria-labelledby="detail-heading" className="mt-10">
              <h2 id="detail-heading" className="text-h4 text-fg-heading">
                The detail
              </h2>
              <dl className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
                <Row label="Service" value={service.label} />
                <Row label="Experience" value={professional.experience} />
                <Row
                  label="Areas covered"
                  value={professional.serviceAreas.join(" · ")}
                />
                <Row
                  label="Indicative fee"
                  value={
                    professional.feeNote ?? "Not published — ask when you connect"
                  }
                />
                <Row
                  label="What we checked"
                  value={
                    professional.verification
                      ? `${professional.verification.what}, on ${professional.verification.checkedOn}`
                      : "Nothing yet. We have not reviewed this business."
                  }
                />
              </dl>
            </section>

            <p className="mt-10 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                Being listed here is not a recommendation and not a guarantee of
                the work. We publish what we checked so you can judge it for
                yourself — and you should still ask for their licence number and
                insurance before engaging anyone.
              </span>
            </p>
          </div>

          {/* --------------------------------------------------------- rail */}
          <div className="lg:col-span-5">
            <div className="space-y-5 lg:sticky lg:top-24">
              <RailPanel>
                <h2 className="text-h4 text-fg-heading">
                  Ready to bring them in?
                </h2>
                <p className="mt-2 text-body-sm text-fg-secondary">
                  A Trust Link is how you connect. You choose the property, what
                  they can see, how they may contact you, and for how long —
                  before anything is sent.
                </p>
                {/* [C-16] — never "Connect" */}
                <ButtonLink
                  href={`${routes.trustLinkNew()}?service=${professional.serviceKey}&professional=${professional.id}`}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="group mt-5"
                >
                  Request via Trust Link
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </ButtonLink>
                <p className="mt-3 text-caption text-fg-muted">
                  Nothing is sent until you review and confirm.
                </p>
              </RailPanel>

              <RailPanel tone="wash">
                <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                  <ShieldOff
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                  <span>
                    <span className="block font-medium text-fg-heading">
                      They don&apos;t know you&apos;re reading this
                    </span>
                    No notification, no enquiry, no contact details. Opening a
                    profile creates nothing.
                  </span>
                </p>
              </RailPanel>
            </div>
          </div>
        </div>
      </Container>
    </PublicShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="text-body-sm text-fg-muted">{label}</dt>
      <dd className="text-body-sm text-fg">{value}</dd>
    </div>
  );
}
