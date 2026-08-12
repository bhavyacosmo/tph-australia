"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Textarea } from "@/components/ui/field";
import { Breadcrumbs, PageHeader, PageShell } from "@/components/ui/page";
import { SaveIndicator, useJustSaved } from "@/components/domain/save-indicator";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  BUDGET_OPTIONS,
  BUYING_STAGE_LABEL,
  HELP_WANTED_LABEL,
  REQUIREMENT_TYPES,
  TIMING_LABEL,
} from "@/lib/mock/seed";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { BuyingStage, HelpWanted, Timing } from "@/lib/mock/types";

/**
 * S09a — Journey setup.
 *
 * FR-02-01  captures buying stage, target area, timing and what help is wanted
 * FR-02-04  plain language throughout — no "criteria", no "onboarding"
 * FR-02-07  where guidance rests on an assumption, the assumption is shown.
 *           That is what "why we ask" is doing on every question: it tells the
 *           user what the answer will be used for before they give it.
 * FR-02-05  save and continue at every meaningful step
 *
 * Composition: a single narrow column of numbered questions with generous
 * rhythm — not a boxed form. Four questions do not need a wizard, and a wizard
 * would break FR-02-05's "continue later" promise into four save points instead
 * of one.
 */

const STAGES: { value: BuyingStage; description: string }[] = [
  { value: "just_looking", description: "Working out what's possible." },
  { value: "actively_looking", description: "Going to inspections." },
  { value: "ready_to_offer", description: "Ready to act on the right one." },
  { value: "under_contract", description: "Already signed on a property." },
];

const TIMINGS: Timing[] = ["0_3_months", "3_6_months", "6_12_months", "unsure"];

const HELP: HelpWanted[] = [
  "compare_properties",
  "know_if_ready",
  "find_professional",
  "keep_organised",
];

