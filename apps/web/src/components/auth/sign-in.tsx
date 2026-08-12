"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNTS, HOME_FOR, ROLE_LABEL } from "@/lib/mock/accounts";
import { useJourneyStore } from "@/lib/store/journey-store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock/types";

/**
 * Sign in.
 *
 * ⚠️ MOCK AUTHENTICATION. Credentials are checked in the browser against
 * constants and the session is a localStorage object. See
 * src/lib/mock/accounts.ts for the full list of what must replace this.
 *
 * Composition: a two-panel split — the left is the brand and the architecture
 * photograph already used across the product, the right is the form on a clean
 * surface. On a phone the panel collapses to a slim branded header so the form
 * is above the fold and the keyboard doesn't push it out of view.
 *
 * The demo-account block is styled as part of the product (a quiet card with the
 * three roles) rather than a developer panel, because the client will see it.
 */
export function SignIn({ next }: { next?: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { signIn } = useJourneyStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [filled, setFilled] = useState<Role | null>(null);

  const submit = () => {
    setError(null);

    if (!phone.trim() || !password) {
      setError("Enter your phone number and password.");
      return;
    }

    setPending(true);
    /* A short beat so the transition reads as a sign-in rather than a jump. */
    window.setTimeout(() => {
      const result = signIn(phone, password);
      if (!result.ok) {
        setError(result.message);
        setPending(false);
        return;
      }
      router.push(next && next.startsWith("/") ? next : HOME_FOR[result.role]);
    }, 550);
  };

  const useDemo = (role: Role) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!account) return;
    setPhone(account.phone);
    setPassword(account.password);
    setFilled(role);
    setError(null);
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ============================================================= brand */}
      <div className="relative isolate overflow-hidden bg-navy-900 lg:min-h-dvh">
        <Image
          src="/img/home-exterior.jpg"
          alt=""
          aria-hidden="true"
          fill
          preload
          loading="eager"
          fetchPriority="high"
          quality={72}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "var(--hero-scrim-v)" }}
        />
        <div aria-hidden="true" className="grain absolute inset-0" />

        <div className="relative flex h-full flex-col px-6 py-8 md:px-10 lg:px-14 lg:py-14">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/"
              className="inline-flex items-center rounded-md"
              aria-label="The Property Helpline — home"
            >
              <TphLogo variant="full" inverse />
            </Link>
          </motion.div>

          {/* The statement. Hidden on small screens so the form leads. */}
          <div className="mt-auto hidden lg:block">
            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg text-h1 text-white"
            >
              Your property journey, in one place you control.
            </motion.p>

            <motion.ul
              initial={reduce ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 space-y-4 border-t border-white/12 pt-8"
            >
              {[
                "Every property, note and decision kept together.",
                "Nothing shared with a professional until you authorise it.",
                "Come back whenever — it waits exactly where you left it.",
              ].map((line, i) => (
                <motion.li
                  key={line}
                  initial={reduce ? undefined : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.36 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-start gap-3 text-body-lg text-white/80"
                >
                  <Check
                    aria-hidden="true"
                    className="mt-1.5 size-4 shrink-0 text-green-400"
                  />
                  {line}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>

      {/* ============================================================== form */}
      <div className="flex items-center justify-center bg-surface-page px-5 py-12 md:px-10 lg:py-14">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to the homepage
          </Link>

          <h1 className="mt-6 text-h1 text-fg-heading">Sign in</h1>
          <p className="mt-3 text-body-lg text-fg-secondary">
            Pick up wherever you left off.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-9 space-y-5"
          >
            {/* ------------------------------------------------------ phone */}
            <div>
              <label
                htmlFor="phone"
                className="text-body-sm font-medium text-fg-heading"
              >
                Phone number
              </label>
              <div className="relative mt-2">
                <Phone
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
                />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFilled(null);
                  }}
                  aria-invalid={Boolean(error) || undefined}
                  placeholder="0400 000 000"
                  className={cn(
                    "h-12 w-full rounded-md border border-line bg-surface-card pl-10 pr-3.5 text-body text-fg",
                    "placeholder:text-fg-muted",
                    "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                    "hover:border-line-strong",
                    "aria-[invalid=true]:border-danger",
                  )}
                />
              </div>
            </div>

            {/* --------------------------------------------------- password */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label
                  htmlFor="password"
                  className="text-body-sm font-medium text-fg-heading"
                >
                  Password
                </label>
                {/* Visual only in this prototype, and it says so on click */}
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password recovery isn't part of this prototype. Use a demo account below.",
                    )
                  }
                  className="min-h-6 text-body-sm text-fg-link underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative mt-2">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFilled(null);
                  }}
                  aria-invalid={Boolean(error) || undefined}
                  placeholder="Your password"
                  className={cn(
                    "h-12 w-full rounded-md border border-line bg-surface-card pl-10 pr-12 text-body text-fg",
                    "placeholder:text-fg-muted",
                    "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                    "hover:border-line-strong",
                    "aria-[invalid=true]:border-danger",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  /* 44px, not 40 — it sits inside a 48px field and is used on
                     touch, so it has to meet the same floor as any other
                     control (RSP-05). */
                  className="absolute right-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-md text-fg-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-fg"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  key={error}
                  role="alert"
                  initial={reduce ? undefined : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-2 rounded-md border border-error-line bg-error-bg px-3.5 py-3 text-body-sm text-error-fg"
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={pending}
              className="group"
            >
              Sign in
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              />
            </Button>
          </form>

          {/* ==================================================== demo access */}
          <section
            aria-labelledby="demo-heading"
            className="mt-10 rounded-2xl border border-line-subtle bg-surface-card p-5"
          >
            <h2
              id="demo-heading"
              className="text-body-sm font-semibold text-fg-heading"
            >
              Demo access
            </h2>
            <p className="mt-1.5 text-body-sm text-fg-muted">
              Three example accounts, one for each experience. Choosing one fills
              the form — then sign in.
            </p>

            <ul className="mt-4 space-y-2">
              {DEMO_ACCOUNTS.map((account) => {
                const active = filled === account.role;
                return (
                  <li key={account.role}>
                    <button
                      type="button"
                      onClick={() => useDemo(account.role)}
                      className={cn(
                        "group flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left",
                        "transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                        active
                          ? "border-action bg-trustlink-wash"
                          : "border-line-subtle bg-surface-page hover:border-line",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full text-caption font-semibold",
                          active
                            ? "bg-action text-action-fg"
                            : "bg-brand text-brand-fg",
                        )}
                      >
                        {active ? (
                          <Check className="size-4" />
                        ) : (
                          ROLE_LABEL[account.role].charAt(0)
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body-sm font-medium text-fg-heading">
                          {ROLE_LABEL[account.role]}
                        </span>
                        <span className="block text-caption text-fg-muted">
                          {account.blurb}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-caption font-medium",
                          active ? "text-action" : "text-fg-muted",
                        )}
                      >
                        {active ? "Filled" : "Use"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Honest about what this is */}
          <p className="mt-6 flex items-start gap-2.5 text-caption text-fg-muted">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            Demonstration prototype. Sign-in is simulated in your browser — no
            account is created and nothing is sent anywhere.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
