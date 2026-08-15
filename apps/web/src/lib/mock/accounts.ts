/**
 * ⚠️ MOCK AUTHENTICATION — PROTOTYPE ONLY.
 *
 * There is no backend, no session server, no token, no SMS gateway, no password
 * hashing and no transport security here. Everything below is compared in the
 * browser against constants, and the resulting "session" is a plain object in
 * localStorage that anyone can edit from a console.
 *
 * The one-time code is generated in the browser AND DISPLAYED ON SCREEN. That is
 * not a shortcut to hide — it is the honest way to demonstrate an OTP step
 * without an SMS provider, and the screen says so in as many words.
 *
 * This exists so a PM/client demonstration feels like a real product with four
 * separate experiences. It is NOT a security boundary and must be replaced:
 *
 *   · real identity provider / managed authentication (FR-01-09, NFR-1.8)
 *   · a real SMS or WhatsApp OTP provider, with rate limiting and expiry
 *   · server-side session and route protection — a client-side check protects
 *     nothing, it only shapes the UI
 *   · MFA on admin (NFR-1.8)
 *   · the professional invite flow ([C-03]) rather than a shared password
 *
 * The documented Stage 1 auth screens (S03 register, S04 verify email, S05 sign
 * in, S06 reset) remain unbuilt; this is a demo door, not those screens.
 */

import type { Role } from "./types";

/** How an account proves who it is in the prototype. */
export type AuthMethod = "otp" | "password";

export interface DemoAccount {
  role: Role;
  /** Phone for the consumer roles; the admin signs in with `email` instead. */
  phone: string;
  email: string | null;
  /** Admin only. Fictional. */
  password: string | null;
  method: AuthMethod;
  /** Who the reviewer is "being" once signed in */
  name: string;
  context: string;
  blurb: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "buyer",
    phone: "0400 000 001",
    email: "barbara@example.com",
    password: null,
    method: "otp",
    name: "Barbara Nguyen",
    context: "Buying in Carindale",
    blurb: "Search, save, compare, and connect a professional",
  },
  {
    role: "seller",
    phone: "0400 000 004",
    email: "michael@example.com",
    password: null,
    method: "otp",
    name: "Michael Tran",
    context: "Selling in Mansfield",
    blurb: "List a property and see who is interested",
  },
  {
    role: "professional",
    phone: "0400 000 002",
    email: "craig@buildcheck.example",
    password: null,
    method: "otp",
    name: "Craig Mullins",
    context: "BuildCheck · Building inspector",
    blurb: "Requests, connections and outputs",
  },
  {
    role: "admin",
    phone: "0400 000 003",
    email: "ops@propertyhelpline.example",
    password: "password",
    method: "password",
    name: "TPH Operations",
    context: "Internal team",
    blurb: "Verify professionals and oversee the platform",
  },
];

/** Digits only, so "0400 000 001" and "0400000001" both work. */
export function normalisePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function findAccount(identifier: string): DemoAccount | undefined {
  const digits = normalisePhone(identifier);
  const lower = identifier.trim().toLowerCase();

  return DEMO_ACCOUNTS.find(
    (a) =>
      (digits.length >= 6 && normalisePhone(a.phone) === digits) ||
      (a.email !== null && a.email.toLowerCase() === lower),
  );
}

export function accountForRole(role: Role): DemoAccount {
  return DEMO_ACCOUNTS.find((a) => a.role === role) ?? DEMO_ACCOUNTS[0];
}

/**
 * A six-digit code.
 *
 * Deliberately random rather than a fixed "123456": a hard-coded code teaches a
 * reviewer that the field is decorative, and the first thing anyone does with a
 * decorative field is skip it. A random code has to actually be read and typed,
 * which is what the real step will feel like.
 */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Where each role lands after signing in. */
export const HOME_FOR: Record<Role, string> = {
  buyer: "/prop-id",
  seller: "/seller",
  professional: "/pro",
  admin: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "Buyer",
  seller: "Seller",
  professional: "Professional",
  admin: "Admin",
};

/** One line each, for the role chooser on the sign-in screen. */
export const ROLE_BLURB: Record<Role, string> = {
  buyer: "Search, save and compare properties, and hire professionals",
  seller: "List a property and manage buyer interest",
  professional: "Take requests, run connections and return your work",
  admin: "Verify professionals and oversee the platform",
};