export function JourneySetup({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const { journey, updateJourney } = useJourneyStore();
  const [justSaved, flashSaved] = useJustSaved();

  const [name, setName] = useState(journey.name);
  const [stage, setStage] = useState<BuyingStage | null>(journey.stage);
  const [area, setArea] = useState(journey.targetArea);
  const [timing, setTiming] = useState<Timing | null>(journey.timing);
  const [help, setHelp] = useState<HelpWanted[]>(journey.helpWanted);

  /* PM wireframe §2 — Requirements and Budget */
  const [types, setTypes] = useState<string[]>(
    journey.requirements.propertyTypes,
  );
  const [minBeds, setMinBeds] = useState<number | null>(
    journey.requirements.minBeds,
  );
  const [mustHaves, setMustHaves] = useState(journey.requirements.mustHaves);
  const [budgetMax, setBudgetMax] = useState<number | null>(journey.budget.max);
  const [depositReady, setDepositReady] = useState<boolean | null>(
    journey.budget.depositReady,
  );

  const [showErrors, setShowErrors] = useState(false);

  const missing = {
    area: area.trim().length === 0,
    stage: stage === null,
    timing: timing === null,
    budget: budgetMax === null,
  };
  const incomplete =
    missing.stage || missing.area || missing.timing || missing.budget;

  const persist = () =>
    updateJourney({
      name: name.trim() || "My buyer journey",
      stage,
      targetArea: area.trim(),
      timing,
      helpWanted: help,
      requirements: {
        propertyTypes: types,
        minBeds,
        minBaths: journey.requirements.minBaths,
        mustHaves: mustHaves.trim(),
      },
      budget: { max: budgetMax, depositReady },
      setupCompletedAt: incomplete
        ? journey.setupCompletedAt
        : (journey.setupCompletedAt ?? new Date().toISOString()),
    });

  /** FR-02-05 — leaving must never lose an answer */
  const saveAndExit = () => {
    persist();
    flashSaved();
  };

  const continueOn = () => {
    if (incomplete) {
      setShowErrors(true);
      return;
    }
    persist();
    router.push(routes.journey(journeyId));
  };

  return (
    <PageShell className="max-w-3xl">
      <Breadcrumbs
        trail={[
          { label: "Home Compass", href: routes.journey(journeyId) },
          { label: "Setup" },
        ]}
      />

      <PageHeader
        className="mt-6"
        eyebrow="Home Compass"
        title="Tell us what you're looking for"
        subtitle="Location, requirements, budget, timing and the help you want. Six short questions — you can change any of them whenever you like."
      />

      <div className="mt-12 space-y-12">
        {/* ================================================== 1 · LOCATION */}
        <Question
          number={1}
          question="Where are you looking?"
          why="Council data we can show you — zoning, flood indicators — is Brisbane City Council area only at this stage. Naming your suburbs tells us whether we can help."
          error={showErrors && missing.area ? "Add at least one suburb." : undefined}
        >
          <Field label="Suburbs or areas" hint="Separate them with commas.">
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Carindale, Camp Hill, Coorparoo"
                autoComplete="off"
              />
            )}
          </Field>
        </Question>

        {/* ============================================== 2 · REQUIREMENTS */}
        <Question
          number={2}
          question="What are you looking for?"
          why="This shapes what we put in front of you, and it becomes the criteria you compare properties on later."
        >
          <div className="space-y-6">
            <fieldset>
              <legend className="text-body-sm font-medium text-fg-heading">
                Property type
              </legend>
              <p className="mt-1 text-body-sm text-fg-muted">
                Choose as many as would work.
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {REQUIREMENT_TYPES.map((t) => (
                  <ChoiceRow
                    key={t}
                    type="checkbox"
                    name="types"
                    value={t}
                    checked={types.includes(t)}
                    onChange={(on) =>
                      setTypes((prev) =>
                        on ? [...prev, t] : prev.filter((x) => x !== t),
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
                    onClick={() => setMinBeds(minBeds === n ? null : n)}
                    aria-pressed={minBeds === n}
                    className={cn(
                      "flex min-h-11 min-w-14 items-center justify-center rounded-full border text-body-sm",
                      "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                      minBeds === n
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
                  value={mustHaves}
                  onChange={(e) => setMustHaves(e.target.value)}
                  placeholder="Level block, north-facing living, walk to a bus stop."
                />
              )}
            </Field>
          </div>
        </Question>

        {/* ==================================================== 3 · BUDGET */}
        <Question
          number={3}
          question="What's your budget?"
          why="A range, not a commitment. We don't lend, we don't assess you, and this is never shared with anyone — it only filters what we show you."
          error={
            showErrors && missing.budget
              ? "Pick a range so we can filter sensibly. You can change it."
              : undefined
          }
        >
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
                    checked={budgetMax === o.value}
                    onChange={() => setBudgetMax(o.value)}
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
                  checked={depositReady === true}
                  onChange={() => setDepositReady(true)}
                  label="Yes, it's available"
                />
                <ChoiceRow
                  type="radio"
                  name="deposit"
                  value="no"
                  checked={depositReady === false}
                  onChange={() => setDepositReady(false)}
                  label="Not yet — still saving"
                />
              </div>
            </fieldset>
          </div>
        </Question>

        {/* ============================================ 4 · MOVING TIMELINE */}
        <Question
          number={4}
          question="When are you hoping to move?"
          why="Timing changes the order of things. If you're months away, getting your finances clear matters more than booking an inspection."
          error={showErrors && missing.timing ? "Pick the closest answer — you can change it." : undefined}
        >
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TIMINGS.map((t) => (
              <ChoiceRow
                key={t}
                type="radio"
                name="timing"
                value={t}
                checked={timing === t}
                onChange={() => setTiming(t)}
                label={TIMING_LABEL[t]}
              />
            ))}
          </div>
        </Question>

        {/* ============================================ 5 · SERVICES NEEDED */}
        <Question
          number={5}
          question="What help do you want?"
          why="Choose as many as you like. This only affects what we suggest — it doesn't contact anyone, and nothing is shared."
        >
          <div className="space-y-2.5">
            {HELP.map((h) => (
              <ChoiceRow
                key={h}
                type="checkbox"
                name="help"
                value={h}
                checked={help.includes(h)}
                onChange={(on) =>
                  setHelp((prev) =>
                    on ? [...prev, h] : prev.filter((x) => x !== h),
                  )
                }
                label={HELP_WANTED_LABEL[h]}
              />
            ))}
          </div>
        </Question>

        {/* ================================================== 6 · ABOUT YOU
            FR-02-01 requires buying stage, which the wireframe's five-step flow
            does not mention. Kept, at the end, so the wireframe's order is
            preserved for the steps it does specify. */}
        <Question
          number={6}
          question="Where are you up to?"
          why="It decides what we put in front of you first. Someone going to inspections needs different help from someone still working out a budget."
          error={showErrors && missing.stage ? "Choose one so we know where to start." : undefined}
        >
          <div className="space-y-2.5">
            {STAGES.map((s) => (
              <ChoiceRow
                key={s.value}
                type="radio"
                name="stage"
                value={s.value}
                checked={stage === s.value}
                onChange={() => setStage(s.value)}
                label={BUYING_STAGE_LABEL[s.value]}
                description={s.description}
              />
            ))}
          </div>

          <Field label="Give this journey a name" optional className="mt-6">
            {({ id }) => (
              <Input
                id={id}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Carindale and around"
              />
            )}
          </Field>
        </Question>
      </div>

      {/* ------------------------------------------------------------ actions */}
      <div className="sticky bottom-0 z-30 -mx-5 mt-14 border-t border-line-subtle bg-surface-card/95 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SaveIndicator
            lastSavedAt={journey.lastSavedAt}
            justSaved={justSaved}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={saveAndExit}>
              Save and finish later
            </Button>
            <Button variant="primary" onClick={continueOn} className="group">
              Continue
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              />
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/**
 * One question. The "why we ask" is help text, not a tooltip — a tooltip is
 * unreachable by touch and invisible to a screen reader that has already moved
 * past it.
 */
function Question({
  number,
  question,
  why,
  error,
  children,
}: {
  number: number;
  question: string;
  why: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-8">
        <p
          aria-hidden="true"
          className="tabular text-h3 font-bold text-line-strong md:pt-1"
        >
          {String(number).padStart(2, "0")}
        </p>
        <div className="min-w-0">
          <h2 className="text-h3 text-fg-heading">{question}</h2>
          <p className="measure mt-2 flex items-start gap-2 text-body-sm text-fg-muted">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>{why}</span>
          </p>
          <div className="mt-5">{children}</div>
          {error && (
            <p role="alert" className="mt-3 text-body-sm text-danger-fg">
              {error}
            </p>
          )}
        </div>
      </section>
    </Reveal>
  );
}
