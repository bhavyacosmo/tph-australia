"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send, ShieldAlert } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PhotoPicker } from "@/components/onboarding/photo-picker";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Select, Textarea } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import { SERVICES } from "@/lib/mock/marketplace";
import { CREDENTIAL_OPTIONS, SERVICE_TASKS } from "@/lib/mock/platform";
import { HOME_FOR } from "@/lib/mock/accounts";
import { cn } from "@/lib/utils";
import type { ServiceKey } from "@/lib/mock/types";

/**
 * A professional's first screen after signing in.
 *
 * Replaces the previous behaviour, where signing in as a professional dropped
 * you straight into a finished profile you had never written — which made the
 * verification step look decorative, because nothing had ever been unverified.
 *
 * **The submit does not publish anything.** It creates a `pending` application.
 * Until an admin approves it, this professional does not exist in the directory,
 * on the homepage, or in the Trust Link picker, and no buyer can reach them.
 * That gate is enforced in the store, not here — see `professionals` in
 * journey-store.tsx.
 *
 * Three steps, because thirteen fields on one screen is how you get abandoned
 * halfway. Each step is one question a professional can answer without looking
 * anything up.
 *
 * ⚠️ Nothing entered here is verified by this form. The credential is captured
 * as a CLAIM and shown to the admin as one (PRO-05); the published wording on
 * the profile is derived from what the admin says they checked, never from
 * this.
 */

const STEPS = ["You", "Your work", "About you"] as const;

