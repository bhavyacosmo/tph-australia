"use client";

import Link from "next/link";
import { ArrowRight, Columns3, Compass, Link2, Lock } from "lucide-react";

import { Container } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { isBuilt, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * "Four tools that talk to each other."
 *
 * The client picked this phrase out unprompted on the call and said so twice:
 * *"That's really nice, this one. This is a really nice one you picked up, four
 * tools that talk to each other. That's pretty good."* (transcript L169)
 *
 * It also happens to be the clearest one-screen statement of the product logic
 * he set out at the end of the call (L727-735): Home Compass guides, Prop ID
 * organises and controls, Trust Link connects, Progress Map coordinates.
 *
 * Kept deliberately compact — the window shopper above it is here for
 * properties, and this is the bridge for the serious buyer, not a feature wall.
 */

const TOOLS = [
  {
    label: "Home Compass",
    role: "Guides you",
    body: "Tells you the one next thing to do, and remembers where you were.",
    href: routes.journey("j1"),
    icon: Compass,
    tint: "bg-info-bg text-info-fg",
  },
  {
    label: "Prop ID",
    role: "Organises and controls",
    body: "Every property, note, comparison and document in one record that is yours.",
    href: routes.propId(),
    icon: Lock,
    tint: "bg-propid-surface text-propid-surface-fg",
  },
  {
    label: "Trust Link",
    role: "Connects you",
    body: "You choose the professional, what they see, and for how long.",
    href: routes.trustLinkNew(),
    icon: Link2,
    tint: "bg-trustlink-wash text-action",
  },
  {
    label: "Progress Map",
    role: "Coordinates it",
    body: "Where you are across the whole purchase, not just one step of it.",
    href: routes.propIdProgress(),
    icon: Columns3,
    tint: "bg-attention-bg text-attention-fg",
  },
];

export function FourTools() {
  return (
    <section
      aria-labelledby="tools-heading"
      className="border-y border-line-subtle bg-surface-sunken py-16 md:py-20"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-overline uppercase text-fg-muted">
            For when you&apos;re serious
          </p>
          <h2 id="tools-heading" className="mt-3 text-h1 text-fg-heading">
            Four tools that talk to each other
          </h2>
          <p className="measure mt-4 text-body-lg text-fg-secondary">
            Most people start by looking. When you&apos;re ready to act, these
            four carry everything you&apos;ve already done forward.
          </p>
        </div>

        <RevealGroup
          className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle md:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {TOOLS.map((tool) => {
            const built = isBuilt(tool.href);
            const inner = (
              <>
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-full",
                    tool.tint,
                  )}
                >
                  <tool.icon aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-5 text-overline uppercase text-fg-muted">
                  {tool.role}
                </p>
                <p className="mt-2 text-h4 text-fg-heading">{tool.label}</p>
                <p className="measure mt-2 text-body-sm text-fg-secondary">
                  {tool.body}
                </p>
                {built && (
                  <span className="mt-4 flex items-center gap-1.5 text-body-sm font-medium text-fg-link">
                    Open
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/tool:translate-x-0.5"
                    />
                  </span>
                )}
              </>
            );

            return (
              <RevealItem key={tool.label}>
                {built ? (
                  <Link
                    href={tool.href}
                    className="group/tool flex h-full flex-col bg-surface-card p-6 transition-colors duration-[var(--duration-base)] hover:bg-surface-page"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col bg-surface-card p-6">
                    {inner}
                  </div>
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
