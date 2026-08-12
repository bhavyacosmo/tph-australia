"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChoiceRow } from "@/components/ui/field";
import { PageShell } from "@/components/ui/page";
import { SaveIndicator, useJustSaved } from "@/components/domain/save-indicator";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  CATEGORIES,
  QUESTIONS,
  questionsFor,
  TOTAL_QUESTIONS,
  type AnswerValue,
} from "@/lib/mock/readiness";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * S15 — Readiness assessment step (×6).
 *
 * FR-04-01…07  the six categories and their documented topics
 * FR-04-12 · RDY-05  save and continue mid-assessment, resumable at every step
 * FR-02-04  plain language in questions, options and validation
 *
 * Composition is deliberately austere: one column, no rail, no cards around the
 * questions. An assessment is the one place in this product where the user
 * should feel like nothing else is going on — so the chrome recedes and the
 * question carries the page.
 *
 * The progress indicator is the only decorated element, because progress is the
 * one thing a person doing a twenty-question form actually wants to know.
 */
export function ReadinessStep({
  journeyId,
  step,
}: {
  journeyId: string;
  step: number;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const {
    journey,
    readiness,
    startReadiness,
    answerReadiness,
    setReadinessStep,
    completeReadiness,
  } = useJourneyStore();
  const [justSaved, flashSaved] = useJustSaved();
  const [showErrors, setShowErrors] = useState(false);

  const category = CATEGORIES.find((c) => c.step === step);

  /* An assessment must exist before answers can be recorded. */
  useEffect(() => {
    if (!readiness) startReadiness();
  }, [readiness, startReadiness]);

  /* RDY-05 — the resume point follows the user */
  useEffect(() => {
    if (readiness && category && readiness.currentStep !== step) {
      setReadinessStep(step);
    }
  }, [readiness, category, step, setReadinessStep]);

  if (!category) {
    return (
      <PageShell className="max-w-2xl">
        <h1 className="text-h2 text-fg-heading">That step doesn&apos;t exist</h1>
        <p className="mt-4 text-body text-fg-secondary">
          There are {CATEGORIES.length} areas in the assessment.
        </p>
        <div className="mt-8">
          <Button
            variant="primary"
            onClick={() => router.push(routes.readiness(journeyId))}
          >
            Back to the start
          </Button>
        </div>
      </PageShell>
    );
  }

  const questions = questionsFor(category.key);
  const answers = readiness?.answers ?? {};

  const answeredTotal = QUESTIONS.filter(
    (q) => answers[q.id] !== undefined,
  ).length;

  const unanswered = questions.filter((q) => answers[q.id] === undefined);
  const isLast = step === CATEGORIES.length;

  const setAnswer = (questionId: string, value: AnswerValue) => {
    answerReadiness(questionId, value);
    flashSaved();
    setShowErrors(false);
  };

  const goto = (target: number) => {
    setReadinessStep(target);
    router.push(routes.readinessStep(journeyId, String(target)));
  };

  const next = () => {
    if (unanswered.length > 0) {
      setShowErrors(true);
      // Move focus to the first unanswered question so a keyboard or screen
      // reader user is taken to the problem rather than told about it.
      document
        .getElementById(`question-${unanswered[0].id}`)
        ?.scrollIntoView({ block: "center" });
      return;
    }
    if (isLast) {
      completeReadiness();
      router.push(routes.readinessResult(journeyId));
      return;
    }
    goto(step + 1);
  };

  return (
    <PageShell className="max-w-3xl">
      {/* ============================================================ progress */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-overline uppercase text-fg-muted">
            Area {step} of {CATEGORIES.length}
          </p>
          <h1 className="mt-3 text-h2 text-fg-heading">{category.label}</h1>
        </div>
        <p className="tabular text-body-sm text-fg-muted">
          {answeredTotal} of {TOTAL_QUESTIONS} questions answered
        </p>
      </div>

      {/* Six segments, one per area. The filled segment grows rather than
          appearing, so the movement itself reports the progress. */}
      <div className="mt-5 flex gap-1.5" aria-hidden="true">
        {CATEGORIES.map((c) => {
          const complete =
            questionsFor(c.key).every((q) => answers[q.id] !== undefined) &&
            c.step !== step;
          const current = c.step === step;
          return (
            <div
              key={c.key}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-subtle"
            >
              <motion.div
                initial={reduce ? undefined : { scaleX: 0 }}
                animate={{ scaleX: complete || current ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ originX: 0 }}
                className={cn(
                  "h-full w-full rounded-full",
                  complete ? "bg-action" : current ? "bg-action/40" : "bg-transparent",
                )}
              />
            </div>
          );
        })}
      </div>
      <p className="sr-only" role="status">
        Area {step} of {CATEGORIES.length}. {answeredTotal} of {TOTAL_QUESTIONS}{" "}
        questions answered.
      </p>

      <p className="measure mt-8 text-body-lg text-fg-secondary">
        {category.lede}
      </p>
      {/* Verbatim scope from [H1] p.9 — the user can see what the area covers */}
      <p className="measure mt-2 text-body-sm text-fg-muted">
        Covers: {category.covers.toLowerCase()}.
      </p>

      {/* =========================================================== questions */}
      <motion.div
        /* Keyed on the step so the content is replaced, not mutated. */
        key={step}
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 space-y-12"
      >
        {questions.map((question, i) => {
          const value = answers[question.id];
          const missing = showErrors && value === undefined;

          return (
            <motion.fieldset
              key={question.id}
              id={`question-${question.id}`}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.08 + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="scroll-mt-28"
            >
              <legend className="text-h3 text-fg-heading">
                {question.question}
              </legend>

              {question.why && (
                <p className="measure mt-3 flex items-start gap-2 text-body-sm text-fg-muted">
                  <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  <span>{question.why}</span>
                </p>
              )}
              {question.multiHint && (
                <p className="mt-3 text-body-sm text-fg-muted">
                  {question.multiHint}
                </p>
              )}

              <div
                className={cn(
                  "mt-5 space-y-2.5",
                  question.type === "multi" && "sm:grid sm:grid-cols-2 sm:gap-2.5 sm:space-y-0",
                )}
              >
                {question.options.map((option) => {
                  const checked =
                    question.type === "multi"
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value;

                  return (
                    <ChoiceRow
                      key={option.value}
                      type={question.type === "multi" ? "checkbox" : "radio"}
                      name={question.id}
                      value={option.value}
                      checked={checked}
                      onChange={(on) => {
                        if (question.type === "multi") {
                          const current = Array.isArray(value) ? value : [];
                          setAnswer(
                            question.id,
                            on
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value),
                          );
                        } else {
                          setAnswer(question.id, option.value);
                        }
                      }}
                      label={option.label}
                      description={option.description}
                    />
                  );
                })}
              </div>

              {question.type === "multi" && (
                <p className="mt-3 text-body-sm text-fg-muted">
                  Select none if you don&apos;t have any of these yet — that is a
                  valid answer, and it just means the paperwork goes on your plan.
                </p>
              )}

              {missing && (
                <p role="alert" className="mt-3 text-body-sm text-danger-fg">
                  Choose an answer so this area can be assessed. There&apos;s no
                  wrong one.
                </p>
              )}
            </motion.fieldset>
          );
        })}
      </motion.div>

      {/* ============================================================ actions */}
      <div className="sticky bottom-0 z-30 -mx-5 mt-14 border-t border-line-subtle bg-surface-card/95 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="tertiary"
              onClick={() =>
                step === 1 ? router.push(routes.readiness(journeyId)) : goto(step - 1)
              }
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back
            </Button>
            {/* FR-04-12 — leaving mid-assessment must be safe and obvious */}
            <Button
              variant="tertiary"
              onClick={() => router.push(routes.journey(journeyId))}
            >
              Save and finish later
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <SaveIndicator
              lastSavedAt={journey.lastSavedAt}
              justSaved={justSaved}
              className="hidden sm:flex"
            />
            <Button variant="primary" onClick={next} className="group">
              {isLast ? (
                <>
                  See my result
                  <Check aria-hidden="true" className="size-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
