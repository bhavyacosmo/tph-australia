"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { Button } from "@/components/ui/button";
import {
  accountForRole,
  generateOtp,
  HOME_FOR,
  normalisePhone,
  ROLE_BLURB,
  ROLE_LABEL,
} from "@/lib/mock/accounts";
import { useJourneyStore } from "@/lib/store/journey-store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock/types";

/**
 * Sign in — four roles, mock one-time code.
 *
 * ⚠️ MOCK AUTHENTICATION. The code is generated in this browser and printed on
 * the screen, because there is no SMS provider. The panel that shows it says so
 * in plain words rather than pretending a message was sent. Everything else —
 * the account lookup, the admin password, the session — is constants and
 * localStorage. See src/lib/mock/accounts.ts for what must replace it.
 *
 * Three steps, not one screen of fields:
 *
 *   1. WHO — the four roles as real cards. The client's ask was "the website
 *      should provide four role options", and a role chooser is also the only
 *      honest way to present a demo where the reviewer picks an identity.
 *   2. IDENTIFIER — phone for the consumer roles, email for admin.
 *   3. PROOF — the six-digit code, or the admin password.
 *
 * The composition (photographic brand panel left, form right) is unchanged from
 * the previous single-step version, so the screen still belongs to the product.
 */

const ROLE_ICON: Record<Role, typeof Home> = {
  buyer: Home,
  seller: Store,
  professional: Briefcase,
  admin: ShieldCheck,
};

const ROLES: Role[] = ["buyer", "seller", "professional", "admin"];

type Step = "role" | "identify" | "verify";

