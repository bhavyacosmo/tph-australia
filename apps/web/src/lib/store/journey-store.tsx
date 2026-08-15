"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { findAccount, ROLE_LABEL } from "@/lib/mock/accounts";
import {
  PROFESSIONALS as ALL_PROFESSIONALS,
  SEED_STAGES,
  serviceFor,
} from "@/lib/mock/marketplace";
import {
  DEMO_SELLER_ID,
  SEED_INTERESTS,
  SEED_PLATFORM_EVENTS,
  SEED_USERS,
  seedListings,
} from "@/lib/mock/platform";
import {
  CRITERIA_VERSION,
  SEED_ACTIVITY,
  SEED_APPLICATIONS,
  SEED_COMPARISON,
  SEED_JOURNEY,
  SEED_MILESTONES,
  SEED_PROPERTIES,
  SEED_USER,
  SHORTLIST_LIMIT,
} from "@/lib/mock/seed";
import {
  scoreReadiness,
  type AnswerValue,
  type ReadinessAssessment,
} from "@/lib/mock/readiness";
import type {
  ActivityEntry,
  AppState,
  Comparison,
  Interest,
  Journey,
  Listing,
  ListingStatus,
  Milestone,
  MilestoneKey,
  MilestoneState,
  Output,
  PendingProperty,
  PlatformEvent,
  PlatformUser,
  Professional,
  ProfessionalApplication,
  ProfessionalOverride,
  Property,
  PropertyStatus,
  Role,
  SavedSearch,
  ServiceKey,
  Session,
  TransactionStage,
  TrustLink,
} from "@/lib/mock/types";

/**
 * The prototype's journey store.
 *
 * docs/03-experience/20-remaining-ui-implementation-plan.md §1
 *
 * There is NO backend. This is React context over `localStorage`, seeded with
 * one user's journey. It exists because the brief's hardest requirement is
 * continuity — a property the user saves must reappear in the shortlist, the
 * comparison, Prop ID, the Trust Link context and the returned output. Static
 * per-page mock data cannot do that.
 *
 * It also lets the prototype demonstrate honestly:
 *   FR-02-05      save and continue later at every meaningful step
 *   FR-03-20…22   comparison, notes, order and status persist and reload
 *   FR-05-10…13   the return surface, including WHEN data was last saved
 *
 * Every mutation goes through one of the actions below, and every action
 * stamps `lastSavedAt` — so the "last saved" indicator can never drift from
 * reality, which is the whole point of showing it.
 */

/*
  Bumped to v2 when the four-role platform state landed (listings, interests,
  users, platform events). A v1 blob shallow-merged over the v2 seed would
  produce a state with no `listings` array, and every search screen would be
  empty with no clue why. A new key is the cheap, honest migration.
*/
const STORAGE_KEY = "tph.prototype.v2";

/** Platform state shared by all four roles. Identical in seed and fresh. */
function platformSeed() {
  return {
    createdProfessionals: [] as Professional[],
    listings: seedListings(),
    interests: SEED_INTERESTS,
    users: SEED_USERS,
    platformEvents: SEED_PLATFORM_EVENTS,
  };
}

function seedState(): AppState {
  return {
    ...platformSeed(),
    session: null,
    trustLinks: [],
    savedSearches: [],
    applications: SEED_APPLICATIONS,
    professionalOverrides: {},
    outputs: [],
    stages: SEED_STAGES,
    user: SEED_USER,
    journeys: [SEED_JOURNEY],
    properties: SEED_PROPERTIES,
    comparisons: [SEED_COMPARISON],
    readiness: [],
    milestones: SEED_MILESTONES,
    activity: SEED_ACTIVITY,
    hasPropId: true,
    pendingProperty: null,
  };
}

/**
 * A first-time visitor: an anonymous session with nothing saved and no Prop ID.
 *
 * This exists so a reviewer can walk the parts of the product a returning user
 * never sees — the empty shortlist, the journey at step one, and the save
 * boundary (FR-01-15), which is the highest-drop-off screen in the funnel.
 */
function freshState(): AppState {
  const now = new Date().toISOString();
  return {
    /* The platform is not reset — a first-time BUYER still arrives at a site
       that has listings, sellers and professionals on it. */
    ...platformSeed(),
    session: null,
    trustLinks: [],
    savedSearches: [],
    applications: SEED_APPLICATIONS,
    professionalOverrides: {},
    outputs: [],
    stages: SEED_STAGES.map((s) => ({
      ...s,
      status: "upcoming" as const,
      professionalId: null,
      trustLinkId: null,
      completedAt: null,
      detail: s.blurb,
    })),
    user: { ...SEED_USER, firstName: "there", lastName: "", email: "" },
    journeys: [
      {
        ...SEED_JOURNEY,
        name: "My buyer journey",
        stage: null,
        targetArea: "",
        timing: null,
        helpWanted: [],
        setupCompletedAt: null,
        createdAt: now,
        lastSavedAt: now,
      },
    ],
    properties: [],
    comparisons: [],
    readiness: [],
    milestones: SEED_MILESTONES.map((m) => ({
      ...m,
      state: "todo",
      completedAt: null,
    })),
    activity: [],
    hasPropId: false,
    pendingProperty: null,
  };
}

interface JourneyStore {
  state: AppState;
  /** False until localStorage has been read. Screens may render seed data. */
  hydrated: boolean;

  /* journey */
  journey: Journey;
  updateJourney: (patch: Partial<Journey>) => void;

  /* properties — ARRAY ORDER IS THE SHORTLIST ORDER */
  properties: Property[];
  activeProperties: Property[];
  archivedProperties: Property[];
  getProperty: (id: string) => Property | undefined;
  addProperty: (
    input: Omit<
      Property,
      "id" | "journeyId" | "createdAt" | "updatedAt" | "evidence"
    >,
  ) => { ok: true; id: string } | { ok: false; reason: "limit" };
  updateProperty: (id: string, patch: Partial<Property>) => void;
  setPropertyStatus: (id: string, status: PropertyStatus) => void;
  moveProperty: (id: string, direction: -1 | 1) => void;
  archiveProperty: (id: string) => void;
  restoreProperty: (id: string) => void;

  /* comparison */
  comparison: Comparison | undefined;
  saveComparison: (propertyIds: string[]) => void;

  /* readiness — FR-04, RDY-02…06 */
  readiness: ReadinessAssessment | undefined;
  readinessHistory: ReadinessAssessment[];
  startReadiness: () => string;
  answerReadiness: (questionId: string, value: AnswerValue) => void;
  setReadinessStep: (step: number) => void;
  completeReadiness: () => void;
  toggleActionItem: (actionId: string) => void;
  retakeReadiness: () => string;