export function ProfessionalOnboarding() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { session, saveProfile, submitApplication } = useJourneyStore();

  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* step 1 */
  const [contactName, setContactName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");

  /* step 2 */
  const [serviceKey, setServiceKey] = useState<ServiceKey | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");

  /* step 3 */
  const [experience, setExperience] = useState("");
  const [approach, setApproach] = useState("");
  const [feeNote, setFeeNote] = useState("");
  const [credential, setCredential] = useState(CREDENTIAL_OPTIONS[0]);
  const [credentialRef, setCredentialRef] = useState("");
  const [declared, setDeclared] = useState(false);

  const validate = (index: number): boolean => {
    const next: Record<string, string> = {};

    if (index === 0) {
      if (!contactName.trim()) next.contactName = "Buyers see this name.";
      if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()))
        next.email = "That doesn't look like an email address.";
    }
    if (index === 1) {
      if (serviceKey === null) next.serviceKey = "Choose the service you offer.";
      if (!businessName.trim())
        next.businessName = "The name buyers will see. Your own name is fine.";
      if (!area.trim()) next.area = "Roughly where do you work?";
    }
    if (index === 2) {
      if (approach.trim().length < 30)
        next.approach =
          "A sentence or two. This is what a buyer reads before choosing you.";
      if (!declared)
        next.declared = "Please confirm before submitting.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = () => {
    if (!validate(2) || !serviceKey) return;

    setPending(true);
    window.setTimeout(() => {
      const applicationId = submitApplication({
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        serviceKey,
        area: area.trim(),
        approach: approach.trim(),
        claimedCredential: credentialRef.trim()
          ? `${credential} ${credentialRef.trim()} (claimed, not yet checked)`
          : `${credential} (claimed, not yet checked)`,
        email: email.trim(),
        phone: session?.phone ?? "",
        photoUrl,
        age: age.trim() || null,
        experience: experience.trim(),
        services,
        serviceAreas: serviceAreas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        feeNote: feeNote.trim() || null,
      });

      saveProfile({
        fullName: contactName.trim(),
        phone: session?.phone ?? "",
        email: email.trim(),
        photoUrl,
        professionalApplicationId: applicationId,
      });

      router.push(HOME_FOR.professional);
    }, 750);
  };

  const tasks = serviceKey ? (SERVICE_TASKS[serviceKey] ?? []) : [];

  return (
    <OnboardingShell
      role="professional"
      eyebrow="Welcome"
      title="Set up your professional profile"
      intro="Buyers choose between people they have never met, so this is what they read. When you submit it, The Property Helpline reviews it before you appear anywhere."
    >
      {/* ------------------------------------------------------------- steps */}
      <ol className="flex flex-wrap gap-x-6 gap-y-3">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-caption font-semibold transition-colors duration-[var(--duration-base)]",
                i < step && "bg-action text-action-fg",
                i === step && "bg-brand text-brand-fg",
                i > step && "bg-surface-sunken text-fg-muted",
              )}
            >
              {i < step ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-body-sm",
                i === step ? "font-medium text-fg-heading" : "text-fg-muted",
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <motion.div
        key={step}
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-9"
      >
        {/* ============================================================ 1 · you */}
        {step === 0 && (
          <div className="space-y-7">
            <Field label="Your name" error={errors.contactName}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Craig Mullins"
                  autoComplete="name"
                  autoFocus
                />
              )}
            </Field>

            <div className="rounded-2xl border border-line-subtle bg-surface-card p-5">
              <PhotoPicker
                value={photoUrl}
                onChange={setPhotoUrl}
                name={contactName}
                hint="Strongly recommended. A buyer is deciding whether to let you into their home."
              />
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              <Field
                label="Age"
                optional
                hint="Shown to The Property Helpline only, never to a buyer."
              >
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    inputMode="numeric"
                    maxLength={3}
                    value={age}
                    onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                    placeholder="38"
                  />
                )}
              </Field>

              <Field label="Email" optional error={errors.email}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    type="email"
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="craig@buildcheck.example"
                    autoComplete="email"
                  />
                )}
              </Field>
            </div>
          </div>
        )}

        {/* ======================================================= 2 · the work */}
        {step === 1 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-body-sm font-medium text-fg-heading">
                What do you do?
              </legend>
              <p className="mt-1 text-body-sm text-fg-muted">
                This decides which requests reach you. Only these four services
                are open at this stage.
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <ChoiceRow
                    key={s.key}
                    type="radio"
                    name="serviceKey"
                    value={s.key}
                    checked={serviceKey === s.key}
                    onChange={() => {
                      setServiceKey(s.key);
                      setServices([]);
                    }}
                    label={s.label}
                    description={s.need}
                  />
                ))}
              </div>
              {errors.serviceKey && (
                <p role="alert" className="mt-3 text-body-sm text-danger-fg">
                  {errors.serviceKey}
                </p>
              )}
            </fieldset>

            <Field
              label="Business name"
              hint="What appears on your profile. Your own name is fine if you work under it."
              error={errors.businessName}
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="BuildCheck"
                />
              )}
            </Field>

            {/* Revealed once a service is chosen — the list depends on it. */}
            {tasks.length > 0 && (
              <motion.fieldset
                initial={reduce ? undefined : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <legend className="text-body-sm font-medium text-fg-heading">
                  Which jobs do you take on?
                </legend>
                <p className="mt-1 text-body-sm text-fg-muted">
                  Optional. Pick everything that applies.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tasks.map((task) => {
                    const on = services.includes(task);
                    return (
                      <label
                        key={task}
                        className={cn(
                          "relative flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-body-sm",
                          "transition-[border-color,background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                          on
                            ? "border-action bg-trustlink-wash font-medium text-fg-heading"
                            : "border-line-subtle bg-surface-card text-fg-secondary hover:border-line",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setServices((prev) =>
                              on
                                ? prev.filter((x) => x !== task)
                                : [...prev, task],
                            )
                          }
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-line-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-page"
                        />
                        {on && <Check aria-hidden="true" className="size-3.5 text-action" />}
                        {task}
                      </label>
                    );
                  })}
                </div>
              </motion.fieldset>
            )}

            <div className="grid gap-7 sm:grid-cols-2">
              <Field label="Area you work in" error={errors.area}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Brisbane southside"
                  />
                )}
              </Field>

              <Field
                label="Suburbs you cover"
                optional
                hint="Separate them with commas."
              >
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    value={serviceAreas}
                    onChange={(e) => setServiceAreas(e.target.value)}
                    placeholder="Carindale, Camp Hill, Coorparoo"
                  />
                )}
              </Field>
            </div>
          </div>
        )}

        {/* ========================================================= 3 · about */}
        {step === 2 && (
          <div className="space-y-7">
            <Field
              label="How you work"
              hint="What you actually do, and how quickly. This is the paragraph a buyer reads before choosing you."
              error={errors.approach}
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="Pre-purchase inspections with a same-day verbal summary and a written report within two business days."
                />
              )}
            </Field>

            <Field
              label="Experience"
              optional
              hint="In plain words. There are no ratings or review counts on this platform."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="12 years · 4,000+ Brisbane inspections"
                />
              )}
            </Field>

            <Field
              label="Indicative fee"
              optional
              hint="A range is fine. Buyers strongly prefer a number to “contact for a quote”."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={feeNote}
                  onChange={(e) => setFeeNote(e.target.value)}
                  placeholder="Indicative $550–$690 depending on property size"
                />
              )}
            </Field>

            {/* ------------------------------------------------- the claim */}
            <div className="rounded-2xl border border-line-subtle bg-surface-sunken p-5">
              <p className="text-body-sm font-medium text-fg-heading">
                What do you hold?
              </p>
              <p className="mt-1 text-body-sm text-fg-muted">
                We record this as your claim. What appears on your public profile
                is written from what The Property Helpline actually checks —
                never from this field.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Credential">
                  {({ id }) => (
                    <Select
                      id={id}
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                    >
                      {CREDENTIAL_OPTIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Number or reference" optional>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={credentialRef}
                      onChange={(e) => setCredentialRef(e.target.value)}
                      placeholder="1234567"
                    />
                  )}
                </Field>
              </div>
            </div>

            <ChoiceRow
              type="checkbox"
              name="declared"
              value="declared"
              checked={declared}
              onChange={setDeclared}
              label="Everything here is true and current"
              description="The Property Helpline reviews it before your profile goes live."
            />
            {errors.declared && (
              <p role="alert" className="text-body-sm text-danger-fg">
                {errors.declared}
              </p>
            )}

            <p className="flex items-start gap-3 rounded-xl bg-trustlink-wash p-4 text-body-sm text-fg-secondary">
              <ShieldAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-action"
              />
              <span>
                Submitting sends this for review. You will not appear in the
                directory, on the homepage, or in any buyer&apos;s Trust Link
                until it is approved — and no buyer can reach you before then.
              </span>
            </p>
          </div>
        )}
      </motion.div>

      {/* ------------------------------------------------------------ actions */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line-subtle pt-7">
        {step > 0 && (
          <Button variant="secondary" size="md" onClick={back}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button variant="primary" size="md" onClick={next} className="group">
            Continue
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            loading={pending}
            onClick={submit}
          >
            <Send aria-hidden="true" className="size-4" />
            Submit for verification
          </Button>
        )}

        <p className="ml-auto text-caption text-fg-muted">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </OnboardingShell>
  );
}
