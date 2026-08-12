import Image from "next/image";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Property } from "@/lib/mock/types";

/**
 * The one place property photography enters the application.
 *
 * docs/03-experience/20-remaining-ui-implementation-plan.md §8
 *
 * Properties are the user's OWN saved records, and most will have no
 * photograph — so the typographic fallback is the normal case, not an error
 * state. It uses the address initial rather than a grey placeholder box, which
 * keeps a shortlist of eight looking composed instead of broken.
 *
 * Assets are keyed, not URL'd, so replacing the two prototype photographs with
 * real ones later is a change to this file alone.
 */

const ASSETS = {
  exterior: "/img/home-exterior.jpg",
  interior: "/img/home-interior.jpg",
} as const;

export function PropertyImage({
  property,
  className,
  sizes = "(max-width: 640px) 100vw, 176px",
}: {
  property: Pick<Property, "address" | "imageKey">;
  className?: string;
  sizes?: string;
}) {
  if (property.imageKey) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-sunken", className)}>
        <Image
          src={ASSETS[property.imageKey]}
          /*
            Described as the user's own record, never as a listing photo. The
            address is deliberately not repeated — it sits beside the image, and
            repeating it makes screen readers announce it twice.
          */
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative grid place-items-center overflow-hidden bg-surface-sunken",
        className,
      )}
    >
      <span className="flex flex-col items-center gap-1 text-fg-muted">
        <Home className="size-5" />
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider">
          No photo
        </span>
      </span>
    </div>
  );
}