  /* progress */
  milestones: Milestone[];
  setMilestone: (key: MilestoneKey, state: MilestoneState) => void;

  activity: ActivityEntry[];

  /* ------------------------------------------- PM direction, August 2026 */

  /* ⚠️ MOCK session — src/lib/mock/accounts.ts. Not authentication. */
  session: Session | null;
  /**
   * Completes a sign-in the SCREEN has already validated (a matching one-time
   * code, or the admin password). This function's job is the part that depends
   * on platform state rather than on credentials: refusing a suspended account,
   * and recording the sign-in in the operations log.
   */
  signIn: (
    identifier: string,
  ) => { ok: true; role: Role } | { ok: false; message: string };
  signOut: () => void;

  /** Save a demo listing into the user's own shortlist. */
  saveListing: (
    listing: Listing,
  ) => { ok: true; id: string; already?: boolean } | { ok: false; reason: "limit" };
  savedListingIds: string[];

  /* Trust Links — request → authorize → active → output */
  trustLinks: TrustLink[];
  createTrustLink: (input: {
    propertyId: string;
    professionalId: string;
    serviceKey: ServiceKey;
    purpose: string;
    note: string;
    sharedItems: string[];
    contactChannel: TrustLink["contactChannel"];
    expiryDays: number;
  }) => string;
  authorizeTrustLink: (id: string) => void;
  declineTrustLink: (id: string) => void;
  revokeTrustLink: (id: string) => void;

  /* Professional output — returns into Prop ID and advances a stage */
  outputs: Output[];
  submitOutput: (input: {
    trustLinkId: string;
    type: string;
    title: string;
    summary: string;
    fileName: string;
  }) => void;
  confirmOutputReceipt: (id: string) => void;

  /** Progress Map v2 — provisional transaction stages */
  stages: TransactionStage[];

  /* saved searches — transcript L223 */
  savedSearches: SavedSearch[];
  saveSearch: (
    input: Omit<SavedSearch, "id" | "journeyId" | "createdAt">,
  ) => void;
  removeSavedSearch: (id: string) => void;

  /* professional applications — the [C-03] reconciliation */
  applications: ProfessionalApplication[];
  submitApplication: (
    input: Omit<
      ProfessionalApplication,
      "id" | "status" | "submittedAt" | "verification" | "declineReason"
    >,
  ) => string;
  /** PRO-05 — records WHAT was checked and WHEN, and by whom */
  verifyApplication: (id: string, what: string) => void;
  declineApplication: (id: string, reason: string) => void;

  /**
   * The professional cohort with admin state applied — suspended businesses
   * removed, recorded verifications reflected. Every consumer-facing surface
   * reads this rather than the seed module, so an admin action in one role is
   * visible in another.
   */
  professionals: Professional[];
  getProfessional: (id: string) => Professional | undefined;

  /* admin overrides on the seeded cohort */
  professionalOverrides: Record<string, ProfessionalOverride>;
  setProfessionalSuspended: (id: string, suspended: boolean) => void;
  recordProfessionalVerification: (id: string, what: string) => void;
  /** Every professional including suspended ones — admin screens only. */
  allProfessionals: Professional[];
  /** The signed-in professional's own listing in the cohort, if any. */
  myProfessional: Professional | undefined;
  updateProfessionalProfile: (
    id: string,
    patch: NonNullable<ProfessionalOverride["profile"]>,
  ) => void;

  /* ------------------------------------------- the four-role platform, Aug 2026 */

  /**
   * All listings, seeded and seller-created. Public surfaces filter this to
   * `published`; the seller's own dashboard sees their drafts too.
   */
  listings: Listing[];
  publishedListings: Listing[];
  getListing: (id: string) => Listing | undefined;
  /** Listings owned by the signed-in seller. */
  myListings: Listing[];
  createListing: (
    input: Omit<Listing, "id" | "sellerId" | "sellerName" | "createdAt">,
  ) => string;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  setListingStatus: (id: string, status: ListingStatus) => void;

  /** Buyer → seller interest. See the note on `Interest` in mock/types.ts. */
  interests: Interest[];
  /** Interest in the signed-in seller's own stock. */
  myInterests: Interest[];
  interestForListing: (listingId: string) => Interest | undefined;
  expressInterest: (input: {
    listingId: string;
    message: string;
    sharePhone: boolean;
  }) => string;
  markInterestSeen: (id: string) => void;
  replyToInterest: (id: string, body: string) => void;
  closeInterest: (id: string) => void;

  /** The account directory admin manages. */
  users: PlatformUser[];
  setUserSuspended: (id: string, suspended: boolean) => void;

  /** Cross-role operations log. Distinct from the buyer's own `activity`. */
  platformEvents: PlatformEvent[];

  /* save boundary — FR-01-15, ENT-03 */
  hasPropId: boolean;
  pendingProperty: PendingProperty | null;
  holdProperty: (input: PendingProperty) => void;
  /** Creates the Prop ID and commits anything held at the boundary. */
  createPropId: (name: string) => { id: string | null };
  discardPending: () => void;

  /** Restores the seed. For demo purposes only. */
  resetDemo: () => void;
  /** Switches to a first-time-visitor session. For demo purposes only. */
  startFresh: () => void;
}

const Ctx = createContext<JourneyStore | null>(null);

