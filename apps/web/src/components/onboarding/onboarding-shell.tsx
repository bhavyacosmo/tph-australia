"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LogOut, ShieldCheck } from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { useJourneyStore } from "@/lib/store/journey-store";
import { ROLE_LABEL } from "@/lib/mock/accounts";
import type { Role } from "@/lib/mock/types";

/**
 * The chrome for a first-time profile.
 *
 * Deliberately NOT the dashboard shell: there is no sidebar and no navigation
 * away, because at this point there is nothing to navigate to — the product
 * behind it does not know who this person is yet. The only ways out are
 * finishing, or signing out.
 *
 * It keeps the sign-in screen's composition rather than inventing a third one,
 * so the step reads as the continuation of signing in that it actually is.
 */
export function OnboardingShell({
  role,
  eyebrow,
  title,
  intro,
  children,
}: {
  role: Role;
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { signOut, session } = useJourneyStore();

  return (
    <div className="min-h-dvh bg-surface-page">
      <header className="border-b border-line-subtle bg-surface-card">
        <div className="mx-auto flex w-full max-w-(--container-content) items-center gap-4 px-5 md:px-8 xl:px-10">
          <Link
            href="/"
            className="flex h-[var(--header-h)] shrink-0 items-center"
            aria-label="The Property Helpline — home"
          >
            <TphLogo variant="full" />
          </Link>
          <span className="hidden rounded-full bg-surface-sunken px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted sm:inline-block">
            {ROLE_LABEL[role]}
          </span>

          <button
            type="button"
            onClick={() => {
              signOut();
              router.push("/sign-in");
            }}
            className="ml-auto flex min-h-11 items-center gap-2 rounded-md px-3 text-body-sm font-medium text-fg-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-fg"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-overline uppercase text-fg-muted">{eyebrow}</p>
          <h1 className="mt-3 text-h1 text-fg-heading">{title}</h1>
          <p className="measure mt-4 text-body-lg text-fg-secondary">{intro}</p>

          <div className="mt-10">{children}</div>

          <p className="mt-10 flex items-start gap-2.5 border-t border-line-subtle pt-6 text-caption text-fg-muted">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            Prototype. Everything you enter is kept in this browser only —
            there is no account, no server and nothing is sent anywhere. When
            the real product is built, your mobile number{" "}
            {session?.phone ? `(${session.phone}) ` : ""}
            is what will identify you.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
