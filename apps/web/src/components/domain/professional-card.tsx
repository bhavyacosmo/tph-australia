"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ArrowRight, Info, MapPin } from "lucide-react";

import { StatusChip } from "@/components/ui/status-chip";
import { monogram } from "@/lib/mock/media";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Professional } from "@/lib/mock/types";

/**
 * ProfessionalCard and its verification treatment.
 *
 * The client asked for a "Verified badge" (wireframe §5) and introduced a
 * verified / non-verified split on the call (L335). PRO-05 and the mockup
 * analysis finding M2-G3 both say a bare "Verified" is a legal exposure: the
 * published wording must reflect the evidence actually reviewed.
 *
 * The resolution is a badge that carries its own evidence — "Verified · QBCC
 * licence checked 12 August 2026" — and an equally explicit treatment for
 * professionals TPH has NOT checked, rather than silence, which a reader would
 * otherwise fill in charitably.
 *
 * Never rendered here: ratings, review counts, "top rated", response times, or
 * any contact detail. Reading a profile sends nothing (FR-06-10…12).
 */

export function VerificationBadge({
  professional,
  size = "sm",
}: {
  professional: Professional;
  size?: "sm" | "md";
}) {
  if (!professional.verification) {
    return (
      <StatusChip tone="neutral" icon={<Info aria-hidden="true" className="size-3" />}>
        Not yet checked by TPH
      </StatusChip>
    );
  }

  const { what, checkedOn } = professional.verification;

  return (
    <span
      className={cn(
        "inline-flex items-start gap-2 rounded-lg bg-success-bg px-2.5 py-1.5",
        size === "md" && "px-3 py-2",
      )}
    >
      <BadgeCheck
        aria-hidden="true"
        className="mt-px size-3.5 shrink-0 text-success-fg"
      />
      <span className="text-caption font-medium leading-snug text-success-fg">
        Verified
        <span className="font-normal">
          {" · "}
          {what} checked {formatDate(checkedOn)}
        </span>
      </span>
    </span>
  );
}

/** Photo where one exists; a monogram where one does not. Never a fake face. */
export function ProfessionalAvatar({
  professional,
  className,
}: {
  professional: Professional;
  className?: string;
}) {
  if (professional.photoUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-full bg-surface-sunken", className)}>
        <Image
          src={professional.photoUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-brand text-brand-fg",
        className,
      )}
    >
      <span className="text-h4 font-bold tracking-tight">
        {monogram(professional.contactName ?? professional.name)}
      </span>
    </div>
  );
}

export function ProfessionalCard({
  professional,
  href,
  variant = "full",
  action,
  className,
}: {
  professional: Professional;
  href?: string;
  /** `compact` is the homepage rail; `full` is the directory */
  variant?: "full" | "compact";
  action?: React.ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start gap-4">
        <ProfessionalAvatar
          professional={professional}
          className={variant === "compact" ? "size-12" : "size-14"}
        />
        <div className="min-w-0 flex-1">
          <p className="text-overline uppercase text-fg-muted">
            {professional.category}
          </p>
          <p
            className={cn(
              "mt-1 font-semibold text-fg-heading",
              variant === "compact" ? "text-body" : "text-h4",
            )}
          >
            {professional.name}
          </p>
          {professional.contactName && (
            <p className="text-body-sm text-fg-secondary">
              {professional.contactName}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-body-sm text-fg-muted">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            {professional.area}
          </p>
        </div>
      </div>

      {variant === "full" && (
        <p className="measure mt-4 text-body-sm text-fg-secondary">
          {professional.approach}
        </p>
      )}

      <div className="mt-4">
        <VerificationBadge professional={professional} />
      </div>

      {variant === "full" && professional.feeNote && (
        <p className="mt-3 text-body-sm text-fg-muted">{professional.feeNote}</p>
      )}
    </>
  );

  const shell = cn(
    "group/pro rounded-2xl border border-line-subtle bg-surface-card p-5",
    "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
    href && "hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2",
    className,
  );

  if (href && !action) {
    return (
      <Link href={href} className={cn(shell, "block")}>
        {body}
        <span className="mt-4 flex items-center gap-1.5 text-body-sm font-medium text-fg-link">
          Read the profile
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/pro:translate-x-0.5"
          />
        </span>
      </Link>
    );
  }

  return (
    <article className={shell}>
      {href ? <Link href={href}>{body}</Link> : body}
      {action && <div className="mt-5">{action}</div>}
    </article>
  );
}
