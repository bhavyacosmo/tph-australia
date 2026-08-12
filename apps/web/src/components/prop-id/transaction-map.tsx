"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  FileText,
  Info,
  UserCog,
} from "lucide-react";

import { StatusChip, type StatusTone } from "@/components/ui/status-chip";
import { ButtonLink } from "@/components/ui/button";
import {
  ProfessionalAvatar,
} from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { professionalById, serviceFor } from "@/lib/mock/marketplace";
import { formatDate } from "@/lib/format";
import { isBuilt, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { StageStatus, TransactionStage } from "@/lib/mock/types";

/**
 * Progress Map v2 — the transaction journey.
 *
 * This is the change the client cared about most. He called the existing
 * milestone list *"not looking bad"* but then said *"मैं progress map की बात कर
 * रहा हूँ, I'm talking about little bit different"* (transcript L819) and
 * described the real thing: you talk to an agent, *"एक journey होती है start हो
 * जाती है, एक train में बैठ जाते हैं आप"* — then it goes to the conveyancer, and
 * so on. Then: *"वो हमारा इसका heart है"* — this is its heart (L785).
 *
 * The two properties that make this different from a checklist:
 *
 *  1. **Stages run in parallel.** *"मेरा तो ये agent के साथ है, अभी मेरा
 *     conveyancer का भी काम चल रहा है"* (L777). So the composition is parallel
 *     tracks with their own states, not one line with one cursor.
 *
 *  2. **A professional attaches to a stage.** Authorising a Trust Link puts a
 *     real person on the relevant track, which is what makes the map feel like
 *     coordination rather than decoration.
 *
 * ⚠️ PROVISIONAL STAGES. The client said he would supply the final list (L823)
 * and the PM wireframe records the same gap. The five here are his example. The
 * banner says so, and `SEED_STAGES` is the only place to change.
 */

const STATUS_META: Record<
  StageStatus,
  { label: string; tone: StatusTone; ring: string; fill: string }
> = {
  completed: {
    label: "Completed",
    tone: "success",
    ring: "border-action bg-action text-white",
    fill: "bg-action",
  },
  in_progress: {
    label: "In progress",
    tone: "info",
    ring: "border-action bg-surface-card text-action",
    fill: "bg-action/40",
  },
  upcoming: {
    label: "Upcoming",
    tone: "neutral",
    ring: "border-line bg-surface-card text-fg-muted",
    fill: "bg-line-subtle",
  },
};

export function TransactionMap() {
  const reduce = useReducedMotion();
  const { stages, trustLinks, journey } = useJourneyStore();

  const completed = stages.filter((s) => s.status === "completed").length;
  const live = stages.filter((s) => s.status === "in_progress");

  return (
    <div>
      {/* ------------------------------------------------------- provisional */}
      <p className="flex items-start gap-3 rounded-xl border border-attention-line bg-attention-bg px-4 py-3 text-body-sm text-fg-secondary">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-attention-fg"
        />
        <span>
          <span className="font-medium text-fg-heading">
            Provisional stages.
          </span>{" "}
          These five are the example the client gave on the call. The final stage
          list is still to come from them, so treat the names and the order as a
          working draft.
        </span>
      </p>

      {/* ------------------------------------------------------------ summary */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-baseline gap-2">
            <span className="tabular text-display font-bold leading-none text-fg-heading">
              {completed}
            </span>
            <span className="text-h3 text-fg-muted">/ {stages.length}</span>
          </p>
          <p className="mt-3 text-body text-fg-secondary">
            stages complete
            {live.length > 0 && (
              <>
                {" · "}
                <span className="font-medium text-fg-heading">
                  {live.length} running now
                </span>
              </>
            )}
          </p>
        </div>

        {live.length > 1 && (
          <p className="measure max-w-sm text-body-sm text-fg-muted">
            More than one stage is live. That is normal — finance and inspections
            usually overlap, and this map is built to show them side by side
            rather than in a queue.
          </p>
        )}
      </div>

      {/* =========================================================== the map
          Parallel tracks. Each stage owns a row; the rail on the left carries
          its own state, so two rows can both be live without contradiction. */}
      <ol className="mt-12 space-y-4">
        {stages.map((stage, i) => (
          <StageRow
            key={stage.key}
            stage={stage}
            index={i}
            isLast={i === stages.length - 1}
            journeyId={journey.id}
            reduce={Boolean(reduce)}
            hasTrustLink={trustLinks.some((t) => t.id === stage.trustLinkId)}
          />
        ))}
      </ol>

      <p className="mt-10 flex items-start gap-3 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          This map tracks the purchase. Your Home Compass steps — saving,
          comparing, readiness — are tracked separately, because they measure
          different things and merging them would give you two numbers that
          disagree.
        </span>
      </p>
    </div>
  );
}

function StageRow({
  stage,
  index,
  isLast,
  journeyId,
  reduce,
  hasTrustLink,
}: {
  stage: TransactionStage;
  index: number;
  isLast: boolean;
  journeyId: string;
  reduce: boolean;
  hasTrustLink: boolean;
}) {
  const meta = STATUS_META[stage.status];
  const professional = stage.professionalId
    ? professionalById(stage.professionalId)
    : null;
  const service = stage.serviceKey ? serviceFor(stage.serviceKey) : null;

  return (
    <motion.li
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index, 6) * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex gap-5"
    >
      {/* ------------------------------------------------------------ track */}
      <div className="relative flex w-12 shrink-0 flex-col items-center">
        <span
          aria-hidden="true"
          className={cn(
            "relative z-10 grid size-12 place-items-center rounded-full border-2 transition-colors duration-[var(--duration-base)]",
            meta.ring,
          )}
        >
          {stage.status === "completed" ? (
            <Check className="size-5" />
          ) : (
            <span className="tabular text-body-sm font-semibold">
              {index + 1}
            </span>
          )}
        </span>

        {/* The connector, filled to this stage's own state — so a live stage
            below a completed one reads correctly instead of implying order. */}
        {!isLast && (
          <span className="relative mt-1 w-0.5 flex-1 overflow-hidden rounded-full bg-line-subtle">
            <motion.span
              initial={reduce ? undefined : { scaleY: 0 }}
              whileInView={{
                scaleY: stage.status === "completed" ? 1 : 0.35,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: 0.2 + index * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ originY: 0 }}
              className={cn("absolute inset-0 rounded-full", meta.fill)}
            />
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------- card */}
      <div
        className={cn(
          "mb-4 min-w-0 flex-1 rounded-2xl border p-5 transition-colors duration-[var(--duration-base)]",
          stage.status === "in_progress"
            ? "border-action/40 bg-trustlink-wash"
            : "border-line-subtle bg-surface-card",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "text-h4",
                stage.status === "upcoming" ? "text-fg-secondary" : "text-fg-heading",
              )}
            >
              {stage.label}
            </h3>
            <p className="measure mt-1.5 text-body-sm text-fg-muted">
              {stage.blurb}
            </p>
          </div>
          <StatusChip
            tone={meta.tone}
            icon={
              stage.status === "completed" ? (
                <Check aria-hidden="true" className="size-3" />
              ) : (
                <Clock aria-hidden="true" className="size-3" />
              )
            }
          >
            {meta.label}
          </StatusChip>
        </div>

        <p className="mt-4 text-body-sm text-fg-secondary">{stage.detail}</p>

        {/* who is on it */}
        {professional ? (
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line-subtle pt-4">
            <ProfessionalAvatar professional={professional} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-medium text-fg-heading">
                {professional.name}
              </p>
              <p className="text-caption text-fg-muted">
                {professional.category} · connected
              </p>
            </div>
            {stage.trustLinkId && hasTrustLink && (
              <Link
                href={routes.trustLink(stage.trustLinkId)}
                className="flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
              >
                Open the connection
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            )}
          </div>
        ) : stage.outsideStage1 ? (
          <p className="mt-5 flex items-start gap-2.5 border-t border-line-subtle pt-4 text-body-sm text-fg-muted">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            No professional category for this stage yet. A broker or lender sits
            outside the agreed Stage 1 scope, so this one is yours to manage —
            flagged for the client.
          </p>
        ) : service && stage.status !== "completed" ? (
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line-subtle pt-4">
            <p className="flex items-center gap-2 text-body-sm text-fg-muted">
              <UserCog aria-hidden="true" className="size-3.5 shrink-0" />
              Nobody connected
            </p>
            {isBuilt(routes.trustLinkNew()) && (
              <ButtonLink
                href={`${routes.trustLinkNew()}?service=${service.key}`}
                variant="secondary"
                size="sm"
                className="ml-auto"
              >
                Connect a {service.label.toLowerCase()}
              </ButtonLink>
            )}
          </div>
        ) : null}

        {stage.completedAt && (
          <p className="mt-4 flex items-center gap-2 text-caption text-fg-muted">
            <FileText aria-hidden="true" className="size-3.5" />
            Completed {formatDate(stage.completedAt)}
          </p>
        )}
      </div>
    </motion.li>
  );
}
