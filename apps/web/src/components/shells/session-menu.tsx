"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, LogOut } from "lucide-react";

import { useJourneyStore } from "@/lib/store/journey-store";
import { ROLE_LABEL } from "@/lib/mock/accounts";
import { cn } from "@/lib/utils";

/**
 * The account control for the professional and admin shells.
 *
 * It shows who you are signed in as and offers one action — sign out. There is
 * deliberately **no way to move to another role from here**: each experience is
 * its own authenticated product, and the only route between them is signing out
 * and back in. (This replaced the P0 role switcher.)
 */
export function SessionMenu({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { session, signOut } = useJourneyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session) return null;

  const onDark = tone === "dark";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-md px-2.5 text-body-sm font-medium",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
          onDark
            ? "text-white/85 hover:bg-white/10 hover:text-white"
            : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid size-7 place-items-center rounded-full text-caption font-semibold",
            onDark ? "bg-white/15 text-white" : "bg-brand text-brand-fg",
          )}
        >
          {session.name.charAt(0)}
        </span>
        <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="session"
            initial={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-line-subtle bg-surface-card shadow-elev-3"
          >
            <div className="border-b border-line-subtle px-4 py-3">
              <p className="text-body-sm font-semibold text-fg-heading">
                {session.name}
              </p>
              <p className="truncate text-caption text-fg-muted">
                {session.context}
              </p>
              <p className="mt-2 inline-flex rounded-full bg-surface-sunken px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider text-fg-muted">
                {ROLE_LABEL[session.role]}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
                router.push("/sign-in");
              }}
              className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-body-sm text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
