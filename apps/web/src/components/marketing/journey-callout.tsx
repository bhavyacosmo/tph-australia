import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The closing statements — one per audience.
 *
 * Three panels of the same shape and different colour, so the page ends by
 * naming everyone it is for. The buyer panel is the original close; the seller
 * and professional panels were added on client instruction, 15 August 2026.
 *
 * Typographic, not a card grid: at this scale the words *are* the composition,
 * which is why there is no illustration, no icon and no second column. It is
 * also the only place on the page where type runs to 5.5rem.
 *
 * The colour carries the meaning — navy is the buyer's surface, green is the
 * seller's, light is the professional's — so the three read as one system
 * rather than three repeats.
 */

type Tone = "navy" | "green" | "light";

const TONE: Record<
  Tone,
  {
    section: string;
    /** The first lines */
    text: string;
    /** The emphasised final line */
    accent: string;
    rule: string;
    note: string;
    button: "secondary" | "primary" | "brand";
    grain: boolean;
  }
> = {
  /* Buyer — white on navy, green accent. The established treatment. */
  navy: {
    section: "bg-navy-900",
    text: "text-white",
    accent: "text-green-400",
    rule: "opacity-40",
    note: "text-white/60",
    button: "secondary",
    grain: true,
  },
  /*
    Seller — the inverse of the buyer panel rather than a recolour of it: the
    soft tint carries the first lines and PURE WHITE lands the last one. Reusing
    green-400 as the accent here would have put the buyer's accent colour on the
    seller's surface, which is exactly the confusion the three tones exist to
    avoid.
  */
  green: {
    section: "bg-green-800",
    text: "text-green-100",
    accent: "text-white",
    rule: "opacity-30",
    /* /80, not /70 — at /70 the note measured 4.49:1 on this green, which is
       under AA by a hair. */
    note: "text-green-100/80",
    button: "secondary",
    grain: true,
  },
  /* Professional — navy on light, deep green accent. */
  light: {
    section: "border-t border-line-subtle bg-surface-sunken",
    text: "text-fg-heading",
    accent: "text-green-600",
    rule: "opacity-100",
    /* `fg-muted` is tuned against the white card surface and measures 4.34:1 on
       this sunken one — under AA for body text. */
    note: "text-fg-secondary",
    button: "brand",
    grain: false,
  },
};

export function JourneyCallout({
  tone,
  lines,
  accentLine,
  cta,
  href,
  note,
}: {
  tone: Tone;
  /** The lines before the emphasised one. Two reads best. */
  lines: string[];
  accentLine: string;
  cta: string;
  href: string;
  note: string;
}) {
  const t = TONE[tone];

  return (
    <section className={cn("relative isolate overflow-hidden", t.section)}>
      {t.grain && <div aria-hidden="true" className="grain absolute inset-0" />}

      <Container className="relative py-24 md:py-32 lg:py-40">
        <Reveal>
          <div className="max-w-4xl">
            <p
              className={cn(
                "text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.035em]",
                t.text,
              )}
            >
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className={cn("block", t.accent)}>{accentLine}</span>
            </p>

            <div className={cn("rule-fade my-12", t.rule)} />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/*
                One filled control per panel. The buyer's original variant is
                kept; the light panel uses navy instead, because a white button
                on a light surface would disappear.
              */}
              <ButtonLink
                href={href}
                variant={t.button}
                size="lg"
                className="group"
              >
                {cta}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                />
              </ButtonLink>
              <p className={cn("text-body-sm", t.note)}>{note}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
