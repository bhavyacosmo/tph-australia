import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Page section rhythm and headings.
 * docs/03-experience/10-spacing-system.md §8 — vertical rhythm
 *
 * Section padding is generous and consistent. Uneven ad-hoc padding is the
 * clearest signal of an interface assembled rather than composed.
 */

const sectionVariants = cva("", {
  variants: {
    space: {
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-20 md:py-28 xl:py-32",
    },
    tone: {
      page: "",
      card: "bg-surface-card",
      sunken: "bg-surface-sunken",
    },
    divider: {
      true: "border-t border-line-subtle",
      false: "",
    },
  },
  defaultVariants: { space: "md", tone: "page", divider: false },
});

function Section({
  className,
  space,
  tone,
  divider,
  children,
  ...props
}: ComponentProps<"section"> & VariantProps<typeof sectionVariants>) {
  return (
    <section
      className={cn(sectionVariants({ space, tone, divider }), className)}
      {...props}
    >
      {children}
    </section>
  );
}

/** Constrains content to the page grid and applies the responsive gutter. */
function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-(--container-content) px-5 md:px-8 xl:px-10",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Small tracked label above a heading. Editorial convention: wide tracking,
 * uppercase, small. Sets up the scale contrast with the heading beneath it.
 */
function Eyebrow({
  className,
  children,
  ...props
}: ComponentProps<"p"> & { children: ReactNode }) {
  return (
    <p
      className={cn("text-overline uppercase text-fg-muted", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Standard section opening: eyebrow, heading, supporting line.
 * Keeping this composed in one place is what stops eight sections drifting
 * into eight slightly different heading treatments.
 */
function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          Heading === "h1" ? "text-display" : "text-h1",
          "text-fg-heading",
        )}
      >
        {title}
      </Heading>
      {lead && (
        <p
          className={cn(
            "mt-5 text-body-lg text-fg-secondary",
            align === "center" ? "measure mx-auto" : "measure",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

export { Section, Container, Eyebrow, SectionHeading, sectionVariants };
