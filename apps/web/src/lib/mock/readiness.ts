/**
 * Buyer Readiness Lite — question set and scoring.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROVENANCE, AND WHAT IS AND IS NOT DEFINED BY THE CLIENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DEFINED by `[H1]` p.9, quoted:
 *
 *   "A guidance score and action plan, not a credit score, pre-approval or
 *    guarantee."
 *
 *   Finances      — "Deposit estimate, purchase costs awareness, budget confidence."
 *   Borrowing     — "Pre-approval status and questions for a broker or lender."
 *   Criteria      — "Location, property type, needs, compromises and timeframe."
 *   Documents     — "Basic identification and evidence readiness checklist."
 *   Due diligence — "Inspection, contract, flood, zoning and professional-support
 *                    awareness."
 *   Decision      — "Who is involved, decision confidence and immediate next step."
 *
 *   "The scoring formula must be transparent, versioned and testable. The output
 *    shows what is complete, what needs attention and the next recommended
 *    actions. It must never be presented as lending approval."
 *
 * `[VB]` p.8 adds the fourth output state — "what is ready, what needs
 * attention, **what can wait**, and the next recommended actions."
 *
 * NOT DEFINED anywhere in the client documents:
 *
 *   · the question wording          — only the topics each category must cover
 *   · the scoring formula           — [OQ-21] ⭐, a pre-quotation blocker
 *   · the band thresholds           — [OQ-21] ⭐
 *   · whether to show a number      — [OQ-20]. `[VB]` p.8 shows "81 / 100";
 *                                     `[H1]` p.9 says "score band" and forbids
 *                                     approval framing
 *
 * WHAT THIS FILE THEREFORE IS: one question per documented topic, worded plainly
 * (FR-02-04), and a deliberately simple, inspectable placeholder formula. Both
 * carry a `-draft` version suffix, both versions are recorded on every saved
 * assessment (RDY-02) and shown in the UI, and the result screen links to a
 * plain-English explanation of the derivation (FR-04-08 transparency).
 *
 * Following [OQ-20]'s recommendation, the result is a BAND LABEL with no
 * numeral. A numeral invites the credit-score misreading `[H1]` p.9 forbids.
 *
 * Replacing this with the client's real question set and formula should touch
 * this file only — the screens read from it.
 */

export const QUESTION_VERSION = "readiness-questions-v1-draft";
export const FORMULA_VERSION = "readiness-formula-v1-draft";

/* ---------------------------------------------------------------- categories */

export type CategoryKey =
  | "finances"
  | "borrowing"
  | "criteria"
  | "documents"
  | "due_diligence"
  | "decision";

export interface ReadinessCategory {
  key: CategoryKey;
  /** Step number in the flow, 1-based */
  step: number;
  label: string;
  /** The plain-language purpose of the category */
  lede: string;
  /** Verbatim topic list from [H1] p.9, shown as the category's scope */
  covers: string;
}

export const CATEGORIES: ReadinessCategory[] = [
  {
    key: "finances",
    step: 1,
    label: "Finances",
    lede: "What you have available, and whether the costs beyond the deposit are on your radar.",
    covers: "Deposit estimate, purchase costs awareness, budget confidence",
  },
  {
    key: "borrowing",
    step: 2,
    label: "Borrowing",
    lede: "Where you're up to with a lender — and what to ask them next.",
    covers: "Pre-approval status and questions for a broker or lender",
  },
  {
    key: "criteria",
    step: 3,
    label: "What you're looking for",
    lede: "How clear you are on the home itself, including what you'd give up.",
    covers: "Location, property type, needs, compromises and timeframe",
  },
  {
    key: "documents",
    step: 4,
    label: "Documents",
    lede: "The paperwork a lender or conveyancer will ask for.",
    covers: "Basic identification and evidence readiness checklist",
  },
  {
    key: "due_diligence",
    step: 5,
    label: "Checking the property",
    lede: "What you'd check before committing, and who would help you check it.",
    covers:
      "Inspection, contract, flood, zoning and professional-support awareness",
  },
  {
    key: "decision",
    step: 6,
    label: "Making the decision",
    lede: "Who decides, how confident you are, and what happens next.",
    covers: "Who is involved, decision confidence and immediate next step",
  },
];

