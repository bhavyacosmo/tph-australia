import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Our type scale uses semantic names (`text-h1`, `text-body-sm`) rather than
 * Tailwind's default `text-sm` / `text-lg` (typography.md §2).
 *
 * tailwind-merge cannot know that, so out of the box it classifies
 * `text-body-sm` as a TEXT COLOUR utility and drops any real colour class that
 * appeared earlier — e.g. `text-action-fg text-body-sm` silently loses the
 * white foreground on a primary button.
 *
 * Declaring the font-size group fixes the classification: these names are
 * sizes, everything else under `text-*` is a colour.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "overline",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
