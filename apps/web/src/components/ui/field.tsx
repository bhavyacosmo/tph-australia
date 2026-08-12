"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Form primitives — docs/03-experience/11-component-library.md §1.2, §1.3
 *
 * `Field` owns the label/hint/error wiring so a screen cannot accidentally ship
 * an unlabelled control. The generated ids are threaded through
 * `aria-describedby` and `aria-invalid`, which is the part hand-rolled forms
 * always miss.
 *
 * FR-02-04 / FR-02-07 — every question may carry a plain-language "why we ask".
 * That is the `hint`, and it is rendered as help text rather than a tooltip
 * because a tooltip is unreachable on touch.
 *
 * All controls are 44px minimum (RSP-05). Focus is the global `:focus-visible`
 * ring; the extra border-colour change is additive, never a replacement.
 */

const CONTROL = [
  "w-full rounded-md border border-line bg-surface-card px-3.5 text-body",
  "text-fg placeholder:text-fg-muted",
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "hover:border-line-strong",
  "aria-[invalid=true]:border-danger",
  "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
].join(" ");

interface FieldShellProps {
  label: string;
  /** Plain-language "why we ask". FR-02-07 */
  hint?: ReactNode;
  error?: string;
  /** Rendered instead of a required asterisk — asterisks explain nothing */
  optional?: boolean;
  children: (ids: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  optional = false,
  children,
  className,
}: FieldShellProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className="flex flex-wrap items-baseline gap-x-2 text-body-sm font-medium text-fg-heading"
      >
        {label}
        {optional && (
          <span className="text-caption font-normal text-fg-muted">
            optional
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="mt-1 text-body-sm text-fg-muted">
          {hint}
        </p>
      )}

      <div className="mt-2">
        {children({ id, describedBy, invalid: Boolean(error) })}
      </div>

      {error && (
        <p
          id={errorId}
          className="mt-2 flex items-start gap-1.5 text-body-sm text-danger-fg"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(CONTROL, "min-h-28 py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(CONTROL, "h-11 appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}

/* ------------------------------------------------------------------- choices */

/**
 * A radio or checkbox rendered as a full-width selectable row.
 *
 * The real control stays a native `input` — it is visually hidden but present,
 * so keyboard, screen readers and form semantics all behave. `:focus-visible`
 * is projected onto the row with `peer-focus-visible:ring-*`; an outline on a
 * 1px hidden input is invisible, which is the bug this avoids.
 */
export function ChoiceRow({
  type,
  name,
  value,
  checked,
  onChange,
  label,
  description,
  className,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4",
        "transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
        checked
          ? "border-action bg-trustlink-wash"
          : "border-line-subtle bg-surface-card hover:border-line",
        className,
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border-2 transition-colors duration-[var(--duration-fast)]",
          type === "radio" ? "rounded-full" : "rounded-[0.3rem]",
          checked ? "border-action bg-action" : "border-line bg-surface-card",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-line-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-card",
        )}
      >
        {checked && (
          <span
            className={cn(
              "bg-action-fg",
              type === "radio" ? "size-2 rounded-full" : "size-2.5 rounded-[0.1rem]",
            )}
          />
        )}
      </span>

      <span className="min-w-0">
        <span className="block text-body-sm font-medium text-fg-heading">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-body-sm text-fg-secondary">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