export function JourneyStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  /*
    Read once on mount, not during render — the server has no localStorage, so
    reading it during render would produce a hydration mismatch.
  */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        // Shallow-merge over the seed so a stored state written by an older
        // build cannot leave a screen without data it expects.
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // A corrupt or unavailable store must never break the prototype.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private browsing, quota — non-fatal */
    }
  }, [state, hydrated]);

  /**
   * Every mutation stamps the journey's save time and may log two different
   * things:
   *
   *   `log`   — the BUYER's own diary, written in second person ("You saved …")
   *   `event` — the operations log the admin reads, written in third person
   *
   * They are separate because merging them would put one user's private phrasing
   * into a platform screen, and would make the admin's feed grow with actions no
   * operator cares about.
   */
  const commit = useCallback(
    (
      mutate: (draft: AppState) => AppState,
      log?: { what: string; kind: ActivityEntry["kind"] },
      event?: Omit<PlatformEvent, "id" | "at">,
    ) => {
      setState((prev) => {
        const next = mutate(prev);
        const at = new Date().toISOString();
        return {
          ...next,
          journeys: next.journeys.map((j) =>
            j.id === SEED_JOURNEY.id ? { ...j, lastSavedAt: at } : j,
          ),
          activity: log
            ? [{ id: `a-${at}`, at, ...log }, ...next.activity].slice(0, 40)
            : next.activity,
          platformEvents: event
            ? [
                { id: `pe-${at}-${Math.random().toString(36).slice(2, 7)}`, at, ...event },
                ...next.platformEvents,
              ].slice(0, 60)
            : next.platformEvents,
        };
      });
    },
    [],
  );

  const journey = state.journeys[0];
  const properties = useMemo(
    () => state.properties.filter((p) => p.journeyId === journey.id),
    [state.properties, journey.id],
  );
  const activeProperties = useMemo(
    () => properties.filter((p) => p.status !== "archived"),
    [properties],
  );
  const archivedProperties = useMemo(
    () => properties.filter((p) => p.status === "archived"),
    [properties],
  );

  /**
   * The live assessment for this journey: the one nothing has superseded.
   * A retake supersedes its predecessor rather than deleting it (RDY-06).
   */
  /**
   * The cohort a buyer sees: seeded professionals with admin state applied.
   * A suspended business disappears from the directory entirely, and a
   * verification an admin recorded replaces whatever the seed said.
   */
  /**
   * Every professional the platform knows about, with admin and self-service
   * state applied — the seeded cohort plus anyone an admin created by verifying
   * an application, in join order.
   *
   * Precedence is deliberate: a professional may rewrite their own description
   * (`override.profile`), but `verification` is applied AFTER it, so no edit
   * can ever change what TPH says it checked (PRO-05).
   */
  const allProfessionals = useMemo(
    () =>
      [...ALL_PROFESSIONALS, ...state.createdProfessionals].map((p) => {
        const override = state.professionalOverrides[p.id];
        if (!override) return p;
        return {
          ...p,
          ...(override.profile ?? {}),
          ...(override.verification !== undefined
            ? { verification: override.verification }
            : {}),
        };
      }),
    [state.professionalOverrides, state.createdProfessionals],
  );

  /** What a buyer sees. A suspended business disappears from the directory. */
  const resolvedProfessionals = useMemo(
    () =>
      allProfessionals.filter(
        (p) => !state.professionalOverrides[p.id]?.suspended,
      ),
    [allProfessionals, state.professionalOverrides],
  );

  /** Lookup that includes suspended entries — used for activity wording. */
  const lookupProfessional = useCallback(
    (id: string) => allProfessionals.find((p) => p.id === id),
    [allProfessionals],
  );

  const currentReadiness = useMemo(
    () =>
      state.readiness.find(
        (a) => a.journeyId === journey.id && a.supersededById === null,
      ),
    [state.readiness, journey.id],
  );

  const value = useMemo<JourneyStore>(() => {
    const touch = (p: Property): Property => ({
      ...p,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      hydrated,
      journey,
      properties,
      activeProperties,
      archivedProperties,

      updateJourney: (patch) => {
        /*
          Completing setup IS the `journey_started` milestone. Deriving it here
          rather than in the screen means the Progress Map, the stage bar and the
          next recommended action can never disagree with what the user actually
          did ([C-18], FR-02-03).
        */
        const completesSetup =
          Boolean(patch.setupCompletedAt) && !journey.setupCompletedAt;

        commit(
          (d) => ({
            ...d,
            journeys: d.journeys.map((j) =>
              j.id === journey.id ? { ...j, ...patch } : j,
            ),
            milestones: completesSetup
              ? d.milestones.map((m) =>
                  m.key === "journey_started" && m.state !== "done"
                    ? {
                        ...m,
                        state: "done",
                        completedAt: new Date().toISOString(),
                      }
                    : m,
                )
              : d.milestones,
          }),
          completesSetup
            ? {
                what: `You started the journey “${patch.name ?? journey.name}”`,
                kind: "journey",
              }
            : undefined,
        );
      },

      getProperty: (id) => state.properties.find((p) => p.id === id),

      addProperty: (input) => {
        // FR-03-06 / FR-03-07 — the limit is eight, and exceeding it must
        // produce a clear message rather than a silent failure. The caller
        // gets a discriminated result so it cannot ignore the refusal.
        if (activeProperties.length >= SHORTLIST_LIMIT) {
          return { ok: false as const, reason: "limit" as const };
        }
        const id = `p-${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const property: Property = {
          ...input,
          id,
          journeyId: journey.id,
          evidence: {},
          createdAt: now,
          updatedAt: now,
        };
        commit(
          (d) => ({
            ...d,
            properties: [...d.properties, property],
            milestones: d.milestones.map((m) =>
              m.key === "first_property_saved" && m.state !== "done"
                ? { ...m, state: "done", completedAt: now }
                : m,
            ),
          }),
          {
            what: `You saved ${input.address}, ${input.suburb}`,
            kind: "property",
          },
        );
        return { ok: true as const, id };
      },

      updateProperty: (id, patch) =>
        commit((d) => ({
          ...d,
          properties: d.properties.map((p) =>
            p.id === id ? touch({ ...p, ...patch }) : p,
          ),
        })),

      setPropertyStatus: (id, status) => {
        const p = state.properties.find((x) => x.id === id);
        commit(
          (d) => ({
            ...d,
            properties: d.properties.map((x) =>
              x.id === id ? touch({ ...x, status }) : x,
            ),
          }),
          p
            ? { what: `You changed the status of ${p.address}`, kind: "property" }
            : undefined,
        );
      },

      /** FR-03-05 — reorder. Array order IS the shortlist order. */
      moveProperty: (id, direction) =>
        commit((d) => {
          const list = [...d.properties];
          const from = list.findIndex((p) => p.id === id);
          const to = from + direction;
          if (from < 0 || to < 0 || to >= list.length) return d;
          [list[from], list[to]] = [list[to], list[from]];
          return { ...d, properties: list };
        }),

      /** FR-03-08 — archive rather than destroy */
      archiveProperty: (id) => {
        const p = state.properties.find((x) => x.id === id);
        commit(
          (d) => ({
            ...d,
            properties: d.properties.map((x) =>
              x.id === id ? touch({ ...x, status: "archived" }) : x,
            ),
          }),
          p ? { what: `You archived ${p.address}`, kind: "property" } : undefined,
        );
      },

      restoreProperty: (id) =>
        commit((d) => ({
          ...d,
          properties: d.properties.map((x) =>
            x.id === id ? touch({ ...x, status: "researching" }) : x,
          ),
        })),

      comparison: state.comparisons.find((c) => c.journeyId === journey.id),

      /** FR-03-23 — a saved comparison records the criteria version it used */
      saveComparison: (propertyIds) => {
        const now = new Date().toISOString();
        commit(
          (d) => {
            const existing = d.comparisons.find(
              (c) => c.journeyId === journey.id,
            );
            const record: Comparison = {
              id: existing?.id ?? `c-${Date.now().toString(36)}`,
              journeyId: journey.id,
              propertyIds,
              criteriaVersion: CRITERIA_VERSION,
              completedAt: now,
              updatedAt: now,
            };
            return {
              ...d,
              comparisons: existing
                ? d.comparisons.map((c) => (c.id === existing.id ? record : c))
                : [...d.comparisons, record],
              milestones: d.milestones.map((m) =>
                m.key === "comparison_completed"
                  ? { ...m, state: "done", completedAt: now }
                  : m,
              ),
            };
          },
          {
            what: `You saved a comparison of ${propertyIds.length} properties`,
            kind: "comparison",
          },
        );
      },

      /* ------------------------------------------------------- readiness */

      readiness: currentReadiness,
      readinessHistory: state.readiness.filter((a) => a.completedAt !== null),

      startReadiness: () => {
        if (currentReadiness) return currentReadiness.id;
        const now = new Date().toISOString();
        const id = `rd-${Date.now().toString(36)}`;
        commit(
          (d) => ({
            ...d,
            readiness: [
              {
                id,
                journeyId: journey.id,
                answers: {},
                result: null,
                currentStep: 1,
                startedAt: now,
                completedAt: null,
                supersededById: null,
                actionsDone: [],
              },
              ...d.readiness,
            ],
            milestones: d.milestones.map((m) =>
              m.key === "readiness_completed" && m.state === "todo"
                ? { ...m, state: "in_progress" }
                : m,
            ),
          }),
          { what: "You started Buyer Readiness", kind: "readiness" },
        );
        return id;
      },

      /** RDY-05 — every answer is saved as it is given */
      answerReadiness: (questionId, value) =>
        commit((d) => ({
          ...d,
          readiness: d.readiness.map((a) =>
            a.id === currentReadiness?.id
              ? { ...a, answers: { ...a.answers, [questionId]: value } }
              : a,
          ),
        })),

      setReadinessStep: (step) =>
        commit((d) => ({
          ...d,
          readiness: d.readiness.map((a) =>
            a.id === currentReadiness?.id ? { ...a, currentStep: step } : a,
          ),
        })),

      /**
       * RDY-03 — the computed result is STORED. Reopening a completed
       * assessment re-renders the stored states and action plan; it never
       * re-evaluates, so a later formula change cannot rewrite history.
       */
      completeReadiness: () => {
        if (!currentReadiness) return;
        const now = new Date().toISOString();
        const result = scoreReadiness(currentReadiness.answers);

        commit(
          (d) => ({
            ...d,
            readiness: d.readiness.map((a) =>
              a.id === currentReadiness.id
                ? { ...a, result, completedAt: now }
                : a,
            ),
            milestones: d.milestones.map((m) =>
              m.key === "readiness_completed"
                ? { ...m, state: "done", completedAt: now }
                : m,
            ),
          }),
          {
            what: "You completed Buyer Readiness",
            kind: "readiness",
          },
        );
      },

      /** FR-04-14 — action-plan items are individually completable */
      toggleActionItem: (actionId) =>
        commit((d) => ({
          ...d,
          readiness: d.readiness.map((a) =>
            a.id === currentReadiness?.id
              ? {
                  ...a,
                  actionsDone: a.actionsDone.includes(actionId)
                    ? a.actionsDone.filter((x) => x !== actionId)
                    : [...a.actionsDone, actionId],
                }
              : a,
          ),
        })),

      /** RDY-06 / FR-04-13 — retake, retaining the previous assessment */
      retakeReadiness: () => {
        const now = new Date().toISOString();
        const id = `rd-${Date.now().toString(36)}`;
        commit(
          (d) => ({
            ...d,
            readiness: [
              {
                id,
                journeyId: journey.id,
                answers: {},
                result: null,
                currentStep: 1,
                startedAt: now,
                completedAt: null,
                supersededById: null,
                actionsDone: [],
              },
              ...d.readiness.map((a) =>
                a.journeyId === journey.id && a.supersededById === null
                  ? { ...a, supersededById: id }
                  : a,
              ),
            ],
            milestones: d.milestones.map((m) =>
              m.key === "readiness_completed"
                ? { ...m, state: "in_progress", completedAt: null }
                : m,
            ),
          }),
          { what: "You started Buyer Readiness again", kind: "readiness" },
        );
        return id;
      },

      milestones: state.milestones,

      setMilestone: (key, milestoneState) =>
        commit((d) => ({
          ...d,
          milestones: d.milestones.map((m) =>
            m.key === key
              ? {
                  ...m,
                  state: milestoneState,
                  completedAt:
                    milestoneState === "done"
                      ? new Date().toISOString()
                      : null,
                }
              : m,
          ),
        })),

      activity: state.activity,

      /* ------------------------------------------ PM direction, August 2026 */

      session: state.session,

      /**
       * ⚠️ MOCK. Compares against constants in the browser. Replace with real
       * authentication before production — see src/lib/mock/accounts.ts.
       *
       * The failure message is deliberately generic ("those details don't
       * match"), which is the same no-account-enumeration behaviour S05
       * specifies for the real screen.
       */
      signIn: (identifier) => {
        const account = findAccount(identifier);
        if (!account) {
          return {
            ok: false as const,
            message: "Those details don't match an account.",
          };
        }

        /* Suspension is real state, not a label. An account an admin suspended
           in this session cannot sign in — which is what makes the admin's
           control demonstrable rather than cosmetic. */
        const record = state.users.find(
          (u) => u.demo && u.role === account.role,
        );
        if (record?.suspended) {
          return {
            ok: false as const,
            message:
              "This account is suspended. Contact The Property Helpline to restore access.",
          };
        }

        const now = new Date().toISOString();
        const session: Session = {
          role: account.role,
          phone: account.phone,
          name: account.name,
          context: account.context,
          signedInAt: now,
        };

        setState((prev) => ({
          ...prev,
          session,
          /* The buyer experience addresses the signed-in person by name. */
          user:
            account.role === "buyer"
              ? {
                  ...prev.user,
                  firstName: account.name.split(" ")[0],
                  lastName: account.name.split(" ").slice(1).join(" "),
                }
              : prev.user,
          platformEvents: [
            {
              id: `pe-${now}-in`,
              at: now,
              actorRole: account.role,
              actorName: account.name,
              what: `Signed in as ${ROLE_LABEL[account.role].toLowerCase()}`,
              kind: "auth" as const,
            },
            ...prev.platformEvents,
          ].slice(0, 60),
        }));

        return { ok: true as const, role: account.role };
      },

      /** Ends the demo session. Journey data is deliberately kept, so signing
       *  back in resumes exactly where the reviewer left off. */
      signOut: () => setState((prev) => ({ ...prev, session: null })),

      savedListingIds: state.properties
        .map((p) => p.listingId)
        .filter((id): id is string => Boolean(id)),

      /**
       * A demo listing becomes one of the user's OWN property records.
       *
       * This is the join the client described (transcript L113: "they can choose
       * some properties from our listing") and it is the single most important
       * link in tomorrow's demo — a saved listing has to show up in the
       * shortlist, the comparison and Prop ID, which it does because it becomes
       * an ordinary `Property` rather than a second kind of thing.
       *
       * The listing's price is carried across as the user's own entry, because
       * that is what it becomes: a figure they recorded, never a valuation
       * (FR-03-18).
       */
      saveListing: (listing) => {
        const existing = state.properties.find((p) => p.listingId === listing.id);
        if (existing) return { ok: true as const, id: existing.id, already: true };

        if (activeProperties.length >= SHORTLIST_LIMIT) {
          return { ok: false as const, reason: "limit" as const };
        }

        const id = `p-${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const property: Property = {
          id,
          journeyId: journey.id,
          listingId: listing.id,
          address: listing.address,
          suburb: listing.suburb,
          postcode: listing.postcode,
          propertyType: listing.propertyType,
          askingPrice: listing.listingType === "buy" ? listing.priceValue : null,
          beds: listing.beds,
          baths: listing.baths,
          cars: listing.cars,
          sourceUrl: null,
          note: "",
          status: "researching",
          ranking: null,
          imageKey: null,
          listingImageKey: listing.imageKey,
          evidence: {
            asking_price: { value: listing.priceGuide, kind: "own" },
            property_type: { value: listing.propertyType, kind: "own" },
            basics: {
              value: `${listing.beds} · ${listing.baths} · ${listing.cars}`,
              kind: "own",
            },
          },
          createdAt: now,
          updatedAt: now,
        };

        commit(
          (d) => ({
            ...d,
            properties: [...d.properties, property],
            milestones: d.milestones.map((m) =>
              m.key === "first_property_saved" && m.state !== "done"
                ? { ...m, state: "done", completedAt: now }
                : m,
            ),
          }),
          {
            what: `You saved ${listing.address}, ${listing.suburb}`,
            kind: "property",
          },
        );

        return { ok: true as const, id };
      },

      trustLinks: state.trustLinks.filter((t) => t.journeyId === journey.id),

      /**
       * FR-07-07 — nothing is sent until the user confirms. This is that
       * confirmation: the link is created `pending` and appears in the
       * professional's New Requests queue.
       */
      createTrustLink: (input) => {
        const id = `tl-${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const link: TrustLink = {
          id,
          journeyId: journey.id,
          ...input,
          status: "pending",
          createdAt: now,
          authorizedAt: null,
          expiresAt: null,
          activity: [
            { at: now, what: "You sent the request", by: "you" },
          ],
        };

        commit(
          (d) => ({
            ...d,
            trustLinks: [link, ...d.trustLinks],
            milestones: d.milestones.map((m) =>
              m.key === "professional_selected" && m.state !== "done"
                ? { ...m, state: "done", completedAt: now }
                : m.key === "trust_link_authorised" && m.state === "todo"
                  ? { ...m, state: "in_progress" }
                  : m,
            ),
          }),
          {
            what: `You sent a Trust Link request for ${serviceFor(input.serviceKey).label.toLowerCase()}`,
            kind: "trustlink",
          },
        );
        return id;
      },

      /**
       * The professional authorises. Status moves pending → active, the
       * permission period starts, and the matching transaction stage goes live
       * with the professional attached — which is what makes the Progress Map
       * reflect reality rather than decorate it.
       */
      authorizeTrustLink: (id) => {
        const now = new Date().toISOString();
        const link = state.trustLinks.find((t) => t.id === id);
        if (!link) return;
        const pro = lookupProfessional(link.professionalId);
        const service = serviceFor(link.serviceKey);
        const expiresAt = new Date(
          Date.now() + link.expiryDays * 86_400_000,
        ).toISOString();

        commit(
          (d) => ({
            ...d,
            trustLinks: d.trustLinks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "active",
                    authorizedAt: now,
                    expiresAt,
                    activity: [
                      {
                        at: now,
                        what: `${pro?.name ?? "The professional"} authorised the Trust Link — connection activated`,
                        by: "professional" as const,
                      },
                      ...t.activity,
                    ],
                  }
                : t,
            ),
            milestones: d.milestones.map((m) =>
              m.key === "trust_link_authorised"
                ? { ...m, state: "done", completedAt: now }
                : m,
            ),
            stages: d.stages.map((s) =>
              s.key === service.stageKey && s.status !== "completed"
                ? {
                    ...s,
                    status: "in_progress",
                    professionalId: link.professionalId,
                    trustLinkId: id,
                    detail: `${pro?.name ?? "A professional"} is connected and working on this.`,
                  }
                : s,
            ),
          }),
          {
            what: `${pro?.name ?? "A professional"} authorised your Trust Link`,
            kind: "trustlink",
          },
        );
      },

      declineTrustLink: (id) => {
        const now = new Date().toISOString();
        const pro = lookupProfessional(
          state.trustLinks.find((t) => t.id === id)?.professionalId ?? "",
        );
        commit(
          (d) => ({
            ...d,
            trustLinks: d.trustLinks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "declined",
                    activity: [
                      {
                        at: now,
                        what: "The professional declined the request. Nothing was shared.",
                        by: "professional" as const,
                      },
                      ...t.activity,
                    ],
                  }
                : t,
            ),
          }),
          {
            what: `${pro?.name ?? "A professional"} declined your request`,
            kind: "trustlink",
          },
        );
      },

      /**
       * FR-07-08 — the user can withdraw at any time, and access stops.
       *
       * The client suggested stopping should route through admin (L489). Consent
       * withdrawal staying in the user's hands is a privacy-law position, so the
       * direct control is kept and a complaint route is noted as a separate item
       * in the gap analysis.
       */
      revokeTrustLink: (id) => {
        const now = new Date().toISOString();
        commit(
          (d) => ({
            ...d,
            trustLinks: d.trustLinks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "revoked",
                    activity: [
                      {
                        at: now,
                        what: "You withdrew this Trust Link. Access stopped immediately.",
                        by: "you" as const,
                      },
                      ...t.activity,
                    ],
                  }
                : t,
            ),
            stages: d.stages.map((s) =>
              s.trustLinkId === id
                ? {
                    ...s,
                    status: "upcoming",
                    professionalId: null,
                    trustLinkId: null,
                    detail: "You withdrew the connection for this stage.",
                  }
                : s,
            ),
          }),
          { what: "You withdrew a Trust Link", kind: "trustlink" },
        );
      },

      outputs: state.outputs,

      /**
       * The professional submits their work. It lands against the property
       * (FR-05-08, [SG] p.6 continuity), completes the stage, and completes the
       * link.
       */
      submitOutput: (input) => {
        const now = new Date().toISOString();
        const link = state.trustLinks.find((t) => t.id === input.trustLinkId);
        if (!link) return;
        const pro = lookupProfessional(link.professionalId);
        const service = serviceFor(link.serviceKey);

        const output: Output = {
          id: `o-${Date.now().toString(36)}`,
          trustLinkId: link.id,
          propertyId: link.propertyId,
          professionalId: link.professionalId,
          type: input.type,
          title: input.title,
          summary: input.summary,
          fileName: input.fileName,
          submittedAt: now,
          receiptConfirmedAt: null,
        };

        commit(
          (d) => ({
            ...d,
            outputs: [output, ...d.outputs],
            trustLinks: d.trustLinks.map((t) =>
              t.id === link.id
                ? {
                    ...t,
                    status: "completed",
                    activity: [
                      {
                        at: now,
                        what: `${pro?.name ?? "The professional"} submitted ${input.title}`,
                        by: "professional" as const,
                      },
                      ...t.activity,
                    ],
                  }
                : t,
            ),
            milestones: d.milestones.map((m) =>
              m.key === "output_received"
                ? { ...m, state: "done", completedAt: now }
                : m.key === "ready_for_next_action" && m.state === "todo"
                  ? { ...m, state: "in_progress" }
                  : m,
            ),
            stages: d.stages.map((s) =>
              s.key === service.stageKey
                ? {
                    ...s,
                    status: "completed",
                    completedAt: now,
                    detail: `${input.title} received from ${pro?.name ?? "the professional"}.`,
                  }
                : s,
            ),
          }),
          {
            what: `${pro?.name ?? "A professional"} sent you ${input.title}`,
            kind: "output",
          },
        );
      },

      confirmOutputReceipt: (id) =>
        commit((d) => ({
          ...d,
          outputs: d.outputs.map((o) =>
            o.id === id ? { ...o, receiptConfirmedAt: new Date().toISOString() } : o,
          ),
        })),

      stages: state.stages,

      /* ---------------------------------------------------- saved searches */

      savedSearches: state.savedSearches.filter(
        (s) => s.journeyId === journey.id,
      ),

      saveSearch: (input) => {
        const now = new Date().toISOString();
        /* Same criteria twice is a duplicate, not a second search. */
        const key = (s: Omit<SavedSearch, "id" | "journeyId" | "createdAt">) =>
          `${s.where.trim().toLowerCase()}|${s.mode}|${s.propertyType}|${s.beds}|${s.price}`;

        commit(
          (d) =>
            d.savedSearches.some(
              (s) => s.journeyId === journey.id && key(s) === key(input),
            )
              ? d
              : {
                  ...d,
                  savedSearches: [
                    {
                      ...input,
                      id: `ss-${Date.now().toString(36)}`,
                      journeyId: journey.id,
                      createdAt: now,
                    },
                    ...d.savedSearches,
                  ],
                },
          {
            what: `You saved a search${input.where ? ` for ${input.where}` : ""}`,
            kind: "journey",
          },
        );
      },

      removeSavedSearch: (id) =>
        commit((d) => ({
          ...d,
          savedSearches: d.savedSearches.filter((s) => s.id !== id),
        })),

      /* ----------------------------------------- professional applications */

      applications: state.applications,

      submitApplication: (input) => {
        const id = `app-${Date.now().toString(36)}`;
        commit(
          (d) => ({
            ...d,
            applications: [
              {
                ...input,
                id,
                status: "pending" as const,
                submittedAt: new Date().toISOString(),
                verification: null,
                declineReason: null,
              },
              ...d.applications,
            ],
          }),
          undefined,
          {
            actorRole: "professional",
            actorName: input.contactName,
            what: `${input.businessName} applied to join as a ${serviceFor(input.serviceKey).label.toLowerCase()}`,
            kind: "verification",
          },
        );
        return id;
      },

      /**
       * PRO-05 — an admin records WHAT was checked and WHEN. The published
       * wording is derived from that record, never from the applicant's claim.
       */
      verifyApplication: (id, what) => {
        const application = state.applications.find((a) => a.id === id);
        if (!application) return;
        const checkedOn = new Date().toISOString().slice(0, 10);

        /*
          Verifying now CREATES A LIVE PROFILE.

          Previously it only stamped the application, so a verified applicant
          never appeared in the directory and the admin's decision had no
          visible effect anywhere else — the loose end flagged after the last
          round. The professional's own claim is NOT carried across: `experience`
          is written by us, and `verification` comes from the admin's check.
        */
        const professional: Professional = {
          id: `pro-${application.id}`,
          serviceKey: application.serviceKey,
          category: serviceFor(application.serviceKey).label,
          name: application.businessName,
          contactName: application.contactName,
          area: application.area,
          approach: application.approach,
          experience: "Recently joined The Property Helpline",
          verification: { what, checkedOn },
          feeNote: null,
          serviceAreas: [application.area],
          photoUrl: null,
        };

        commit(
          (d) => ({
            ...d,
            applications: d.applications.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: "verified" as const,
                    verification: {
                      what,
                      checkedOn,
                      by: d.session?.name ?? "TPH Operations",
                    },
                  }
                : a,
            ),
            createdProfessionals: d.createdProfessionals.some(
              (p) => p.id === professional.id,
            )
              ? d.createdProfessionals
              : [...d.createdProfessionals, professional],
            users: d.users.some((u) => u.email === application.email)
              ? d.users
              : [
                  ...d.users,
                  {
                    id: `u-${application.id}`,
                    role: "professional" as const,
                    name: application.contactName,
                    phone: application.phone,
                    email: application.email,
                    context: `${application.businessName} · ${serviceFor(application.serviceKey).label}`,
                    joinedAt: new Date().toISOString(),
                    suspended: false,
                    demo: false,
                  },
                ],
          }),
          undefined,
          {
            actorRole: "admin",
            actorName: state.session?.name ?? "TPH Operations",
            what: `Verified ${application.businessName} — ${what.toLowerCase()} checked. Now listed in the directory.`,
            kind: "verification",
          },
        );
      },

      declineApplication: (id, reason) => {
        const application = state.applications.find((a) => a.id === id);
        commit(
          (d) => ({
            ...d,
            applications: d.applications.map((a) =>
              a.id === id
                ? { ...a, status: "declined" as const, declineReason: reason }
                : a,
            ),
          }),
          undefined,
          application
            ? {
                actorRole: "admin",
                actorName: state.session?.name ?? "TPH Operations",
                what: `Declined the application from ${application.businessName}`,
                kind: "verification",
              }
            : undefined,
        );
      },

      professionals: resolvedProfessionals,

      getProfessional: (id) => resolvedProfessionals.find((p) => p.id === id),

      professionalOverrides: state.professionalOverrides,

      setProfessionalSuspended: (id, suspended) => {
        const pro = lookupProfessional(id);
        commit(
          (d) => ({
            ...d,
            professionalOverrides: {
              ...d.professionalOverrides,
              [id]: { ...d.professionalOverrides[id], suspended },
            },
          }),
          undefined,
          {
            actorRole: "admin",
            actorName: state.session?.name ?? "TPH Operations",
            what: `${suspended ? "Suspended" : "Reactivated"} ${pro?.name ?? id}${suspended ? " — removed from the directory" : ""}`,
            kind: "verification",
          },
        );
      },

      recordProfessionalVerification: (id, what) => {
        const pro = lookupProfessional(id);
        commit(
          (d) => ({
            ...d,
            professionalOverrides: {
              ...d.professionalOverrides,
              [id]: {
                ...d.professionalOverrides[id],
                verification: {
                  what,
                  checkedOn: new Date().toISOString().slice(0, 10),
                },
              },
            },
          }),
          undefined,
          {
            actorRole: "admin",
            actorName: state.session?.name ?? "TPH Operations",
            what: `Recorded a ${what.toLowerCase()} check for ${pro?.name ?? id}`,
            kind: "verification",
          },
        );
      },

      allProfessionals,

      myProfessional:
        state.session?.role === "professional"
          ? allProfessionals.find(
              (p) => p.contactName === state.session?.name,
            ) ?? allProfessionals[0]
          : undefined,

      /**
       * A professional edits their own profile.
       *
       * Note what is NOT in the permitted patch type: `verification`. A
       * professional can rewrite every word of their description and never
       * touch what TPH says it checked (PRO-05) — the type makes the attempt a
       * compile error rather than a policy anyone has to remember.
       */
      updateProfessionalProfile: (id, patch) => {
        const pro = lookupProfessional(id);
        commit(
          (d) => ({
            ...d,
            professionalOverrides: {
              ...d.professionalOverrides,
              [id]: {
                ...d.professionalOverrides[id],
                profile: { ...d.professionalOverrides[id]?.profile, ...patch },
              },
            },
          }),
          undefined,
          {
            actorRole: "professional",
            actorName: state.session?.name ?? pro?.name ?? "A professional",
            what: `Updated the profile for ${pro?.name ?? id}`,
            kind: "account",
          },
        );
      },

      /* ------------------------------------------------------------ listings */

      listings: state.listings,

      publishedListings: state.listings.filter(
        (l) => (l.status ?? "published") === "published",
      ),

      getListing: (id) => state.listings.find((l) => l.id === id),

      myListings: state.listings.filter(
        (l) => l.sellerId === DEMO_SELLER_ID && state.session?.role === "seller",
      ),

      /**
       * A seller publishes a property, and a buyer can find it.
       *
       * This is the single most important link in the cross-role demo: the new
       * listing goes into the SAME array the homepage and search read, so there
       * is no second code path for "seller stock" that could drift from the
       * seeded stock. The only difference between the two is that this one
       * carries a `sellerId`.
       */
      createListing: (input) => {
        const id = `l-${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const listing: Listing = {
          ...input,
          id,
          sellerId: DEMO_SELLER_ID,
          sellerName: state.session?.name ?? "Seller",
          createdAt: now,
        };

        commit(
          (d) => ({ ...d, listings: [listing, ...d.listings] }),
          undefined,
          {
            actorRole: "seller",
            actorName: state.session?.name ?? "A seller",
            what:
              (input.status ?? "published") === "published"
                ? `Published ${input.address}, ${input.suburb}`
                : `Saved a draft listing for ${input.address}, ${input.suburb}`,
            kind: "listing",
          },
        );
        return id;
      },

      updateListing: (id, patch) =>
        commit((d) => ({
          ...d,
          listings: d.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),

      setListingStatus: (id, status) => {
        const listing = state.listings.find((l) => l.id === id);
        const byAdmin = state.session?.role === "admin";
        commit(
          (d) => ({
            ...d,
            listings: d.listings.map((l) =>
              l.id === id ? { ...l, status } : l,
            ),
          }),
          undefined,
          listing
            ? {
                actorRole: byAdmin ? "admin" : "seller",
                actorName: state.session?.name ?? "A seller",
                what:
                  status === "published"
                    ? `Published ${listing.address}, ${listing.suburb}`
                    : status === "withdrawn"
                      ? `Withdrew ${listing.address}, ${listing.suburb}`
                      : status === "removed_by_admin"
                        ? `Removed ${listing.address}, ${listing.suburb} from the platform`
                        : `Moved ${listing.address}, ${listing.suburb} back to draft`,
                kind: "listing",
              }
            : undefined,
        );
      },

      /* ------------------------------------------------------------ interest */

      interests: state.interests,

      myInterests:
        state.session?.role === "seller"
          ? state.interests.filter((i) => {
              const listing = state.listings.find((l) => l.id === i.listingId);
              return listing?.sellerId === DEMO_SELLER_ID;
            })
          : [],

      interestForListing: (listingId) =>
        state.interests.find(
          (i) =>
            i.listingId === listingId &&
            i.buyerName === state.user.firstName &&
            i.status !== "closed",
        ),

      /**
       * The buyer contacts the seller.
       *
       * `sharePhone` is the whole design. It defaults to OFF at every call site,
       * and when it is off the number is not merely hidden from the seller's
       * screen — it is never written into the record. A field that does not
       * exist cannot leak later.
       */
      expressInterest: (input) => {
        const id = `int-${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const listing = state.listings.find((l) => l.id === input.listingId);

        const interest: Interest = {
          id,
          listingId: input.listingId,
          listingAddress: listing
            ? `${listing.address}, ${listing.suburb}`
            : "A property",
          buyerName: state.user.firstName,
          buyerPhone: input.sharePhone ? state.user.phone : null,
          sharePhone: input.sharePhone,
          message: input.message,
          status: "sent",
          createdAt: now,
          thread: [],
        };

        commit(
          (d) => ({ ...d, interests: [interest, ...d.interests] }),
          {
            what: `You registered interest in ${interest.listingAddress}`,
            kind: "property",
          },
          {
            actorRole: "buyer",
            actorName: state.session?.name ?? state.user.firstName,
            what: `Registered interest in ${interest.listingAddress}`,
            kind: "interest",
          },
        );
        return id;
      },

      markInterestSeen: (id) =>
        commit((d) => ({
          ...d,
          interests: d.interests.map((i) =>
            i.id === id && i.status === "sent" ? { ...i, status: "seen" } : i,
          ),
        })),

      replyToInterest: (id, body) => {
        const now = new Date().toISOString();
        const interest = state.interests.find((i) => i.id === id);
        commit(
          (d) => ({
            ...d,
            interests: d.interests.map((i) =>
              i.id === id
                ? {
                    ...i,
                    status: "replied",
                    thread: [...i.thread, { at: now, by: "seller" as const, body }],
                  }
                : i,
            ),
          }),
          interest
            ? {
                what: `The seller replied about ${interest.listingAddress}`,
                kind: "property",
              }
            : undefined,
          {
            actorRole: "seller",
            actorName: state.session?.name ?? "A seller",
            what: `Replied to a buyer about ${interest?.listingAddress ?? "a property"}`,
            kind: "interest",
          },
        );
      },

      closeInterest: (id) =>
        commit((d) => ({
          ...d,
          interests: d.interests.map((i) =>
            i.id === id ? { ...i, status: "closed" } : i,
          ),
        })),

      /* --------------------------------------------------------------- users */

      users: state.users,

      setUserSuspended: (id, suspended) => {
        const target = state.users.find((u) => u.id === id);
        commit(
          (d) => ({
            ...d,
            users: d.users.map((u) => (u.id === id ? { ...u, suspended } : u)),
          }),
          undefined,
          target
            ? {
                actorRole: "admin",
                actorName: state.session?.name ?? "TPH Operations",
                what: `${suspended ? "Suspended" : "Restored"} the account for ${target.name}`,
                kind: "account",
              }
            : undefined,
        );
      },

      platformEvents: state.platformEvents,

      hasPropId: state.hasPropId,
      pendingProperty: state.pendingProperty,

      /** FR-01-15 — hold the entry rather than losing it at the boundary */
      holdProperty: (input) =>
        setState((prev) => ({ ...prev, pendingProperty: input })),

      /**
       * `ENT-03` — the held property is committed as part of creating the Prop
       * ID, so the user never retypes what they already entered.
       */
      createPropId: (name) => {
        const now = new Date().toISOString();
        const held = state.pendingProperty;
        const id = held ? `p-${Date.now().toString(36)}` : null;

        setState((prev) => ({
          ...prev,
          hasPropId: true,
          pendingProperty: null,
          user: { ...prev.user, firstName: name.trim() || "there" },
          properties:
            held && id
              ? [
                  ...prev.properties,
                  {
                    ...held,
                    id,
                    journeyId: prev.journeys[0].id,
                    evidence: {},
                    createdAt: now,
                    updatedAt: now,
                  },
                ]
              : prev.properties,
          journeys: prev.journeys.map((j, i) =>
            i === 0 ? { ...j, lastSavedAt: now } : j,
          ),
          milestones: prev.milestones.map((m) =>
            (m.key === "journey_started" ||
              (held && m.key === "first_property_saved")) &&
            m.state !== "done"
              ? { ...m, state: "done", completedAt: now }
              : m,
          ),
          activity: [
            ...(held
              ? [
                  {
                    id: `a-${now}-p`,
                    at: now,
                    what: `You saved ${held.address}, ${held.suburb}`,
                    kind: "property" as const,
                  },
                ]
              : []),
            {
              id: `a-${now}`,
              at: now,
              what: "You created your Prop ID",
              kind: "journey" as const,
            },
            ...prev.activity,
          ],
        }));

        return { id };
      },

      discardPending: () =>
        setState((prev) => ({ ...prev, pendingProperty: null })),

      resetDemo: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* non-fatal */
        }
        setState(seedState());
      },

      startFresh: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* non-fatal */
        }
        /* Keeps the reviewer signed in — this clears the JOURNEY, it is not a
           sign-out. Signing out has its own control. */
        setState({ ...freshState(), session: state.session });
      },
    };
  }, [
    state,
    hydrated,
    journey,
    properties,
    activeProperties,
    archivedProperties,
    commit,
    allProfessionals,
    resolvedProfessionals,
    lookupProfessional,
    currentReadiness,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Holds rendering until localStorage has been read.
 *
 * Rendering the seed first and correcting afterwards is worse than waiting: a
 * reviewer who has saved a fifth property sees four, then five — the "flash of
 * the wrong state" this codebase has already had to fix twice. Because the
 * server renders the same branch, server and client markup agree and there is
 * no hydration mismatch.
 *
 * Applied to the AUTHENTICATED area only. Public pages render immediately —
 * their only store dependency is whether a listing is already saved, which is a
 * self-correcting detail and not worth a spinner in front of the homepage.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const { hydrated } = useJourneyStore();

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface-page">
        <p className="sr-only" role="status">
          Loading your journey
        </p>
        <span
          aria-hidden="true"
          className="size-6 animate-spin rounded-full border-2 border-line border-t-action"
        />
      </div>
    );
  }

  return <>{children}</>;
}

export function useJourneyStore(): JourneyStore {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useJourneyStore must be used inside <JourneyStoreProvider>. The app shell provides it.",
    );
  }
  return ctx;
}