export function SignIn({
  next,
  /** Arrives from `?role=` — the homepage panels link straight to a role. */
  initialRole,
}: {
  next?: string;
  initialRole?: Role;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { signIn } = useJourneyStore();

  const [step, setStep] = useState<Step>(initialRole ? "identify" : "role");
  const [role, setRole] = useState<Role | null>(initialRole ?? null);
  const [identifier, setIdentifier] = useState(() => {
    if (!initialRole) return "";
    const demo = accountForRole(initialRole);
    return demo.method === "password" ? (demo.email ?? "") : demo.phone;
  });
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const account = role ? accountForRole(role) : null;
  const usesPassword = account?.method === "password";

  /* Focus the field the step just revealed, so the keyboard follows the flow. */
  const identifierRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (step === "identify") identifierRef.current?.focus();
    if (step === "verify") proofRef.current?.focus();
  }, [step]);

  const chooseRole = (picked: Role) => {
    const demo = accountForRole(picked);
    setRole(picked);
    /* Prefilled, because this is a demonstration and asking a reviewer to
       memorise four phone numbers helps nobody. It stays editable. */
    setIdentifier(demo.method === "password" ? (demo.email ?? "") : demo.phone);
    setCode("");
    setPassword("");
    setSentCode(null);
    setError(null);
    setStep("identify");
  };

  const sendCode = () => {
    setError(null);

    if (!identifier.trim()) {
      setError(
        usesPassword ? "Enter your admin email." : "Enter your mobile number.",
      );
      return;
    }
    if (!usesPassword && normalisePhone(identifier).length < 8) {
      setError("That doesn't look like an Australian mobile number.");
      return;
    }

    setPending(true);
    /* A beat, so sending reads as a request rather than an instant reveal. */
    window.setTimeout(() => {
      if (!usesPassword) setSentCode(generateOtp());
      setPending(false);
      setStep("verify");
    }, 600);
  };

  const verify = () => {
    setError(null);

    if (usesPassword) {
      if (password !== account?.password) {
        setError("Those details don't match an account.");
        return;
      }
    } else if (code.replace(/\D/g, "") !== sentCode) {
      setError("That code doesn't match. Check the code above and try again.");
      return;
    }

    setPending(true);
    window.setTimeout(() => {
      const result = signIn(identifier);
      if (!result.ok) {
        setError(result.message);
        setPending(false);
        return;
      }
      /* A first-time person completes their profile before anything else —
         including before an intended `next`, which they can reach afterwards. */
      if (result.needsOnboarding) {
        router.push("/welcome");
        return;
      }
      router.push(next && next.startsWith("/") ? next : HOME_FOR[result.role]);
    }, 550);
  };

  const back = () => {
    setError(null);
    if (step === "verify") {
      setStep("identify");
      setCode("");
      setPassword("");
      return;
    }
    setStep("role");
    setRole(null);
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

          <div className="mt-auto hidden lg:block">
            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg text-h1 text-white"
            >
              One platform. Four ways to use it.
            </motion.p>

            <motion.ul
              initial={reduce ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 space-y-4 border-t border-white/12 pt-8"
            >
              {[
                "Buyers search, save, compare and hire — in one record they control.",
                "Sellers list a property and see who is genuinely interested.",
                "Professionals take work only when a buyer authorises it.",
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
          {step === "role" ? (
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to the homepage
            </Link>
          ) : (
            <button
              type="button"
              onClick={back}
              className="inline-flex min-h-11 items-center gap-2 rounded-md text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {step === "verify" ? "Change number" : "Choose a different role"}
            </button>
          )}

          <Steps step={step} />

          {/* The whole panel is keyed on the step so it mounts and rises in.
              No AnimatePresence wrapper: a throttled exit frame would leave the
              form blank, which this codebase has already had to fix once. */}
          <motion.div
            key={step}
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ================================================ 1 · who */}
            {step === "role" && (
              <>
                <h1 className="mt-6 text-h1 text-fg-heading">Sign in</h1>
                <p className="mt-3 text-body-lg text-fg-secondary">
                  Choose how you use The Property Helpline.
                </p>

                <ul className="mt-8 space-y-3">
                  {ROLES.map((r, i) => {
                    const Icon = ROLE_ICON[r];
                    return (
                      <motion.li
                        key={r}
                        initial={reduce ? undefined : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.06 * i,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => chooseRole(r)}
                          className={cn(
                            "group flex w-full items-center gap-4 rounded-xl border border-line-subtle bg-surface-card p-4 text-left",
                            "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                            "hover:-translate-y-0.5 hover:border-line hover:shadow-elev-hover",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-fg"
                          >
                            <Icon className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-body font-semibold text-fg-heading">
                              Login as {ROLE_LABEL[r]}
                            </span>
                            <span className="mt-0.5 block text-body-sm text-fg-secondary">
                              {ROLE_BLURB[r]}
                            </span>
                          </span>
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                          />
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* ========================================= 2 · identifier */}
            {step === "identify" && account && role && (
              <>
                <RoleBadge role={role} />
                <h1 className="mt-5 text-h1 text-fg-heading">
                  {usesPassword ? "Admin sign in" : "What's your mobile?"}
                </h1>
                <p className="mt-3 text-body-lg text-fg-secondary">
                  {usesPassword
                    ? "Internal access. In production this also requires MFA."
                    : "We'll send a six-digit code to confirm it's you."}
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendCode();
                  }}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="identifier"
                      className="text-body-sm font-medium text-fg-heading"
                    >
                      {usesPassword ? "Admin email" : "Mobile number"}
                    </label>
                    <div className="relative mt-2">
                      {usesPassword ? (
                        <Mail
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
                        />
                      ) : (
                        <Phone
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
                        />
                      )}
                      <input
                        ref={identifierRef}
                        id="identifier"
                        type={usesPassword ? "email" : "tel"}
                        inputMode={usesPassword ? "email" : "tel"}
                        autoComplete={usesPassword ? "email" : "tel"}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        aria-invalid={Boolean(error) || undefined}
                        placeholder={
                          usesPassword ? "you@propertyhelpline.example" : "0400 000 000"
                        }
                        className={FIELD}
                      />
                    </div>
                  </div>

                  <ErrorNote error={error} reduce={reduce} />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={pending}
                    className="group"
                  >
                    {usesPassword ? "Continue" : "Send code"}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </Button>
                </form>
              </>
            )}

            {/* ============================================== 3 · proof */}
            {step === "verify" && account && role && (
              <>
                <RoleBadge role={role} />
                <h1 className="mt-5 text-h1 text-fg-heading">
                  {usesPassword ? "Enter your password" : "Enter the code"}
                </h1>
                <p className="mt-3 text-body-lg text-fg-secondary">
                  {usesPassword ? (
                    <>Signing in as {identifier}.</>
                  ) : (
                    <>Sent to {identifier}. It&apos;s six digits.</>
                  )}
                </p>

                {/* ------------------------------------ the mock code */}
                {!usesPassword && sentCode && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-line bg-surface-sunken p-4">
                    <MessageSquare
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-fg-muted"
                    />
                    <div className="min-w-0">
                      <p className="text-caption font-semibold uppercase tracking-wider text-fg-muted">
                        Prototype — no SMS was sent
                      </p>
                      <p className="mt-1.5 text-body-sm text-fg-secondary">
                        There is no messaging provider connected. Your code is{" "}
                        <span className="tabular font-semibold tracking-[0.2em] text-fg-heading">
                          {sentCode}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verify();
                  }}
                  className="mt-6 space-y-5"
                >
                  {usesPassword ? (
                    <div>
                      <label
                        htmlFor="password"
                        className="text-body-sm font-medium text-fg-heading"
                      >
                        Password
                      </label>
                      <div className="relative mt-2">
                        <Lock
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
                        />
                        <input
                          ref={proofRef}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          aria-invalid={Boolean(error) || undefined}
                          placeholder="Your password"
                          className={cn(FIELD, "pr-12")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-pressed={showPassword}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-md text-fg-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-fg"
                        >
                          {showPassword ? (
                            <EyeOff aria-hidden="true" className="size-4" />
                          ) : (
                            <Eye aria-hidden="true" className="size-4" />
                          )}
                        </button>
                      </div>
                      <p className="mt-2 text-caption text-fg-muted">
                        Demo password: <span className="font-medium">password</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="code"
                        className="text-body-sm font-medium text-fg-heading"
                      >
                        Six-digit code
                      </label>
                      <div className="relative mt-2">
                        <KeyRound
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
                        />
                        <input
                          ref={proofRef}
                          id="code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={code}
                          onChange={(e) =>
                            setCode(e.target.value.replace(/\D/g, ""))
                          }
                          aria-invalid={Boolean(error) || undefined}
                          placeholder="000000"
                          className={cn(
                            FIELD,
                            "tabular text-center text-h3 tracking-[0.5em]",
                          )}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSentCode(generateOtp());
                          setCode("");
                          setError(null);
                        }}
                        className="mt-3 min-h-11 text-body-sm text-fg-link underline-offset-4 hover:underline"
                      >
                        Send a new code
                      </button>
                    </div>
                  )}

                  <ErrorNote error={error} reduce={reduce} />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={pending}
                    className="group"
                  >
                    Sign in as {ROLE_LABEL[role]}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </Button>
                </form>
              </>
            )}
          </motion.div>

          <p className="mt-8 flex items-start gap-2.5 text-caption text-fg-muted">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            Demonstration prototype. Sign-in is simulated in your browser — no
            account is created, no message is sent, and nothing leaves this
            device.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- fragments */

const FIELD = cn(
  "h-12 w-full rounded-md border border-line bg-surface-card pl-10 pr-3.5 text-body text-fg",
  "placeholder:text-fg-muted",
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "hover:border-line-strong",
  "aria-[invalid=true]:border-danger",
);

function Steps({ step }: { step: Step }) {
  const index = step === "role" ? 0 : step === "identify" ? 1 : 2;
  return (
    <ol className="mt-7 flex gap-2" aria-label={`Step ${index + 1} of 3`}>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          aria-current={i === index ? "step" : undefined}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
            i <= index ? "bg-action" : "bg-line-subtle",
          )}
        />
      ))}
    </ol>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const Icon = ROLE_ICON[role];
  return (
    <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-sunken px-3 py-1.5 text-caption font-medium text-fg-secondary">
      <Icon aria-hidden="true" className="size-3.5 text-action" />
      Signing in as {ROLE_LABEL[role]}
    </p>
  );
}

function ErrorNote({
  error,
  reduce,
}: {
  error: string | null;
  reduce: boolean | null;
}) {
  return (
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
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
