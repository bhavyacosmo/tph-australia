"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Light and dark are both first-class schemes, never an inversion.
 * docs/03-experience/09-color-system.md §9
 *
 * Stored server-side in production so the preference follows the user across
 * devices; localStorage is sufficient for the prototype.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
