"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";

import { TphLogo } from "@/components/brand/tph-logo";
import { Container } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

/**
 * PublicFooter.
 * docs/03-experience/05-navigation-structure.md §6
 *
 * Non-buyer journeys (Selling, Renting, Getting property ready) live HERE, not
 * in the header. [H1] p.6 permits them as content and enquiry routes, but they
 * must not have navigational parity with the buyer journey (C-14).
 *
 * The information architecture is unchanged from the original footer — every
 * group, label and destination is the same. What changed is presentation: the
 * columns rise into place in sequence as the footer arrives, the rule above
 * them draws across, links carry a growing underline, and the wordmark closes
 * the page as a large clipped watermark. A footer is the last thing a reviewer
 * sees; leaving it as four plain lists undersells everything above it.
 *
 * Everything here degrades to a static document under `prefers-reduced-motion`:
 * `Reveal*` renders plain elements, the rule renders at full width, and the
 * remaining motion is CSS transition only, which the global reduced-motion rule
 * already neutralises.
 */

/**
 * Every destination here now resolves to a real page. The previous version
 * linked to eight routes that were never built — /how-it-works, /sell, /rent,
 * /get-property-ready, /learn, /contact, /terms, /privacy — so the whole footer
 * was 404s.
 *
 * C-14 still holds: the non-buyer journeys (selling, renting, getting property
 * ready) live in the footer as content and enquiry routes, without navigational
 * parity with the buyer journey. They are now sections of /research.
 */
const FOOTER_GROUPS = [
  {
    heading: "Buying",
    links: [
      { label: "Property search", href: "/search" },
      { label: "Professionals", href: "/professionals" },
      { label: "Home Compass", href: "/journey" },
      { label: "Trust Link", href: "/trust-link" },
    ],
  },
  {
    heading: "Research",
    links: [
      { label: "What an address tells you", href: "/research#council-data" },
      { label: "Other journeys", href: "/research#other-journeys" },
      { label: "Learn", href: "/research#learn" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { label: "How Trust Link works", href: "/trust-link" },
      { label: "Your privacy and control", href: "/trust-link#privacy" },
      { label: "For professionals", href: "/for-professionals" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "/legal#contact" },
      { label: "Terms", href: "/legal#terms" },
      { label: "Privacy", href: "/legal#privacy" },
    ],
  },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      /*
        Footer links are standalone targets, not inline links in a sentence, so
        the WCAG 2.5.8 inline exception does not apply. min-h-11 meets our 44px
        standard (RSP-05) — this matters most on tablets, which a `md:`
        breakpoint would not have covered.
      */
      className="group/link flex min-h-11 items-center text-body-sm text-fg-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] hover:text-fg"
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100"
        />
      </span>
    </Link>
  );
}

export function PublicFooter() {
  const reduce = useReducedMotion();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line-subtle bg-surface-card">
      {/* A single soft wash at the top edge, so the footer reads as a surface
          the page settles onto rather than another flat white band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-surface-sunken to-transparent"
      />

      <Container className="relative pt-16 pb-10 md:pt-20 md:pb-12">
        <RevealGroup
          className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-8"
          stagger={0.07}
        >
          {/*
            Two link columns up to `lg`, four beyond it. Four columns at tablet
            width leaves about 148px per column, which wraps "Your privacy and
            control" onto three lines — legibility beats symmetry here.
          */}
          <RevealItem className="col-span-2 md:col-span-12 lg:col-span-4">
            <TphLogo variant="full" />
            <p className="measure mt-5 text-body-sm text-fg-secondary">
              Your property journey, in one place you control.
            </p>
            <p className="mt-3 flex items-center gap-2 text-body-sm text-fg-muted">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              Brisbane, Queensland
            </p>
          </RevealItem>

          {FOOTER_GROUPS.map((group) => (
            <RevealItem
              key={group.heading}
              className="md:col-span-6 lg:col-span-2"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px w-4 shrink-0 bg-action"
                />
                <h2 className="text-overline uppercase text-fg-muted">
                  {group.heading}
                </h2>
              </div>
              <ul className="mt-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* The rule draws across as the footer arrives */}
        <motion.div
          aria-hidden="true"
          initial={reduce ? undefined : { scaleX: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT_EXPO }}
          style={{ originX: 0 }}
          className="rule-fade my-10"
        />

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/*
            Role-boundary disclaimer. [MVP] p.10 Gate 7 — TPH must not be
            presented as providing legal, financial, credit, valuation,
            engineering or licensed agency services. Given a green rule and its
            own indent so it reads as a standing statement, not small print.
          */}
          <p className="max-w-[62ch] border-l-2 border-action/40 pl-4 text-caption text-fg-muted">
            The Property Helpline provides guidance and organisation. We
            don&apos;t provide legal, financial, credit, valuation or building
            advice.
          </p>
          <p className="shrink-0 text-caption text-fg-muted">
            © {new Date().getFullYear()} The Property Helpline™
          </p>
        </div>

        {/*
          Closing watermark. The brand's own name at display scale — the same
          big-type device used at the interstitial and the close, so the page
          ends in its own voice rather than trailing off.

          The size is tuned to fit one line inside the container at every width
          (about 10.9em of advance width for these 21 characters), and the
          footer clips anyway, so it can never produce a horizontal scrollbar.
          Decorative: hidden from assistive technology, and the accessible name
          is already carried by the logo above.
        */}
        <motion.p
          aria-hidden="true"
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT_EXPO }}
          className="mt-14 select-none whitespace-nowrap text-[clamp(1.75rem,7.2vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-fg-heading/[0.07]"
        >
          The Property Helpline
        </motion.p>
      </Container>
    </footer>
  );
}
