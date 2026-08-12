"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Info, ShieldCheck } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Textarea } from "@/components/ui/field";
import { RailPanel } from "@/components/ui/page";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SERVICES } from "@/lib/mock/marketplace";
import type { ServiceKey } from "@/lib/mock/types";

/**
 * Professional application — the [C-03] reconciliation in practice.
 *
 * This creates a `pending` application, not an account and not a listing. The
 * copy is explicit about that, because the difference is the whole point of the
 * conflict: the client wants professionals to arrive through the website, the
 * original requirement wants TPH to control who is published. Both are satisfied
 * by an application an admin must review.
 *
 * The credential field is labelled as a CLAIM. Nothing here is presented as
 * checked by TPH — PRO-05 forbids that, and only an admin recording a check can
 * produce published verification wording.
 */
export default function ApplyPage() {
  const reduce = useReducedMotion();
  const { submitApplication } = useJourneyStore();

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [serviceKey, setServiceKey] = useState<ServiceKey>("building_inspector");
  const [area, setArea] = useState("");
  const [approach, setApproach] = useState("");
  const [credential, setCredential] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!businessName.trim() || !contactName.trim()) {
      setError("We need a business name and a contact name.");
      return;
    }
    if (!email.trim()) {
      setError("Add an email so we can come back to you.");
      return;
    }
    submitApplication({
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      serviceKey,
      area: area.trim(),
      approach: approach.trim(),
      claimedCredential: credential.trim()
        ? `${credential.trim()} (claimed, not yet checked)`
        : "Nothing stated",
      email: email.trim(),
      phone: phone.trim(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PublicShell>
        <Container className="py-20 md:py-28">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-xl text-center"
          >
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-bg text-success-fg">
              <Check aria-hidden="true" className="size-6" />
            </span>
            <h1 className="mt-6 text-h1 text-fg-heading">
              Application received
            </h1>
            <p className="measure mx-auto mt-5 text-body-lg text-fg-secondary">
              It sits with our team as <strong>pending</strong>. Nothing is
              published, and no buyer can see you, until someone has checked your
              credential and recorded what they checked.
            </p>
            <p className="mx-auto mt-6 max-w-md rounded-xl bg-surface-sunken p-4 text-body-sm text-fg-muted">
              In this prototype you can watch that happen: sign in as the admin
              account and your application appears in the review queue.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/sign-in" variant="primary">
                Sign in as admin to review it
              </ButtonLink>
              <ButtonLink href="/for-professionals" variant="secondary">
                Back
              </ButtonLink>
            </div>
          </motion.div>
        </Container>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <Container className="py-12 md:py-16">
        <Link
          href="/for-professionals"
          className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          For professionals
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <h1 className="text-h1 text-fg-heading">Apply to be listed</h1>
            <p className="measure mt-4 text-body-lg text-fg-secondary">
              Brisbane, four service categories. Takes a couple of minutes.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="mt-10 space-y-8"
            >
              <section>
                <h2 className="text-h4 text-fg-heading">What you do</h2>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {SERVICES.map((s) => (
                    <ChoiceRow
                      key={s.key}
                      type="radio"
                      name="service"
                      value={s.key}
                      checked={serviceKey === s.key}
                      onChange={() => setServiceKey(s.key)}
                      label={s.label}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <h2 className="text-h4 text-fg-heading">Your business</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Business name">
                    {({ id }) => (
                      <Input
                        id={id}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Sandgate Building Reports"
                        autoComplete="organization"
                      />
                    )}
                  </Field>
                  <Field label="Your name">
                    {({ id }) => (
                      <Input
                        id={id}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Marcus Hale"
                        autoComplete="name"
                      />
                    )}
                  </Field>
                  <Field label="Areas you cover" optional>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="Brisbane north"
                      />
                    )}
                  </Field>
                  <Field
                    label="Licence or registration number"
                    optional
                    hint="We check this before you are listed. Until then it is recorded as your claim, not as verified."
                  >
                    {({ id, describedBy }) => (
                      <Input
                        id={id}
                        aria-describedby={describedBy}
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        placeholder="QBCC 1234567"
                      />
                    )}
                  </Field>
                </div>

                <Field
                  label="How you work"
                  optional
                  hint="What a buyer should know. This becomes your profile text if you are listed."
                >
                  {({ id, describedBy }) => (
                    <Textarea
                      id={id}
                      aria-describedby={describedBy}
                      value={approach}
                      onChange={(e) => setApproach(e.target.value)}
                      placeholder="Pre-purchase inspections across the northern suburbs, reports within 24 hours."
                    />
                  )}
                </Field>
              </section>

              <section className="space-y-5">
                <h2 className="text-h4 text-fg-heading">How we reach you</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Email">
                    {({ id }) => (
                      <Input
                        id={id}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    )}
                  </Field>
                  <Field label="Phone" optional>
                    {({ id }) => (
                      <Input
                        id={id}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        placeholder="0400 000 000"
                      />
                    )}
                  </Field>
                </div>
              </section>

              {error && (
                <p role="alert" className="text-body-sm text-danger-fg">
                  {error}
                </p>
              )}

              <div className="border-t border-line-subtle pt-6">
                <Button type="submit" variant="primary" size="lg">
                  Send application
                </Button>
                <p className="mt-3 text-body-sm text-fg-muted">
                  This creates an application, not an account.
                </p>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-5 lg:sticky lg:top-24">
              <RailPanel title="What happens next" tone="sunken">
                <ol className="space-y-3 text-body-sm text-fg-secondary">
                  <li>1. We receive your application as pending.</li>
                  <li>
                    2. Someone checks your credential and records what they
                    checked, and the date.
                  </li>
                  <li>
                    3. If it holds up, your profile is published with that check
                    beside it.
                  </li>
                </ol>
              </RailPanel>

              <RailPanel tone="wash">
                <p className="flex items-start gap-3 text-body-sm text-fg-secondary">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                  <span>
                    <span className="block font-medium text-fg-heading">
                      No pay-per-lead
                    </span>
                    Buyers choose you. There is no bidding for position and no
                    charge for a request.
                  </span>
                </p>
              </RailPanel>

              <p className="flex items-start gap-2.5 text-caption text-fg-muted">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                Demonstration prototype — nothing is sent anywhere, and the
                application is stored in this browser only.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </PublicShell>
  );
}
