/**
 * The one place image assets are resolved.
 *
 * Everything referencing imagery uses a KEY, never a path — so replacing demo
 * assets with the client's real photography is a change to this file alone.
 *
 * ── Honest note about the prototype ──────────────────────────────────────────
 * Two real photographs exist in the project. The rest of the demo listings
 * resolve to `null`, and the components fall back to a typographic tile keyed to
 * the suburb. That is a deliberate choice: a repeated stock photo across eight
 * listings reads as a broken feed, and inventing photographs of properties that
 * do not exist would be misleading in a demo the client may show onward.
 *
 * For professionals we do NOT fabricate faces. `photoUrl` is null and the avatar
 * falls back to a monogram. The client asked for faces on the homepage
 * (transcript L255) — real headshots need to come from the five Brisbane
 * founding professionals, with their permission. Drop them in
 * /public/img/pro/<id>.jpg and set `photoUrl` in marketplace.ts.
 *
 * To add real listing photography: put files in /public/img/listings/ and add
 * them to LISTING_IMAGES below.
 */

const LISTING_IMAGES: Record<string, string> = {
  "exterior-1": "/img/home-exterior.jpg",
  "interior-1": "/img/home-interior.jpg",
};

export function listingImage(key: string): string | null {
  return LISTING_IMAGES[key] ?? null;
}

/**
 * A stable, pleasant tint per listing so a wall of fallbacks still reads as a
 * composed grid rather than a row of grey boxes. Derived from the key, so a
 * given listing always looks the same.
 */
const TINTS = [
  "from-navy-800 to-navy-900",
  "from-teal-700 to-navy-900",
  "from-navy-700 to-teal-800",
  "from-slate-700 to-navy-800",
  "from-teal-800 to-navy-800",
] as const;

export function listingTint(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 997;
  }
  return TINTS[hash % TINTS.length];
}

/** Initials for the professional monogram fallback. */
export function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
