import { cn } from "@/lib/utils";

/**
 * The Property Helpline™ brand mark.
 *
 * Redrawn to match the manager UI reference images (all ten use the same
 * lockup): an outlined house mark in navy with a green inner counter-form,
 * beside a stacked wordmark — "The" small, "Property" and "Helpline" bold navy.
 *
 * This replaces the earlier "TPH" monogram taken from [MU2]. Which lockup is
 * current is Q2 in docs/03-experience/18-manager-ui-reference-analysis.md §12.
 *
 * Trademark treatment: ™ only, never ®, until registration is formally
 * confirmed — [H1] p.1.
 */

type LogoVariant = "full" | "compact" | "mark";

interface TphLogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Renders light-on-dark, for use on navy surfaces. */
  inverse?: boolean;
}

function LogoMark({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={cn("size-9 shrink-0", className)}
      fill="none"
    >
      {/* Outer house — navy */}
      <path
        d="M4 18.5 20 5.5l16 13"
        stroke={inverse ? "#ffffff" : "var(--color-navy-900)"}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 16.5v18h25v-18"
        stroke={inverse ? "#ffffff" : "var(--color-navy-900)"}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner counter-form — green, offset right, echoing the roofline */}
      <path
        d="M17 34.5V22.5h11v12"
        stroke={inverse ? "var(--color-green-400)" : "var(--color-green-600)"}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TphLogo({
  variant = "full",
  className,
  inverse = false,
}: TphLogoProps) {
  if (variant === "mark") {
    return <LogoMark className={className} inverse={inverse} />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark inverse={inverse} />
      <span
        className={cn(
          "flex flex-col leading-[1.06] tracking-[-0.015em]",
          inverse ? "text-fg-inverse" : "text-navy-900 dark:text-fg",
        )}
      >
        <span className="text-[0.6875rem] font-medium opacity-70">The</span>
        <span className="text-[0.9375rem] font-bold">Property</span>
        {variant === "full" && (
          <span className="text-[0.9375rem] font-bold">
            Helpline
            <span className="align-super text-[0.5em] font-semibold opacity-70">
              ™
            </span>
          </span>
        )}
      </span>
    </span>
  );
}
