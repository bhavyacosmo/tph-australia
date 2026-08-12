import { Info, Mail, Scale } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Container } from "@/components/ui/section";

export const metadata = { title: "Legal and contact" };

/**
 * S30 — legal, and contact.
 *
 * The footer needs real destinations for Terms, Privacy and Contact. Drafting
 * those documents is a legal exercise, not a design one, so this page states
 * plainly that they are not drafted rather than inventing text that could be
 * read as binding — and it does carry the one legal statement that IS settled:
 * the role boundary from [MVP] p.10 Gate 7.
 *
 * FR-01-10 requires the accepted terms VERSION to be recorded at registration.
 * That is noted here so it is not forgotten when the real documents arrive.
 */
export default function LegalPage() {
  return (
    <PublicShell>
      <Container className="py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-overline uppercase text-fg-muted">Legal</p>
          <h1 className="mt-4 text-h1 text-fg-heading">
            Terms, privacy and contact
          </h1>
        </div>

        {/* -------------------------------------------------- role boundary */}
        <section className="mt-12 max-w-3xl rounded-2xl border-l-2 border-action bg-surface-card p-6">
          <h2 className="flex items-center gap-2 text-h4 text-fg-heading">
            <Scale aria-hidden="true" className="size-4 text-action" />
            What The Property Helpline is, and is not
          </h2>
          <p className="measure mt-4 text-body text-fg-secondary">
            The Property Helpline provides guidance and organisation. We do not
            provide legal, financial, credit, valuation, engineering or licensed
            agency services, and nothing on this platform is advice of that kind.
            Where information comes from a government source we say so and give
            the date it was checked; where it is a screening indicator we say that
            too. Being listed here is not an endorsement of a professional and not
            a guarantee of their work.
          </p>
        </section>

        <div className="mt-16 grid max-w-3xl gap-14">
          <section id="terms" className="scroll-mt-24">
            <h2 className="text-h2 text-fg-heading">Terms</h2>
            <p className="measure mt-4 flex items-start gap-3 rounded-xl border border-dashed border-line bg-surface-card px-5 py-4 text-body-sm text-fg-muted">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                Not drafted for this prototype. Rather than publish placeholder
                terms that could be mistaken for the real thing, this section is
                deliberately empty. When the real document exists, the version a
                user accepted must be recorded with a timestamp at registration.
              </span>
            </p>
          </section>

          <section id="privacy" className="scroll-mt-24">
            <h2 className="text-h2 text-fg-heading">Privacy</h2>
            <p className="measure mt-4 text-body text-fg-secondary">
              The product position is described in full on{" "}
              <a
                href="/trust-link#privacy"
                className="text-fg-link underline underline-offset-4 hover:no-underline"
              >
                how Trust Link works
              </a>
              : nothing about you reaches a professional without a Trust Link you
              authorised, and you can withdraw it at any time.
            </p>
            <p className="measure mt-4 flex items-start gap-3 rounded-xl border border-dashed border-line bg-surface-card px-5 py-4 text-body-sm text-fg-muted">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                The formal privacy notice — collection, use, disclosure, retention
                and access rights — is not drafted for this prototype. It is a
                launch gate, not an afterthought.
              </span>
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-h2 text-fg-heading">Contact</h2>
            <p className="measure mt-4 text-body text-fg-secondary">
              Support is founder-operated at this stage — a real person reads
              everything that comes in.
            </p>
            <p className="mt-5 flex items-center gap-2.5 text-body text-fg-secondary">
              <Mail aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
              A contact address has not been set for this prototype.
            </p>
          </section>
        </div>
      </Container>
    </PublicShell>
  );
}
