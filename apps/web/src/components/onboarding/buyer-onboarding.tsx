"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PhotoPicker } from "@/components/onboarding/photo-picker";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import { HOME_FOR } from "@/lib/mock/accounts";

/**
 * A buyer's first screen after signing in.
 *
 * Short on purpose. A buyer is here to look at properties, and every field
 * between them and that is a reason to leave — so this asks only what the
 * product genuinely uses: a name to address them by, and an email that appears
 * in Prop ID. Everything else about them is collected later, in Home Compass,
 * where it is doing work.
 *
 * FR-05-02 — the phone number is held but private. It is shown here as
 * confirmation of who they signed in as, and it is never shared with a
 * professional or a seller unless they switch it on themselves.
 */
export function BuyerOnboarding() {
  const router = useRouter();
  const { session, saveProfile } = useJourneyStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [pending, setPending] = useState(false);

  const submit = () => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = "Tell us what to call you.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "That doesn't look like an email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    window.setTimeout(() => {
      saveProfile({
        fullName: fullName.trim(),
        phone: session?.phone ?? "",
        email: email.trim(),
        photoUrl,
      });
      router.push(HOME_FOR.buyer);
    }, 550);
  };

  return (
    <OnboardingShell
      role="buyer"
      eyebrow="Welcome"
      title="First — who are you?"
      intro="Two details, so the record we build is yours and we can address you properly. You can change them any time."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-7"
      >
        <Field label="Your name" error={errors.fullName}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Whitfield"
              autoComplete="name"
              autoFocus
            />
          )}
        </Field>

        <Field
          label="Email"
          optional
          hint="Where a copy of anything you save would go. Never shared without a Trust Link."
          error={errors.email}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              autoComplete="email"
            />
          )}
        </Field>

        <div className="rounded-2xl border border-line-subtle bg-surface-card p-5">
          <PhotoPicker
            value={photoUrl}
            onChange={setPhotoUrl}
            name={fullName}
            hint="Optional, and only ever seen by you."
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-line-subtle pt-7">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={pending}
            className="group"
          >
            Start looking
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            />
          </Button>
          <p className="text-body-sm text-fg-muted">
            Signed in as {session?.phone}
          </p>
        </div>
      </form>
    </OnboardingShell>
  );
}
