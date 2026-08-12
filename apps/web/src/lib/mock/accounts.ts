/**
 * ⚠️ MOCK AUTHENTICATION — PROTOTYPE ONLY.
 *
 * There is no backend, no session server, no token, no password hashing and no
 * transport security here. Credentials are compared in the browser against the
 * constants below, and the resulting "session" is a plain object in
 * localStorage that anyone can edit from a console.
 *
 * This exists so a PM/client demonstration feels like a real product with three
 * separate experiences, instead of a role switcher in the toolbar. It is NOT a
 * security boundary and must be replaced before anything ships:
 *
 *   · real identity provider / managed authentication (FR-01-09, NFR-1.8)
 *   · server-side session and route protection — a client-side check protects
 *     nothing, it only shapes the UI
 *   · MFA on admin (NFR-1.8)
 *   · the professional invite flow ([C-03]) rather than a shared password
 *
 * The documented Stage 1 auth screens (S03 register, S04 verify email, S05 sign
 * in, S06 reset) remain unbuilt; this is a single demo door, not those screens.
 */

import type { Role } from "./types";

export interface DemoAccount {
  role: Role;
  phone: string;
  /** Fictional. Identical across accounts on purpose — it is a demo. */
  password: string;
  /** Who the reviewer is "being" once signed in */
  name: string;
  context: string;
  blurb: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "buyer",
    phone: "0400 000 001",
    password: "password",
    name: "Barbara Nguyen",
    context: "Buying in Carindale",
    blurb: "Search, save, compare, and connect a professional",
  },
  {
    role: "professional",
    phone: "0400 000 002",
    password: "password",
    name: "Craig Mullins",
    context: "BuildCheck · Building inspector",
    blurb: "Requests, connections and outputs",
  },
  {
    role: "admin",
    phone: "0400 000 003",
    password: "password",
    name: "TPH Operations",
    context: "Internal team",
    blurb: "Verify professionals and oversee Trust Links",
  },
];

/** Digits only, so "0400 000 001" and "0400000001" both work. */
export function normalisePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function findAccount(phone: string): DemoAccount | undefined {
  const target = normalisePhone(phone);
  return DEMO_ACCOUNTS.find((a) => normalisePhone(a.phone) === target);
}

/** Where each role lands after signing in. */
export const HOME_FOR: Record<Role, string> = {
  buyer: "/journey/j1",
  professional: "/pro",
  admin: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "Buyer",
  professional: "Professional",
  admin: "Admin",
};
