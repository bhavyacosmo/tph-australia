"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Info, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Textarea } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  COMPASS_QUESTIONS,
  HELP_ORDER,
  STAGE_DESCRIPTION,
  STAGE_ORDER,
  TIMING_ORDER,
} from "@/lib/mock/compass";
import {
  BUDGET_OPTIONS,
  BUYING_STAGE_LABEL,
  HELP_WANTED_LABEL,
  REQUIREMENT_TYPES,
  TIMING_LABEL,
} from "@/lib/mock/seed";
import { buildSearchHref } from "@/components/search/property-search-bar";
import { cn } from "@/lib/utils";
import type { BuyingStage, HelpWanted, Timing } from "@/lib/mock/types";

/**
 * The homepage filter experience — Home Compass, one question at a time.
 *
 * Replaces the three-select panel that used to drop out of the search bar. The
 * client's ask was that Filters open something on the homepage rather than
 * pushing the visitor to the results page to configure a search they have not
 * run yet, and that it feel like a short guided setup.
 *
 * It asks the SAME six questions as /journey/[id]/setup, from the same copy
 * module, and writes to the SAME journey record — so a visitor who answers here
 * and later opens Home Compass finds their answers already there rather than an
 * empty form. That continuity is the whole reason not to invent a second,
 * parallel set of "search filters".
 *
 * Accessibility notes, since a modal is where these usually go wrong:
 *   · `role="dialog" aria-modal` with a labelled heading
 *   · focus moves into the panel on open and returns to the trigger on close
 *   · Escape closes; a click on the scrim closes
 *   · the page behind it cannot scroll while it is open
 *   · the step change is announced through `aria-live`, because a sighted user
 *     sees the number change and a screen-reader user otherwise would not
 */

type Answers = {
  area: string;
  types: string[];
  minBeds: number | null;
  mustHaves: string;
  budgetMax: number | null;
  depositReady: boolean | null;
  timing: Timing | null;
  help: HelpWanted[];
  stage: BuyingStage | null;
  name: string;
};

