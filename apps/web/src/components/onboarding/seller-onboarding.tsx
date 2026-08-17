"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PhotoPicker } from "@/components/onboarding/photo-picker";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import { HOME_FOR } from "@/lib/mock/accounts";
import type { AgentStructure, SellerDealsIn, SellerKind } from "@/lib/mock/types";

/**
 * A seller's first screen after signing in.
 *
 * The reason this exists before "List a property": a listing carries a person's
 * name to a buyer, and until now that name was a seeded one. Who is selling —
 * and whether they are the owner or an agent acting for one — changes what a
 * buyer is being told, so it is asked first rather than inferred.
 *
 * The agent questions REVEAL rather than sit there greyed out. An owner selling
 * their own home should never have to read a question about team size to work
 * out that it does not apply to them.
 *
 * ⚠️ SCOPE. TPH does not represent sellers and takes no part in a sale
 * ([C-32] in the conflict register). Nothing here is verified — an agent's
 * claim to be an agent is exactly that, a claim, and the profile says so.
 */

const KINDS: { value: SellerKind; label: string; description: string }[] = [
  {
    value: "owner",
    label: "I own the property",
    description: "Selling or letting your own home.",
  },
  {
    value: "agent",
    label: "I'm an agent",
    description: "Acting for the owner.",
  },
];

const STRUCTURES: { value: AgentStructure; label: string; description: string }[] =
  [
    {
      value: "individual",
      label: "On my own",
      description: "You handle your own listings.",
    },
    {
      value: "team",
      label: "Part of a team",
      description: "You work under an agency or team name.",
    },
  ];

const DEALS: { value: SellerDealsIn; label: string; description: string }[] = [
  { value: "sell", label: "Sales only", description: "Properties for sale." },
  { value: "rent", label: "Rentals only", description: "Properties to let." },
  { value: "both", label: "Both", description: "Sales and rentals." },
];

export function SellerOnboarding() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { session, saveProfile } = useJourneyStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<SellerKind | null>(null);
  const [structure, setStructure] = useState<AgentStructure | null>(null);
  const [teamName, setTeamName] = useState("");
  const [years, setYears] = useState("");
  const [dealsIn, setDealsIn] = useState<SellerDealsIn | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const isAgent = kind === "agent";

  const submit = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Buyers see this name on your listings.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "That doesn't look like an email address.";
    if (kind === null) next.kind = "Choose one so buyers know who they're dealing with.";
    if (isAgent && structure === null) next.structure = "Choose one.";
    if (isAgent && structure === "team" && !teamName.trim())
      next.teamName = "Name the agency or team.";
    if (dealsIn === null) next.dealsIn = "Choose what you list.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    window.setTimeout(() => {
      saveProfile({
        fullName: fullName.trim(),
        phone: session?.phone ?? "",
        email: email.trim(),
        photoUrl,
        seller: {
          kind: kind!,
          structure: isAgent ? structure : null,
          teamName: isAgent && structure === "team" ? teamName.trim() : null,
          yearsExperience: isAgent && years.trim() ? years.trim() : null,
          dealsIn: dealsIn!,
        },
      });
      router.push(HOME_FOR.seller);
    }, 600);
  };

  return (
    <OnboardingShell
      role="seller"
      eyebrow="Welcome"
      title="Set up your seller profile"
      intro="A buyer sees who they're enquiring to before they write to you. This takes a minute, and then you can list your first property."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-9"
      >
        {/* ------------------------------------------------------------- you */}
        <section className="space-y-7">
          <Field label="Your name" error={errors.fullName}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Michael Tran"
                autoComplete="name"
                autoFocus
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
                placeholder="michael@example.com"
                autoComplete="email"
              />
            )}
          </Field>

          <div className="rounded-2xl border border-line-subtle bg-surface-card p-5">
            <PhotoPicker
              value={photoUrl}
              onChange={setPhotoUrl}
              name={fullName}
              hint="Optional. Shown beside your name when a buyer enquires."
            />
          </div>
        </section>

        {/* ------------------------------------------------------ owner/agent */}
        <fieldset className="border-t border-line-subtle pt-7">
          <legend className="text-body-sm font-medium text-fg-heading">
            Are you the owner, or an agent?
          </legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {KINDS.map((k) => (
              <ChoiceRow
                key={k.value}
                type="radio"
                name="kind"
                value={k.value}
                checked={kind === k.value}
                onChange={() => {
                  setKind(k.value);
                  if (k.value === "owner") {
                    setStructure(null);
                    setTeamName("");
                    setYears("");
                  }
                }}
                label={k.label}
                description={k.description}
              />
            ))}
          </div>
          {errors.kind && (
            <p role="alert" className="mt-3 text-body-sm text-danger-fg">
              {errors.kind}
            </p>
          )}
        </fieldset>

        {/* Revealed only for agents — an owner never reads these. */}
        {isAgent && (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-7 rounded-2xl bg-surface-sunken p-5"
          >
            <fieldset>
              <legend className="text-body-sm font-medium text-fg-heading">
                Do you work alone or in a team?
              </legend>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {STRUCTURES.map((s) => (
                  <ChoiceRow
                    key={s.value}
                    type="radio"
                    name="structure"
                    value={s.value}
                    checked={structure === s.value}
                    onChange={() => setStructure(s.value)}
                    label={s.label}
                    description={s.description}
                  />
                ))}
              </div>
              {errors.structure && (
                <p role="alert" className="mt-3 text-body-sm text-danger-fg">
                  {errors.structure}
                </p>
              )}
            </fieldset>

            {structure === "team" && (
              <Field label="Agency or team name" error={errors.teamName}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Eastside Property Group"
                  />
                )}
              </Field>
            )}

            <Field
              label="Years selling property"
              optional
              hint="In your words. Shown on your profile, not checked by us."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="8 years"
                />
              )}
            </Field>
          </motion.div>
        )}

        {/* --------------------------------------------------------- listings */}
        <fieldset className="border-t border-line-subtle pt-7">
          <legend className="text-body-sm font-medium text-fg-heading">
            What do you list?
          </legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {DEALS.map((d) => (
              <ChoiceRow
                key={d.value}
                type="radio"
                name="dealsIn"
                value={d.value}
                checked={dealsIn === d.value}
                onChange={() => setDealsIn(d.value)}
                label={d.label}
                description={d.description}
              />
            ))}
          </div>
          {errors.dealsIn && (
            <p role="alert" className="mt-3 text-body-sm text-danger-fg">
              {errors.dealsIn}
            </p>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center gap-4 border-t border-line-subtle pt-7">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={pending}
            className="group"
          >
            Save and list a property
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Button>
          <p className="text-body-sm text-fg-muted">
            You&apos;ll land on your dashboard, ready to{" "}
            <span className="text-fg">list a property</span>.
          </p>
        </div>
      </form>
    </OnboardingShell>
  );
}