/* ----------------------------------------------------------------- questions */

/**
 * Every answer maps to one of three states. This is the whole of the scoring
 * model — deliberately, because a model nobody can hold in their head is not
 * "transparent" in `[H1]` p.9's sense.
 */
export type AnswerState = "ready" | "partial" | "attention";

export interface AnswerOption {
  value: string;
  label: string
  /** Optional clarifier shown under the label */
  description?: string;
  state: AnswerState;
  /**
   * Added to the action plan when this option is chosen. `urgency` is declared
   * here rather than derived, so the plan's ordering is inspectable data —
   * matching the "declarative rules" the admin questions surface (A11a).
   */
  action?: { text: string; urgency: "now" | "can_wait" };
}

export interface ReadinessQuestion {
  id: string;
  category: CategoryKey;
  /** Which documented topic this question exists to cover */
  topic: string;
  question: string;
  /** Plain-language "why we ask" — FR-02-04, FR-02-07 */
  why?: string;
  type: "single" | "multi";
  options: AnswerOption[];
  /** `multi` only: options not selected count as `attention` */
  multiHint?: string;
}

export const QUESTIONS: ReadinessQuestion[] = [
  /* ------------------------------------------------------------- finances */
  {
    id: "deposit",
    category: "finances",
    topic: "Deposit estimate",
    question: "How much do you have available for a deposit?",
    why: "We don't ask for an amount. Knowing roughly where you are tells us what to suggest — and it's never shared with anyone.",
    type: "single",
    options: [
      {
        value: "known_saved",
        label: "I know the figure and the money is available",
        state: "ready",
      },
      {
        value: "known_saving",
        label: "I know the figure I need and I'm still saving",
        state: "partial",
        action: {
          text: "Set a target date for your deposit and check it against your timing",
          urgency: "can_wait",
        },
      },
      {
        value: "unsure",
        label: "I'm not sure what I'd need",
        state: "attention",
        action: {
          text: "Work out a deposit estimate — a broker or lender can do this in one conversation",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "purchase_costs",
    category: "finances",
    topic: "Purchase costs awareness",
    question: "Have you accounted for the costs on top of the price?",
    why: "Transfer duty, legal fees, inspections, lender fees and moving costs. People are often surprised by the total.",
    type: "single",
    options: [
      {
        value: "budgeted",
        label: "Yes — I've budgeted for them",
        state: "ready",
      },
      {
        value: "aware",
        label: "I know they exist but haven't added them up",
        state: "partial",
        action: {
          text: "Add up your purchase costs so the deposit figure is the real one",
          urgency: "now",
        },
      },
      {
        value: "no",
        label: "No — this is new to me",
        state: "attention",
        action: {
          text: "Ask a conveyancer what the costs beyond the price will be for your situation",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "budget_confidence",
    category: "finances",
    topic: "Budget confidence",
    question: "How confident are you in your budget?",
    type: "single",
    options: [
      { value: "confident", label: "Confident — I know my ceiling", state: "ready" },
      {
        value: "roughly",
        label: "Roughly — it could move",
        state: "partial",
      },
      {
        value: "not",
        label: "Not confident yet",
        state: "attention",
        action: {
          text: "Settle on a maximum you're comfortable with before you inspect again",
          urgency: "now",
        },
      },
    ],
  },

  /* ------------------------------------------------------------ borrowing */
  {
    id: "pre_approval",
    category: "borrowing",
    topic: "Pre-approval status",
    question: "Where are you up to with a lender?",
    why: "We don't lend, arrange finance or assess you. This only changes what we suggest you do next.",
    type: "single",
    options: [
      {
        value: "approved",
        label: "I have pre-approval in writing",
        state: "ready",
      },
      {
        value: "applied",
        label: "I've applied and I'm waiting",
        state: "partial",
      },
      {
        value: "spoken",
        label: "I've spoken to someone but haven't applied",
        state: "partial",
        action: {
          text: "Ask your broker or lender what they need to move to a written pre-approval",
          urgency: "now",
        },
      },
      {
        value: "none",
        label: "I haven't started",
        state: "attention",
        action: {
          text: "Talk to a broker or lender about pre-approval before you make an offer",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "lender_questions",
    category: "borrowing",
    topic: "Questions for a broker or lender",
    question: "Do you know what you'd ask them?",
    why: "Going in with questions is the difference between being sold to and making a decision.",
    type: "single",
    options: [
      {
        value: "yes",
        label: "Yes — I have my questions ready",
        state: "ready",
      },
      {
        value: "some",
        label: "A few, but I'd like a starting list",
        state: "partial",
        action: {
          text: "Write down three questions for your broker — repayments, fees, and how long a pre-approval lasts",
          urgency: "can_wait",
        },
      },
      {
        value: "no",
        label: "No — I wouldn't know where to start",
        state: "attention",
        action: {
          text: "Prepare questions for a lender: what you can borrow, what it costs, and what could change it",
          urgency: "can_wait",
        },
      },
    ],
  },

  /* ------------------------------------------------------------- criteria */
  {
    id: "location",
    category: "criteria",
    topic: "Location",
    question: "Are you settled on where you're looking?",
    type: "single",
    options: [
      { value: "settled", label: "Yes — specific suburbs", state: "ready" },
      { value: "broad", label: "A broad area", state: "partial" },
      {
        value: "open",
        label: "Still open",
        state: "attention",
        action: {
          text: "Narrow your search to two or three suburbs so you can compare like with like",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "property_type",
    category: "criteria",
    topic: "Property type",
    question: "Do you know what kind of property you want?",
    type: "single",
    options: [
      { value: "decided", label: "Yes — decided", state: "ready" },
      { value: "few", label: "Two or three types would work", state: "partial" },
      {
        value: "undecided",
        label: "Undecided",
        state: "attention",
        action: {
          text: "Decide which property types you'd actually live in, and drop the rest",
          urgency: "can_wait",
        },
      },
    ],
  },
  {
    id: "needs",
    category: "criteria",
    topic: "Needs",
    question: "Have you written down what the home must have?",
    why: "The must-haves are what stop a good-looking home from pulling you off course.",
    type: "single",
    options: [
      { value: "written", label: "Yes — written down", state: "ready" },
      { value: "head", label: "It's in my head", state: "partial" },
      {
        value: "no",
        label: "Not yet",
        state: "attention",
        action: {
          text: "List your must-haves, then use them as criteria in your comparison",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "compromises",
    category: "criteria",
    topic: "Compromises",
    question: "Do you know what you'd compromise on?",
    type: "single",
    options: [
      { value: "clear", label: "Yes — clear on it", state: "ready" },
      { value: "some", label: "Some idea", state: "partial" },
      {
        value: "no",
        label: "Haven't thought about it",
        state: "attention",
        action: {
          text: "Decide your two biggest compromises before the next inspection",
          urgency: "can_wait",
        },
      },
    ],
  },
  {
    id: "timeframe",
    category: "criteria",
    topic: "Timeframe",
    question: "Is your timeframe firm?",
    type: "single",
    options: [
      { value: "firm", label: "Yes — a firm date or window", state: "ready" },
      { value: "flexible", label: "Flexible", state: "partial" },
      {
        value: "unknown",
        label: "No timeframe yet",
        state: "attention",
        action: {
          text: "Pick a target window — it decides what's urgent and what can wait",
          urgency: "can_wait",
        },
      },
    ],
  },

  /* ------------------------------------------------------------ documents */
  {
    id: "documents_checklist",
    category: "documents",
    topic: "Basic identification and evidence readiness checklist",
    question: "Which of these could you produce this week?",
    why: "A lender or conveyancer will ask for these. Nothing is uploaded here — we're only checking what you have.",
    type: "multi",
    multiHint: "Select everything you could find without much effort.",
    options: [
      { value: "id", label: "Photo identification", state: "ready" },
      { value: "income", label: "Recent payslips or income evidence", state: "ready" },
      { value: "savings", label: "Savings or deposit statements", state: "ready" },
      { value: "debts", label: "A list of your current debts and limits", state: "ready" },
      { value: "expenses", label: "A rough monthly expenses figure", state: "ready" },
    ],
  },

  /* -------------------------------------------------------- due diligence */
  {
    id: "inspection",
    category: "due_diligence",
    topic: "Inspection",
    question: "Would you get a building and pest inspection?",
    type: "single",
    options: [
      {
        value: "arranged",
        label: "Yes — I've arranged or budgeted for one",
        state: "ready",
      },
      {
        value: "intend",
        label: "Yes, but I haven't organised it",
        state: "partial",
        action: {
          text: "Line up a building inspector so you're not scrambling after an offer",
          urgency: "now",
        },
      },
      {
        value: "no",
        label: "I hadn't planned to",
        state: "attention",
        action: {
          text: "Arrange a building and pest inspection before you commit to a property",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "contract",
    category: "due_diligence",
    topic: "Contract",
    question: "Would someone review the contract before you sign?",
    why: "We can't give legal advice. A conveyancer or property lawyer does this.",
    type: "single",
    options: [
      {
        value: "engaged",
        label: "Yes — I have someone",
        state: "ready",
      },
      {
        value: "intend",
        label: "Yes, but I haven't found anyone",
        state: "partial",
        action: {
          text: "Find a conveyancer now, so a contract review isn't the thing holding you up",
          urgency: "now",
        },
      },
      {
        value: "no",
        label: "I wasn't going to",
        state: "attention",
        action: {
          text: "Have a conveyancer or property lawyer review the contract before you sign",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "flood",
    category: "due_diligence",
    topic: "Flood",
    question: "Have you checked flood information for the properties you're considering?",
    why: "What we show is a screening indicator from Council open data — not a formal flood assessment. Council's own FloodWise report is the authority.",
    type: "single",
    options: [
      {
        value: "official",
        label: "Yes — I've read Council's report for them",
        state: "ready",
      },
      {
        value: "screening",
        label: "I've looked at the indicator here only",
        state: "partial",
        action: {
          text: "Order Council's FloodWise report for any property you're serious about",
          urgency: "now",
        },
      },
      {
        value: "no",
        label: "Not yet",
        state: "attention",
        action: {
          text: "Check flood information for each property, and confirm it with Council",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "zoning",
    category: "due_diligence",
    topic: "Zoning",
    question: "Do you know what the zoning means for what you want to do?",
    type: "single",
    options: [
      { value: "yes", label: "Yes", state: "ready" },
      {
        value: "seen",
        label: "I've seen the zoning but not what it allows",
        state: "partial",
        action: {
          text: "Check what the zoning permits if you plan to extend or subdivide",
          urgency: "can_wait",
        },
      },
      {
        value: "no",
        label: "No",
        state: "attention",
        action: {
          text: "Read the zoning for your shortlisted properties — it's in your comparison",
          urgency: "can_wait",
        },
      },
    ],
  },
  {
    id: "professional_support",
    category: "due_diligence",
    topic: "Professional-support awareness",
    question: "Do you know who you'd need on your side?",
    type: "single",
    options: [
      {
        value: "yes",
        label: "Yes — I know the roles and who does what",
        state: "ready",
      },
      {
        value: "partly",
        label: "Partly",
        state: "partial",
        action: {
          text: "Read who does what — inspector, conveyancer, buyer's agent — before you need them",
          urgency: "can_wait",
        },
      },
      {
        value: "no",
        label: "No",
        state: "attention",
        action: {
          text: "Find out which professionals a purchase needs, and when each one is involved",
          urgency: "now",
        },
      },
    ],
  },

  /* ------------------------------------------------------------- decision */
  {
    id: "who_decides",
    category: "decision",
    topic: "Who is involved",
    question: "Who else is part of this decision?",
    type: "single",
    options: [
      {
        value: "aligned",
        label: "Just me, or we're agreed",
        state: "ready",
      },
      {
        value: "consulting",
        label: "Someone else is involved and we're still talking it through",
        state: "partial",
        action: {
          text: "Agree your must-haves and your ceiling with whoever else is deciding",
          urgency: "now",
        },
      },
      {
        value: "unclear",
        label: "It isn't clear yet",
        state: "attention",
        action: {
          text: "Work out who has the final say before you're under time pressure",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "confidence",
    category: "decision",
    topic: "Decision confidence",
    question: "How confident do you feel about deciding?",
    type: "single",
    options: [
      { value: "confident", label: "Confident", state: "ready" },
      { value: "mixed", label: "Some days", state: "partial" },
      {
        value: "unsure",
        label: "Not confident",
        state: "attention",
        action: {
          text: "Compare your shortlist on your own criteria — deciding gets easier when it's side by side",
          urgency: "now",
        },
      },
    ],
  },
  {
    id: "next_step",
    category: "decision",
    topic: "Immediate next step",
    question: "Do you know your next step?",
    type: "single",
    options: [
      { value: "yes", label: "Yes — I know what I'm doing next", state: "ready" },
      {
        value: "no",
        label: "Not really",
        state: "attention",
        action: {
          text: "Pick one thing from this plan and do it this week",
          urgency: "now",
        },
      },
    ],
  },
];

/* ------------------------------------------------------------------- states */

/**
 * The four documented output states — `[H1]` p.9 plus `[VB]` p.8's "what can
 * wait". These are CATEGORY states, not a score.
 */
export type CategoryState = "ready" | "attention" | "can_wait" | "unanswered";

export const CATEGORY_STATE_LABEL: Record<CategoryState, string> = {
  ready: "Ready",
  attention: "Needs attention",
  can_wait: "Can wait",
  unanswered: "Not answered",
};

/**
 * Band labels. No numeral — [OQ-20]. Wording avoids any suggestion of approval,
 * eligibility or capacity, which FR-04-11 / RDY-04 forbid.
 */
export type BandKey = "well_prepared" | "mostly_prepared" | "gaps" | "early";

export const BAND: Record<
  BandKey,
  { label: string; lede: string }
> = {
  well_prepared: {
    label: "Well prepared",
    lede: "Most of the groundwork is done. What's left is small and specific.",
  },
  mostly_prepared: {
    label: "Mostly prepared",
    lede: "You're in good shape, with a couple of things worth closing off before you commit.",
  },
  gaps: {
    label: "Some gaps to close",
    lede: "You've made a start. A few of these matter before you make an offer.",
  },
  early: {
    label: "Early preparation",
    lede: "You're early, and that's a useful place to be — there's time to do this properly.",
  },
};

/* ------------------------------------------------------------------ answers */

/** `single` → one option value. `multi` → the selected values. */
export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export interface ActionItem {
  id: string;
  text: string;
  urgency: "now" | "can_wait";
  category: CategoryKey;
  /** FR-04-14 — individually completable by the user */
  done: boolean;
}

export interface ReadinessResult {
  categoryStates: Record<CategoryKey, CategoryState>;
  band: BandKey;
  actions: ActionItem[];
  /** RDY-02 */
  questionVersion: string;
  formulaVersion: string;
}

/**
 * One assessment. Stored per journey, with history.
 *
 * RDY-02  records the question and formula version used
 * RDY-03  stores the COMPUTED result, and never recomputes on read — so a
 *         completed assessment survives a formula change unchanged
 * RDY-05  `currentStep` and partial `answers` make it resumable
 * RDY-06  `supersededById` retains history across a retake
 */
export interface ReadinessAssessment {
  id: string;
  journeyId: string;
  answers: Answers;
  /** Null until completed. Once set, it is never recalculated (RDY-03). */
  result: ReadinessResult | null;
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
  supersededById: string | null;
  /** FR-04-14 — action items the user has ticked off */
  actionsDone: string[];
}

/* ------------------------------------------------------------------ scoring */

export function questionsFor(category: CategoryKey): ReadinessQuestion[] {
  return QUESTIONS.filter((q) => q.category === category);
}

export const TOTAL_QUESTIONS = QUESTIONS.length;

function answerStateFor(
  question: ReadinessQuestion,
  answer: AnswerValue | undefined,
): AnswerState | undefined {
  if (answer === undefined) return undefined;

  if (question.type === "multi") {
    const selected = Array.isArray(answer) ? answer : [];
    if (selected.length === question.options.length) return "ready";
    if (selected.length === 0) return "attention";
    return "partial";
  }

  const option = question.options.find((o) => o.value === answer);
  return option?.state;
}

/**
 * The placeholder formula, in full. Deliberately readable end to end.
 *
 *   1. Each answer resolves to `ready` | `partial` | `attention`.
 *   2. A category is `ready` when every answer in it is `ready`.
 *      It `needs attention` when any answer is `attention`.
 *      Otherwise it `can wait` — partial answers only, nothing pressing.
 *   3. The band comes from counting categories, never from a total score.
 *   4. Action items come from the chosen options themselves, and each one's
 *      urgency is declared in the question data rather than inferred.
 *
 * Pending [OQ-21]. When the client's formula arrives this function is the only
 * thing that changes, and RDY-03 keeps historical results reproducible because
 * saved assessments store their computed result rather than recomputing it.
 */
export function scoreReadiness(answers: Answers): ReadinessResult {
  const categoryStates = {} as Record<CategoryKey, CategoryState>;
  const actions: ActionItem[] = [];

  for (const category of CATEGORIES) {
    const questions = questionsFor(category.key);
    const states = questions.map((q) => answerStateFor(q, answers[q.id]));

    if (states.some((s) => s === undefined)) {
      categoryStates[category.key] = "unanswered";
    } else if (states.every((s) => s === "ready")) {
      categoryStates[category.key] = "ready";
    } else if (states.some((s) => s === "attention")) {
      categoryStates[category.key] = "attention";
    } else {
      categoryStates[category.key] = "can_wait";
    }

    for (const question of questions) {
      const answer = answers[question.id];
      if (answer === undefined) continue;

      if (question.type === "multi") {
        const selected = Array.isArray(answer) ? answer : [];
        const missing = question.options.filter(
          (o) => !selected.includes(o.value),
        );
        if (missing.length > 0) {
          actions.push({
            id: `${question.id}-missing`,
            text: `Gather what you're missing: ${missing
              .map((m) => m.label.toLowerCase())
              .join(", ")}`,
            urgency: "can_wait",
            category: category.key,
            done: false,
          });
        }
        continue;
      }

      const option = question.options.find((o) => o.value === answer);
      if (option?.action) {
        actions.push({
          id: `${question.id}-${option.value}`,
          text: option.action.text,
          urgency: option.action.urgency,
          category: category.key,
          done: false,
        });
      }
    }
  }

  const values = Object.values(categoryStates);
  const readyCount = values.filter((s) => s === "ready").length;
  const attentionCount = values.filter((s) => s === "attention").length;

  let band: BandKey;
  if (attentionCount === 0 && readyCount === CATEGORIES.length) {
    band = "well_prepared";
  } else if (attentionCount === 0) {
    band = "mostly_prepared";
  } else if (attentionCount <= 2) {
    band = "gaps";
  } else {
    band = "early";
  }

  // "Now" items first; otherwise the plan reads as a pile rather than an order.
  actions.sort((a, b) =>
    a.urgency === b.urgency ? 0 : a.urgency === "now" ? -1 : 1,
  );

  return {
    categoryStates,
    band,
    actions,
    questionVersion: QUESTION_VERSION,
    formulaVersion: FORMULA_VERSION,
  };
}

/** How many questions in a category have been answered. */
export function answeredCount(
  category: CategoryKey,
  answers: Answers,
): number {
  return questionsFor(category).filter((q) => answers[q.id] !== undefined)
    .length;
}
