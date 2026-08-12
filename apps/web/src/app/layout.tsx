import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { JourneyStoreProvider } from "@/lib/store/journey-store";
import "./globals.css";

/**
 * Inter — docs/03-experience/08-typography.md §1.
 * [A-18], Low confidence: no brand font was supplied. Chosen for its true
 * tabular numerals (essential to the comparison table), disambiguated Il1
 * (lot/plan identifiers like 12/RP801234), open apertures for older-user
 * legibility, and an OFL licence that permits self-hosting.
 *
 * `display: swap` keeps text readable before the font loads; `adjustFontFallback`
 * matches fallback metrics so the swap causes ~0 layout shift (protects CLS ≤ 0.1).
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Property Helpline — Your property journey, in one place you control",
    template: "%s · The Property Helpline",
  },
  description:
    "Compare the homes you're considering, see where you stand, and connect with a professional only when you choose — on your terms.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/*
            The prototype store now sits at the root rather than around the
            authenticated area alone. The public homepage, the search results
            and the professional directory all read and write it — saving a
            listing from the homepage has to land in the same shortlist the
            journey screens use, which is the whole point of the new direction.
          */}
          <JourneyStoreProvider>{children}</JourneyStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
