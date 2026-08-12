"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import { routes } from "@/lib/routes";
import { SEED_JOURNEY } from "@/lib/mock/seed";

/**
 * S02 — Save boundary. **The highest drop-off screen in the funnel.**
 *
 * FR-01-15 — the boundary MUST explain WHY in terms of user benefit.
 * `ENT-03`  — anything already entered MUST survive the boundary.
 *
 * So the screen is built around the thing the user just typed. Their property is
 * shown, held, above the form — the message is "this is safe, and here is what
 * keeps it", not "register to continue". No feature list, no plan comparison, no
 * social proof: one reason, one form, one button.
 *
 * There is no real authentication in this prototype. The form takes a first name
 * so the rest of the product can address the user, and creating the Prop ID
 * commits the held property (which is `ENT-03` demonstrated rather than
 * described).
 */
export function SaveBoundary() {
  const router = useRouter();
  const { pendingProperty, createPropId } = useJourneyStore();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (firstName.trim().length === 0) {
      setError("A first name is enough — we use it to address you.");
      return;
    }
    const { id } = createPropId(firstName);
    router.push(
      id
        ? routes.property(SEED_JOURNEY.id, id)
        : routes.journey(SEED_JOURNEY.id),
    );
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ----------------------------------------------------------- the ask */}
      <div className="flex items-center justify-center px-5 py-14 md:px-10">
        <div className="w-full max-w-md">
          <p className="text-overline uppercase text-fg-muted">
            One step to keep this
          </p>
          <h1 className="mt-4 text-h1 text-fg-heading">
            Your Prop ID keeps your journey
          </h1>

          {/* The reason, in terms of what the user gets — FR-01-15 */}
          <p className="measure mt-5 text-body-lg text-fg-secondary">
            It&apos;s the record that holds your properties, your notes and your
            comparisons — so you can close this tab, come back in a month, and
            pick up exactly where you left off.
          </p>

          {/* What they already entered, held and visible — ENT-03 */}
          {pendingProperty && (
            <div className="mt-8 rounded-xl border border-line-subtle bg-trustlink-wash p-4">
              <p className="flex items-center gap-2 text-body-sm font-medium text-fg-heading">
                <Check aria-hidden="true" className="size-4 shrink-0 text-action" />
                Ready to save
              </p>
              <p className="mt-1.5 text-body-sm text-fg-secondary">
                {pendingProperty.address}, {pendingProperty.suburb}
                {pendingProperty.note && (
                  <>
                    {" "}
                    — with your note. Nothing you&apos;ve typed is lost.
                  </>
                )}
              </p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-8 space-y-5"
          >
            <Field label="First name">
              {({ id, invalid }) => (
                <Input
                  id={id}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={invalid || undefined}
                  autoComplete="given-name"
                  autoFocus
                />
              )}
            </Field>

            <Field
              label="Email"
              optional
              hint="Used to sign you back in. It is never shared with a professional unless you authorise a Trust Link."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  type="email"
                  aria-describedby={describedBy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              )}
            </Field>

            {error && (
              <p role="alert" className="text-body-sm text-danger-fg">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth className="group">
              Create my Prop ID
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              />
            </Button>

            <p className="flex items-start gap-2.5 text-body-sm text-fg-muted">
              <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>
                This is a prototype — nothing is sent anywhere and no account is
                created. Your journey is kept in this browser only.
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* --------------------------------------------------------- reassurance
          The photograph is present immediately, never revealed by script. */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/img/home-interior.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "var(--hero-scrim-v)" }}
        />
        <div aria-hidden="true" className="grain absolute inset-0" />

        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <ul className="space-y-5">
            {[
              "Your notes and rankings, kept exactly as you wrote them.",
              "Nothing is visible to any professional until you authorise it.",
              "Come back whenever — the journey waits where you left it.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-body-lg text-white/85">
                <Check
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-green-400"
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
