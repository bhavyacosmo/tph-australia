import { isBuilt, routes } from "@/lib/routes";
import type { Milestone, MilestoneKey } from "@/lib/mock/types";

/**
 * The single dominant next action — FR-02-03, [VB] p.16 principle 2.
 *
 * Derived from the eight milestones rather than stored, so it can never
 * disagree with the Progress Map ([C-18]). The first milestone that is not done
 * is the next action; its copy is written as an instruction, not a label.
 */

export interface NextAction {
  milestone: MilestoneKey;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: (journeyId: string) => string;
  /** Shown when the destination is not part of this prototype phase yet */
  pending?: boolean;
}

const ACTIONS: Record<MilestoneKey, Omit<NextAction, "milestone" | "pending">> = {
  journey_started: {
    eyebrow: "Start here",
    title: "Tell us what you're looking for",
    body: "Four short questions about your area, timing and what help you want. You can change any of it later.",
    cta: "Set up your journey",
    href: (j) => routes.journeySetup(j),
  },
  first_property_saved: {
    eyebrow: "Your next step",
    title: "Add the first home you're considering",
    body: "Address and a few details is enough. Add your own note while it's fresh — that note is what you'll actually rely on later.",
    cta: "Add a property",
    href: (j) => routes.addProperty(j),
  },
  comparison_completed: {
    eyebrow: "Your next step",
    title: "Put them side by side",
    body: "Compare what you've saved on the things you care about. Council data carries its source and date; your notes stay marked as yours.",
    cta: "Compare properties",
    href: (j) => routes.compare(j),
  },
  readiness_completed: {
    eyebrow: "Your next step",
    title: "Check how ready you are",
    body: "Six short areas — finances, borrowing, criteria, documents, due diligence and the decision itself. Guidance, not approval.",
    cta: "Start Buyer Readiness",
    href: (j) => routes.readiness(j),
  },
  professional_selected: {
    eyebrow: "Your next step",
    title: "Find the right professional",
    body: "Read about checked Brisbane professionals. Reading a profile sends nothing — no notification, no enquiry, no contact details.",
    cta: "Find a professional",
    href: () => routes.professionals(),
  },
  trust_link_authorised: {
    eyebrow: "Your next step",
    title: "Decide what you're willing to share",
    body: "You choose exactly what they see, how they may contact you, and for how long. Nothing is sent until you confirm.",
    cta: "Review the Trust Link",
    href: () => routes.trustLinkNew(),
  },
  output_received: {
    eyebrow: "Waiting on them",
    title: "Your report is on its way",
    body: "When it arrives it lands against the right property, inside your own record — not buried in your inbox.",
    cta: "See the connection",
    href: () => routes.propIdTrustLinks(),
  },
  ready_for_next_action: {
    eyebrow: "What's next",
    title: "Keep going when you're ready",
    body: "Add another home, or connect a conveyancer for the contract. Your journey waits where you left it.",
    cta: "Open your Prop ID",
    href: () => routes.propId(),
  },
};

/** Milestone order is significant — it is the journey order. */
export function resolveNextAction(
  milestones: Milestone[],
  journeyId: string,
): NextAction {
  const next =
    milestones.find((m) => m.state !== "done") ??
    milestones[milestones.length - 1];

  const action = ACTIONS[next.key];
  return {
    ...action,
    milestone: next.key,
    pending: !isBuilt(action.href(journeyId)),
  };
}
