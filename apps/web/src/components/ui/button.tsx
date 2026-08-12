import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Button — docs/03-experience/11-component-library.md §1.1
 *
 * Variants map 1:1 to the documented set. Exactly ONE `primary` per screen
 * (design-principles.md, principle 2).
 *
 * Sizes follow spacing-system.md §5: 44px minimum on every interactive
 * control. shadcn's stock 32px default is below our floor and is demoted to
 * `sm`, permitted on desktop tables only.
 *
 * Craft details:
 *  - `--sheen` inset highlight along the top edge of solid fills
 *  - 1px press translation, so the control acknowledges the click
 *  - expressive ease-out, not the Material default
 *
 * Focus is handled globally by `:focus-visible`. Removing it without a
 * replacement is a release-blocking accessibility defect (WCAG 2.4.7).
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-md border font-medium whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow,transform]",
    "duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
    "select-none active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
    "disabled:active:translate-y-0",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-action text-action-fg shadow-control hover:bg-action-hover active:bg-action-active",
        /** Navy. The references use it for Search-style secondary emphasis. */
        brand:
          "border-transparent bg-brand text-brand-fg shadow-control hover:bg-brand-hover",
        secondary:
          "border-line-subtle bg-action-secondary text-action-secondary-fg shadow-elev-1 hover:border-line hover:bg-surface-sunken",
        tertiary:
          "border-transparent bg-transparent text-fg-secondary hover:bg-surface-sunken hover:text-fg",
        destructive:
          "border-transparent bg-danger text-danger-fg shadow-control hover:opacity-90",
        link: "h-auto border-transparent bg-transparent p-0 text-fg-link underline underline-offset-4 hover:no-underline active:translate-y-0",
      },
      size: {
        /** 32px — desktop table rows only. Below the 44px touch-target floor. */
        sm: "h-8 px-3 text-body-sm",
        /** 44px — the default everywhere else. */
        md: "h-11 px-5 text-body-sm",
        /** 52px — landing CTA and the Trust Link confirmation. */
        lg: "h-13 px-7 text-body",
        icon: "size-11",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    compoundVariants: [
      { variant: "link", size: "sm", class: "h-auto px-0" },
      { variant: "link", size: "md", class: "h-auto px-0" },
      { variant: "link", size: "lg", class: "h-auto px-0" },
    ],
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

type ButtonBaseProps = Omit<
  ComponentProps<"button">,
  "onClick" | "type" | "children"
> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    loading?: boolean;
  };

/**
 * A button MUST resolve to a real action.
 *
 * `ENT-01` — "All visible buttons resolve to a real page, real state change or
 * working form". This union makes a decorative button a compile error: supply
 * `onClick`, or `type="submit"`. For navigation, use `ButtonLink`.
 */
type ButtonProps = ButtonBaseProps &
  (
    | { onClick: MouseEventHandler<HTMLButtonElement>; type?: "button" | "reset" }
    | { type: "submit"; onClick?: MouseEventHandler<HTMLButtonElement> }
  );

function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading ? (
        <>
          {/* Width preserved so the control does not resize mid-action */}
          <span className="absolute inset-0 grid place-items-center">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          </span>
          <span className="sr-only">Working…</span>
          <span aria-hidden="true" className="opacity-0">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Navigation styled as a button. Renders a real anchor, so it works before
 * hydration and supports middle-click and open-in-new-tab.
 */
type ButtonLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants>;

function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      data-slot="button-link"
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}

export { Button, ButtonLink, buttonVariants };
export type { ButtonProps, ButtonLinkProps };
