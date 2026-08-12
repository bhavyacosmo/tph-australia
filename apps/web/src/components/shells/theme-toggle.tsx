"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Light and dark are both first-class (colour-system.md §9).
 * Rendered as a placeholder until mounted so the server and client markup
 * match — next-themes cannot know the resolved theme during SSR.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-11 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-surface-sunken hover:text-fg"
    >
      {mounted ? (
        isDark ? (
          <Sun aria-hidden="true" className="size-5" />
        ) : (
          <Moon aria-hidden="true" className="size-5" />
        )
      ) : (
        <span aria-hidden="true" className="size-5" />
      )}
      <span className="sr-only">
        {mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Switch theme"}
      </span>
    </button>
  );
}
