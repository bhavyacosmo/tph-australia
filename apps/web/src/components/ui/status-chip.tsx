import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * StatusChip — docs/03-experience/11-component-library.md §3.7, §3.5
 * Manager references R7–R10 use these throughout.
 *
 * Tone carries meaning, but never ONLY colour (WCAG 1.4.1): every chip states
 * its status in words. A colour-blind reader loses nothing.
 */

const TONES = {
  neutral: "bg-neutral-bg text-neutral-fg",
  info: "bg-info-bg text-info-fg",
  attention: "bg-attention-bg text-attention-fg",
  success: "bg-success-bg text-success-fg",
  danger: "bg-error-bg text-error-fg",
  /** On navy or photographic surfaces */
  onDark: "bg-white/12 text-white",
} as const;

export type StatusTone = keyof typeof TONES;

export function StatusChip({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** FR-03-16 — the documented property statuses, mapped to tone once. */
export const PROPERTY_STATUS_TONE = {
  researching: "neutral",
  inspecting: "attention",
  offer_consideration: "info",
  paused: "neutral",
  archived: "neutral",
} as const satisfies Record<string, StatusTone>;
