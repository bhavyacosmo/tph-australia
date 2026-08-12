# The Property Helpline — Stage 1 frontend prototype

A high-fidelity, clickable prototype of The Property Helpline (TPH): a Brisbane
property platform built around four connected tools.

> **Home Compass** guides the buyer · **Prop ID** organises everything about a
> property · **Trust Link** connects buyer and professional under the buyer's
> control · **Progress Map** tracks the purchase.

## ⚠️ This is a prototype, not a product

Read this before assuming anything works the way it looks:

- **There is no backend.** No API, no database, no server. All state lives in
  `localStorage` via a single React context (`src/lib/store/journey-store.tsx`).
- **Authentication is mocked.** Credentials are compared against constants in the
  browser and the "session" is a plain object anyone can edit from a console. See
  `src/lib/mock/accounts.ts` for the full list of what must replace it before
  production. Route guards shape the UI; they are not a security boundary.
- **Property listings are hand-written demo data.** There is no feed, no scraping
  and no listing API — see `src/lib/mock/marketplace.ts`.
- **Professionals are fictional.** Business names are invented. Verification
  wording states what was checked and when, against demo records.
- **No real files.** Upload and download are not wired.

### Demo accounts

| Role | Phone | Password |
| --- | --- | --- |
| Buyer | `0400 000 001` | `password` |
| Professional | `0400 000 002` | `password` |
| Admin | `0400 000 003` | `password` |

The sign-in page has a **Demo access** panel that fills these in.

## Running it

```bash
cd apps/web
pnpm install
pnpm dev
```

Requires Node 20+ and pnpm. Built on Next.js 16 (App Router, Turbopack),
TypeScript, Tailwind CSS v4 and Framer Motion.

## The demo path

Homepage → search → listing → **save** → it becomes your own property record →
Home Compass → Buyer Readiness → **Trust Link** (choose service, professional,
and exactly what to share) → sign in as the professional → **authorise** →
connection activates → submit a report → it lands in the buyer's Prop ID and
advances the **Progress Map**.

## Structure

```
apps/web/src/
  app/                  routes — (app) group holds the authenticated area
  components/
    auth/               sign-in, role guard
    domain/             property, listing and professional cards; evidence cells
    journey/            Home Compass — setup, shortlist, compare, property
    readiness/          Buyer Readiness — steps, dial, result
    trustlink/          request wizard and active connection
    pro/                professional surface
    prop-id/            the buyer's record, incl. the transaction Progress Map
    shells/             public, app, professional chrome
    ui/                 primitives — button, field, page scaffolding
  lib/
    mock/               all demo data, in one place, deliberately swappable
    store/              the prototype state container
```

Design tokens live in `src/app/globals.css` in three layers (primitive →
semantic → component). No component references a raw colour.

## Some decisions worth knowing

- **Property comparison cells carry provenance.** Every fact shows whether it is
  the user's own entry, confirmed Council open data, a screening indicator (with
  its limitation and a link to the official source), or genuinely absent —
  rendered as "No data returned", never as a favourable value.
- **Every optional Trust Link item defaults to off.** Only the property address
  is required, because the service cannot be performed without it.
- **A professional sees purpose, suburb and timing before accepting** — never the
  street address, the buyer's name or any contact detail. After accepting they see
  exactly the items the buyer switched on, and nothing else.
- **Verification is never a bare badge.** An admin records *what* was checked and
  *when*; the published wording is derived from that record.
- **Two progress models, kept separate.** The transaction stages (Agent → Finance
  → Building & Pest → Conveyancer → Settlement) are provisional and marked as
  such; the eight Home Compass milestones track preparation. Merging them would
  produce two numbers that disagree.
- **There is no document vault.** Only files returned through an authorised Trust
  Link are stored, filed against the property they concern.

## Not in this repository

Client requirement documents, the client/PM meeting transcript, manager-supplied
reference images and the internal analysis that quotes them are **excluded** —
they are the client's confidential material and this repository is public. See
`.gitignore`.
