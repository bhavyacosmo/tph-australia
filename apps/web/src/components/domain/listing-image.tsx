import Image from "next/image";

import { listingImage, listingTint } from "@/lib/mock/media";
import { cn } from "@/lib/utils";

/**
 * Imagery for a demo listing.
 *
 * Where a real photograph exists it is used. Where one does not, this renders a
 * composed typographic tile rather than a grey placeholder box — a wall of
 * "image missing" reads as a broken feed, and repeating one stock photo across
 * eight listings reads worse.
 *
 * All resolution happens in src/lib/mock/media.ts, so real client photography
 * replaces this without touching a component.
 */
export function ListingImage({
  imageKey,
  suburb,
  propertyType,
  className,
  sizes = "(max-width: 768px) 100vw, 420px",
  priority = false,
}: {
  imageKey: string;
  suburb: string;
  propertyType: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = listingImage(imageKey);

  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-sunken", className)}>
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          className="object-cover"
          {...(priority
            ? { preload: true, loading: "eager" as const, fetchPriority: "high" as const }
            : {})}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden bg-gradient-to-br",
        listingTint(imageKey),
        className,
      )}
    >
      <div className="grain absolute inset-0" />
      <div className="relative flex h-full flex-col justify-end p-4">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-white/50">
          {propertyType}
        </p>
        <p className="mt-1 text-h4 leading-tight text-white/85">{suburb}</p>
        <p className="mt-2 text-[0.625rem] uppercase tracking-wider text-white/40">
          Photo to come
        </p>
      </div>
    </div>
  );
}
