/**
 * Formatting helpers. Australian English and en-AU formats throughout —
 * docs/03-experience/14-content-and-microcopy.md.
 */

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null): string {
  if (value === null) return "Not recorded";
  return AUD.format(value);
}

const LONG_DATE = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
});

export function formatDate(iso: string): string {
  return LONG_DATE.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(new Date(iso));
}

const TIME = new Intl.DateTimeFormat("en-AU", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_DATE.format(d)} at ${TIME.format(d)}`;
}

/**
 * "Saved just now" / "Saved 2 days ago".
 *
 * FR-05-13 requires showing WHEN data was last saved. A relative phrase is
 * easier to act on than a timestamp, so the absolute value goes in the
 * `title`/tooltip at the call site rather than being lost.
 */
export function formatRelative(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  const seconds = Math.round((now - then) / 1000);

  if (seconds < 45) return "just now";
  if (seconds < 90) return "a minute ago";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  return `on ${formatDate(iso)}`;
}

/** "in 9 days" — used for Trust Link permission expiry */
export function formatUntil(iso: string, now = Date.now()): string {
  const days = Math.ceil((new Date(iso).getTime() - now) / 86_400_000);
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