export function CompassWizard({
  open,
  onClose,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  /** Carried into the search so "to rent" survives the questionnaire. */
  mode: "buy" | "rent";
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { journey, updateJourney } = useJourneyStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  /*
    Portalled to <body>, and that is load-bearing rather than tidiness.

    This control is rendered inside the hero's search card, which framer-motion
    gives a `transform` on entrance. A transformed ancestor becomes the
    containing block for `position: fixed`, so without the portal the "full
    screen" overlay was laid out inside the card — 335px wide, offset, and
    clipped. Portalling to the body puts it back on the viewport where a modal
    belongs.

    `mounted` guards the SSR pass, where `document` does not exist.
  */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Seeded from whatever the journey already holds, so reopening continues
     rather than restarting. */
  const [a, setA] = useState<Answers>({
    area: journey.targetArea,
    types: journey.requirements.propertyTypes,
    minBeds: journey.requirements.minBeds,
    mustHaves: journey.requirements.mustHaves,
    budgetMax: journey.budget.max,
    depositReady: journey.budget.depositReady,
    timing: journey.timing,
    help: journey.helpWanted,
    stage: journey.stage,
    name: journey.name,
  });

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const question = COMPASS_QUESTIONS[step];
  const last = step === COMPASS_QUESTIONS.length - 1;

  /* --------------------------------------------------------- open / close */

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    /* Focus the panel, not the first field: a screen reader should hear the
       question before it hears an input. */
    const t = window.setTimeout(() => panelRef.current?.focus(), 40);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  /* ------------------------------------------------------------ validation */

  const validate = useCallback((): boolean => {
    if (question.key === "location" && !a.area.trim()) {
      setError("Add at least one suburb so we know where to look.");
      return false;
    }
    if (question.key === "budget" && a.budgetMax === null) {
      setError("Pick a range so we can filter sensibly. You can change it.");
      return false;
    }
    if (question.key === "timing" && a.timing === null) {
      setError("Pick the closest answer — you can change it.");
      return false;
    }
    if (question.key === "stage" && a.stage === null) {
      setError("Choose one so we know where to start.");
      return false;
    }
    return true;
  }, [question.key, a.area, a.budgetMax, a.timing, a.stage]);

  const next = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, COMPASS_QUESTIONS.length - 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  /**
   * Finish: persist to the journey, then run the search.
   *
   * The answers are written to the same record Home Compass uses, so the search
   * the visitor lands on is genuinely the one they just described — and it is
   * still there when they come back.
   */
  const finish = () => {
    if (!validate()) return;

    updateJourney({
      name: a.name.trim() || "My buyer journey",
      stage: a.stage,
      targetArea: a.area.trim(),
      timing: a.timing,
      helpWanted: a.help,
      requirements: {
        propertyTypes: a.types,
        minBeds: a.minBeds,
        minBaths: journey.requirements.minBaths,
        mustHaves: a.mustHaves.trim(),
      },
      budget: { max: a.budgetMax, depositReady: a.depositReady },
      setupCompletedAt: journey.setupCompletedAt ?? new Date().toISOString(),
    });

    onClose();
    router.push(
      buildSearchHref({
        /* The first suburb drives the search; the rest stay on the record. */
        where: a.area.split(",")[0]?.trim() ?? "",
        mode,
        type: a.types.length === 1 ? a.types[0] : "Any type",
        beds: a.minBeds ? `${a.minBeds}+` : "Any",
        price: a.budgetMax ? String(a.budgetMax) : "any",
      }),
    );
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid items-end justify-items-stretch sm:place-items-center">
          {/*
            `justify-items-stretch` on mobile, not `place-items-end`: the
            shorthand sets BOTH axes, so it was shrinking the sheet to its
            content width and pushing it to the right edge. A bottom sheet has
            to span the viewport.
          */}
          {/* ------------------------------------------------------- scrim */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 cursor-default bg-navy-950/70 backdrop-blur-sm"
          />

          {/* ------------------------------------------------------- panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="compass-question"
            tabIndex={-1}
            initial={
              reduce ? undefined : { opacity: 0, y: 28, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface-card shadow-elev-3",
              "rounded-t-3xl sm:max-w-2xl sm:rounded-3xl",
              "focus:outline-none",
            )}
          >
            {/* ---------------------------------------------------- header */}
            <div className="shrink-0 border-b border-line-subtle px-6 pb-5 pt-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-overline uppercase text-fg-muted">
                    Home Compass · question {step + 1} of{" "}
                    {COMPASS_QUESTIONS.length}
                  </p>
                  <p aria-live="polite" className="sr-only">
                    Question {step + 1} of {COMPASS_QUESTIONS.length}:{" "}
                    {question.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-md text-fg-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-fg"
                >
                  <X aria-hidden="true" className="size-4.5" />
                </button>
              </div>

              {/* Progress. Segments rather than a bar, so the number of
                  questions left is countable at a glance. */}
              <ol className="mt-4 flex gap-1.5">
                {COMPASS_QUESTIONS.map((q, i) => (
                  <li key={q.key} className="h-1 flex-1 overflow-hidden rounded-full bg-line-subtle">
                    <motion.span
                      initial={false}
                      animate={{ scaleX: i <= step ? 1 : 0 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                      }
                      className="block h-full origin-left rounded-full bg-action"
                    />
                  </li>
                ))}
              </ol>
            </div>

            {/* ------------------------------------------------------ body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7 md:px-8">
              <motion.div
                key={question.key}
                initial={reduce ? undefined : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 id="compass-question" className="text-h3 text-fg-heading">
                  {question.title}
                </h2>
                <p className="measure mt-2.5 flex items-start gap-2 text-body-sm text-fg-muted">
                  <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  <span>{question.why}</span>
                </p>

                <div className="mt-6">
                  {/* ------------------------------------------ 01 location */}
                  {question.key === "location" && (
                    <Field
                      label="Suburbs or areas"
                      hint="Separate them with commas."
                    >
                      {({ id, describedBy }) => (
                        <Input
                          id={id}
                          aria-describedby={describedBy}
                          value={a.area}
                          onChange={(e) => set("area", e.target.value)}
                          placeholder="Carindale, Camp Hill, Coorparoo"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                  )}

                  {/* -------------------------------------- 02 requirements */}
                  {question.key === "requirements" && (
                    <div className="space-y-6">
                      <fieldset>
                        <legend className="text-body-sm font-medium text-fg-heading">
                          Property type
                        </legend>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {REQUIREMENT_TYPES.map((t) => (
                            <ChoiceRow
                              key={t}
                              type="checkbox"
                              name="types"
                              value={t}
                              checked={a.types.includes(t)}
                              onChange={(on) =>
                                set(
                                  "types",
                                  on
                                    ? [...a.types, t]
                                    : a.types.filter((x) => x !== t),
                                )
                              }
                              label={t}
                            />
                          ))}
                        </div>
                      </fieldset>

                      <fieldset>
                        <legend className="text-body-sm font-medium text-fg-heading">
                          Bedrooms, at least
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() =>
                                set("minBeds", a.minBeds === n ? null : n)
                              }
                              aria-pressed={a.minBeds === n}
                              className={cn(
                                "flex min-h-11 min-w-14 items-center justify-center rounded-full border text-body-sm",
                                "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                                a.minBeds === n
                                  ? "border-action bg-trustlink-wash font-medium text-fg-heading"
                                  : "border-line-subtle text-fg-secondary hover:border-line hover:text-fg",
                              )}
                            >
                              {n}
                              {n === 5 ? "+" : ""}
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <Field
                        label="Anything it must have"
                        optional
                        hint="In your words. These become your must-haves when you compare."
                      >
                        {({ id, describedBy }) => (
                          <Textarea
                            id={id}
                            aria-describedby={describedBy}
                            value={a.mustHaves}
                            onChange={(e) => set("mustHaves", e.target.value)}
                            placeholder="Level block, north-facing living, walk to a bus stop."
                          />
                        )}
                      </Field>
                    </div>
                  )}

                  {/* -------------------------------------------- 03 budget */}
                  {question.key === "budget" && (
                    <div className="space-y-6">
                      <fieldset>
                        <legend className="text-body-sm font-medium text-fg-heading">
                          Around how much?
                        </legend>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {BUDGET_OPTIONS.map((o) => (
                            <ChoiceRow
                              key={o.value}
                              type="radio"
                              name="budget"
                              value={String(o.value)}
                              checked={a.budgetMax === o.value}
                              onChange={() => set("budgetMax", o.value)}
                              label={o.label}
                            />
                          ))}
                        </div>
                      </fieldset>

                      <fieldset>
                        <legend className="text-body-sm font-medium text-fg-heading">
                          Is your deposit ready?
                        </legend>
                        <p className="mt-1 text-body-sm text-fg-muted">
                          Guidance only — this is not a lending assessment.
                        </p>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          <ChoiceRow
                            type="radio"
                            name="deposit"
                            value="yes"
                            checked={a.depositReady === true}
                            onChange={() => set("depositReady", true)}
                            label="Yes, it's available"
                          />
                          <ChoiceRow
                            type="radio"
                            name="deposit"
                            value="no"
                            checked={a.depositReady === false}
                            onChange={() => set("depositReady", false)}
                            label="Not yet — still saving"
                          />
                        </div>
                      </fieldset>
                    </div>
                  )}

                  {/* -------------------------------------------- 04 timing */}
                  {question.key === "timing" && (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {TIMING_ORDER.map((t) => (
                        <ChoiceRow
                          key={t}
                          type="radio"
                          name="timing"
                          value={t}
                          checked={a.timing === t}
                          onChange={() => set("timing", t)}
                          label={TIMING_LABEL[t]}
                        />
                      ))}
                    </div>
                  )}

                  {/* ---------------------------------------------- 05 help */}
                  {question.key === "help" && (
                    <div className="space-y-2.5">
                      {HELP_ORDER.map((h) => (
                        <ChoiceRow
                          key={h}
                          type="checkbox"
                          name="help"
                          value={h}
                          checked={a.help.includes(h)}
                          onChange={(on) =>
                            set(
                              "help",
                              on
                                ? [...a.help, h]
                                : a.help.filter((x) => x !== h),
                            )
                          }
                          label={HELP_WANTED_LABEL[h]}
                        />
                      ))}
                    </div>
                  )}

                  {/* --------------------------------------------- 06 stage */}
                  {question.key === "stage" && (
                    <div className="space-y-5">
                      <div className="space-y-2.5">
                        {STAGE_ORDER.map((s) => (
                          <ChoiceRow
                            key={s}
                            type="radio"
                            name="stage"
                            value={s}
                            checked={a.stage === s}
                            onChange={() => set("stage", s)}
                            label={BUYING_STAGE_LABEL[s]}
                            description={STAGE_DESCRIPTION[s]}
                          />
                        ))}
                      </div>

                      <Field label="Give this search a name" optional>
                        {({ id }) => (
                          <Input
                            id={id}
                            value={a.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="Carindale and around"
                          />
                        )}
                      </Field>
                    </div>
                  )}
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-body-sm text-danger-fg">
                    {error}
                  </p>
                )}
              </motion.div>
            </div>

            {/* ---------------------------------------------------- footer */}
            <div className="shrink-0 border-t border-line-subtle bg-surface-card px-6 py-4 md:px-8">
              <div className="flex flex-wrap items-center gap-3">
                {step > 0 ? (
                  <Button variant="secondary" size="md" onClick={back}>
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Back
                  </Button>
                ) : (
                  <Button variant="tertiary" size="md" onClick={onClose}>
                    Cancel
                  </Button>
                )}

                {last ? (
                  <Button variant="primary" size="lg" onClick={finish}>
                    <Search aria-hidden="true" className="size-4" />
                    Search properties
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={next}
                    className="group"
                  >
                    Next
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </Button>
                )}

                {!question.required && !last && (
                  <button
                    type="button"
                    onClick={() =>
                      setStep((s) =>
                        Math.min(s + 1, COMPASS_QUESTIONS.length - 1),
                      )
                    }
                    className="min-h-11 rounded-md px-2 text-body-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    Skip
                  </button>
                )}

                <p className="ml-auto hidden items-center gap-2 text-caption text-fg-muted sm:flex">
                  <Check aria-hidden="true" className="size-3.5 text-action" />
                  Saved as you go
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
