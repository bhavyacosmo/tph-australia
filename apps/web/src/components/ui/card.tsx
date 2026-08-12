import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card — docs/03-experience/11-component-library.md §2
 *
 * Default treatment is a hairline border with no shadow (spacing-system.md §7:
 * "borders by default; shadows only for layered surfaces"). A card sitting on
 * the page is not floating and should not pretend to.
 *
 * `interactive` adds a hover lift — only for cards that are genuinely a link
 * or a control. A card that lifts but cannot be clicked is a lie.
 */
const cardVariants = cva(
  "rounded-xl border transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
  {
    variants: {
      tone: {
        default: "border-line-subtle bg-surface-card",
        sunken: "border-line-subtle bg-surface-sunken",
        inverse: "border-transparent bg-propid-surface text-propid-surface-fg",
        outline: "border-line-subtle bg-transparent",
      },
      pad: {
        none: "",
        sm: "p-4",
        md: "p-5 md:p-6",
        lg: "p-6 md:p-8",
      },
      interactive: {
        true: "hover:-translate-y-0.5 hover:border-line hover:shadow-elev-hover",
        false: "",
      },
    },
    defaultVariants: { tone: "default", pad: "md", interactive: false },
  },
);

function Card({
  className,
  tone,
  pad,
  interactive,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ tone, pad, interactive }), className)}
      {...props}
    />
  );
}

export { Card, cardVariants };
