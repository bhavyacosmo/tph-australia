import { Compass } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { ButtonLink } from "@/components/ui/button";

/**
 * S31 — Not found.
 * docs/03-experience/03-screen-inventory.md (S31)
 *
 * Error copy standard — docs/03-experience/14-content-and-microcopy.md §8:
 * never blame the user, never expose internals, always give the next action.
 *
 * During the incremental build this screen also catches routes that belong to
 * a later increment, so review stays graceful without any "coming soon"
 * placeholder inside the product itself (ENT-01).
 */
export default function NotFound() {
  return (
    <PublicShell>
      <div className="mx-auto flex max-w-(--container-content) flex-col items-start px-4 py-24 md:px-6 md:py-32 xl:px-8">
        <span className="inline-flex size-12 items-center justify-center rounded-lg bg-surface-sunken text-fg-muted">
          <Compass aria-hidden="true" className="size-6" />
        </span>

        <h1 className="mt-6 text-h1 text-fg">We couldn&apos;t find that page</h1>

        <p className="mt-4 max-w-[56ch] text-body text-fg-secondary">
          The link may be out of date, or the page may not exist. Your saved
          work is unaffected.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" variant="primary" size="md">
            Go to the home page
          </ButtonLink>
          <ButtonLink href="/how-it-works" variant="secondary" size="md">
            See how it works
          </ButtonLink>
        </div>
      </div>
    </PublicShell>
  );
}
