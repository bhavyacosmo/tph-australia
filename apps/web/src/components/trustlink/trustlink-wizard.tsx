"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Home,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/shells/app-shell";
import { PageShell } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceRow, Textarea } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import {
  ProfessionalAvatar,
  VerificationBadge,
} from "@/components/domain/professional-card";
import { useJourneyStore } from "@/lib/store/journey-store";
import {
  CONTACT_CHANNELS,
  EXPIRY_OPTIONS,
  SCOPE_ITEMS,
  SERVICES,
  serviceFor,
} from "@/lib/mock/marketplace";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ServiceKey } from "@/lib/mock/types";

/**
 * The Trust Link request, in four deliberate steps.
 *
 * S23 (the confirmation) is a separate step and MUST stay separate — the screen
 * inventory forbids merging it into the terms step, because the confirmation
 * has to be a distinct, deliberate act rather than the bottom of a form.
 *
 * FR-07-04 is enforced structurally: `sharedItems` starts as `["address"]` and
 * nothing else. There is no code path that pre-selects an optional item.
 */

type Step = "service" | "professional" | "sharing" | "confirm";

const STEPS: { key: Step; label: string }[] = [
  { key: "service", label: "What you need" },
  { key: "professional", label: "Who" },
  { key: "sharing", label: "What you share" },
  { key: "confirm", label: "Confirm" },
];

export function TrustLinkWizard({
  initialService,
  initialProfessional,
  initialProperty,
}: {
  initialService?: string;
  initialProfessional?: string;
  initialProperty?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const {
    journey,
    activeProperties,
    createTrustLink,
    state,
    /*
      Read the STORE, not the seed module. A professional an admin verified
      minutes ago must be choosable here, and a suspended one must not be —
      neither of which is true of the static cohort.
    */
    professionals,
    getProfessional,
  } = useJourneyStore();

  /** Verified first: the distinction is the point of the directory. */
  const choicesFor = (key: ServiceKey) =>
    professionals
      .filter((p) => p.serviceKey === key)
      .sort((a, b) =>
        a.verification && !b.verification
          ? -1
          : !a.verification && b.verification
            ? 1
            : 0,
      );

  const [step, setStep] = useState<Step>(
    initialProfessional ? "sharing" : initialService ? "professional" : "service",
  );
  const [serviceKey, setServiceKey] = useState<ServiceKey | null>(
    (initialService as ServiceKey) ?? null,
  );
  const [professionalId, setProfessionalId] = useState<string | null>(
    initialProfessional ?? null,
  );
  /*
    Defaults to the MOST RECENTLY saved property, not the oldest. Someone
    arriving here has almost always just saved the home they are asking about —
    the client's own flow is save, then find help (transcript L317-331). The
    choice is still explicit on the sharing step.
  */
  const [propertyId, setPropertyId] = useState<string>(
    initialProperty ??
      [...activeProperties].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      )[0]?.id ??
      "",
  );

  /* FR-07-04 — only the required item is on. Nothing else, ever, by default. */
  const [sharedItems, setSharedItems] = useState<string[]>(["address"]);
  const [channel, setChannel] =
    useState<(typeof CONTACT_CHANNELS)[number]["value"]>("through_tph");
  const [expiryDays, setExpiryDays] = useState(30);
  const [note, setNote] = useState("");

  const service = serviceKey ? serviceFor(serviceKey) : null;
  const professional = professionalId ? getProfessional(professionalId) : null;
  const property = activeProperties.find((p) => p.id === propertyId);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const toggleItem = (id: string) =>
    setSharedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  /* Choosing a channel that needs an item turns that item on, visibly. */
  const chooseChannel = (value: typeof channel) => {
    setChannel(value);
    const requires = CONTACT_CHANNELS.find((c) => c.value === value)?.requires;
    if (requires && !sharedItems.includes(requires)) {
      setSharedItems((prev) => [...prev, requires]);
    }
  };

  const send = () => {
    if (!serviceKey || !professionalId || !property || !service) return;
    const id = createTrustLink({
      propertyId: property.id,
      professionalId,
      serviceKey,
      purpose: service.purpose,
      note,
      sharedItems,
      contactChannel: channel,
      expiryDays,
    });
    router.push(routes.trustLink(id));
  };

  /* No saved properties — a Trust Link is always about a property */
  if (activeProperties.length === 0) {
    return (
      <AppShell showStageBar={false}>
        <PageShell className="max-w-2xl">
          <h1 className="text-h1 text-fg-heading">Save a property first</h1>
          <p className="measure mt-4 text-body-lg text-fg-secondary">
            A Trust Link is always about one property — it&apos;s what tells the
            professional which home you mean. Save the one you&apos;re
            considering and come back.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.search()} variant="primary">
              Find a property
            </ButtonLink>
            <ButtonLink href={routes.addProperty(journey.id)} variant="secondary">
              Add one manually
            </ButtonLink>
          </div>
        </PageShell>
      </AppShell>
    );
  }

  return (
    <AppShell showStageBar={false}>
      <PageShell className="max-w-4xl">
        {/* ---------------------------------------------------------- stepper */}
        <nav aria-label="Progress" className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-3.5 text-line-strong"
                  />
                )}
                <span
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 text-body-sm",
                    current
                      ? "font-medium text-fg-heading"
                      : done
                        ? "text-fg-secondary"
                        : "text-fg-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 place-items-center rounded-full border text-[0.625rem] font-semibold",
                      done && "border-action bg-action text-white",
                      current && "border-action text-action",
                      !done && !current && "border-line",
                    )}
                  >
                    {done ? <Check className="size-3" /> : i + 1}
                  </span>
                  {s.label}
                </span>
              </div>
            );
          })}
        </nav>

        {/*
          Keyed on the step, and deliberately NOT wrapped in
          `AnimatePresence mode="wait"`. That mode holds the next step until the
          previous one's exit animation completes — and if those frames are ever
          throttled (a backgrounded tab, an interrupted animation) the wizard
          shows nothing at all. A form must never be able to go blank, so the new
          step simply mounts and rises in.
        */}
        <motion.div
          key={step}
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
            {/* ============================================ 1 · what you need */}
            {step === "service" && (
              <section aria-labelledby="service-heading">
                <h1 id="service-heading" className="text-h1 text-fg-heading">
                  What do you need help with?
                </h1>
                <p className="measure mt-4 text-body-lg text-fg-secondary">
                  Pick one. You can create another Trust Link for a different
                  kind of help at any time.
                </p>

                <ul className="mt-10 space-y-3">
                  {SERVICES.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setServiceKey(s.key);
                          setProfessionalId(null);
                          setStep("professional");
                        }}
                        className={cn(
                          "group flex w-full items-start gap-4 rounded-2xl border p-5 text-left",
                          "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                          "border-line-subtle bg-surface-card hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-h4 text-fg-heading">
                            {s.label}
                          </span>
                          <span className="mt-1 block text-body text-fg-secondary">
                            {s.need}
                          </span>
                          <span className="measure mt-2 block text-body-sm text-fg-muted">
                            {s.blurb}
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0 text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                        />
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 text-body-sm text-fg-muted">
                  Four to start with. More categories come later — this is the
                  launch set.
                </p>
              </section>
            )}

            {/* ============================================== 2 · who */}
            {step === "professional" && service && (
              <section aria-labelledby="who-heading">
                <h1 id="who-heading" className="text-h1 text-fg-heading">
                  Choose your {service.label.toLowerCase()}
                </h1>
                <p className="measure mt-4 text-body-lg text-fg-secondary">
                  Nothing is sent by choosing. You&apos;ll see exactly what
                  they&apos;d receive before anything leaves your record.
                </p>

                <ul className="mt-10 space-y-4">
                  {choicesFor(service.key).map((p) => {
                    const selected = professionalId === p.id;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setProfessionalId(p.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-start gap-4 rounded-2xl border p-5 text-left",
                            "transition-[border-color,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                            selected
                              ? "border-action bg-trustlink-wash"
                              : "border-line-subtle bg-surface-card hover:border-line",
                          )}
                        >
                          <ProfessionalAvatar
                            professional={p}
                            className="size-12"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-h4 text-fg-heading">
                              {p.name}
                            </span>
                            {p.contactName && (
                              <span className="block text-body-sm text-fg-secondary">
                                {p.contactName}
                              </span>
                            )}
                            <span className="measure mt-2 block text-body-sm text-fg-secondary">
                              {p.approach}
                            </span>
                            <span className="mt-3 block">
                              <VerificationBadge professional={p} />
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2",
                              selected
                                ? "border-action bg-action text-white"
                                : "border-line",
                            )}
                          >
                            {selected && <Check className="size-3" />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <StepNav
                  onBack={() => setStep("service")}
                  onNext={() => setStep("sharing")}
                  nextDisabled={!professionalId}
                  nextLabel="Choose what to share"
                />
              </section>
            )}

            {/* =========================================== 3 · what you share */}
            {step === "sharing" && professional && service && (
              <section aria-labelledby="sharing-heading">
                <h1 id="sharing-heading" className="text-h1 text-fg-heading">
                  You decide exactly what they see
                </h1>
                <p className="measure mt-4 text-body-lg text-fg-secondary">
                  Everything optional starts off. Turn on only what{" "}
                  {professional.name} actually needs to do the job.
                </p>

                {/* which property */}
                <div className="mt-10">
                  <h2 className="text-h4 text-fg-heading">Which property</h2>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {activeProperties.map((p) => (
                      <ChoiceRow
                        key={p.id}
                        type="radio"
                        name="property"
                        value={p.id}
                        checked={propertyId === p.id}
                        onChange={() => setPropertyId(p.id)}
                        label={p.address}
                        description={`${p.suburb} QLD ${p.postcode}`}
                      />
                    ))}
                  </div>
                </div>

                {/* the permission rows */}
                <div className="mt-10">
                  <h2 className="text-h4 text-fg-heading">What they receive</h2>
                  <ul className="mt-4 space-y-2.5">
                    {SCOPE_ITEMS.map((item) => {
                      const on = sharedItems.includes(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => !item.required && toggleItem(item.id)}
                            disabled={item.required}
                            aria-pressed={on}
                            className={cn(
                              "group flex w-full items-start gap-3.5 rounded-xl border p-4 text-left",
                              "transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                              on
                                ? "border-action/40 bg-trustlink-wash"
                                : "border-line-subtle bg-surface-card",
                              item.required
                                ? "cursor-default"
                                : "hover:border-line",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                                on
                                  ? "bg-action text-white"
                                  : "bg-surface-sunken text-fg-muted",
                              )}
                            >
                              {item.required ? (
                                <Lock className="size-2.5" />
                              ) : on ? (
                                <Check className="size-3" />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-body-sm font-medium text-fg-heading">
                                  {item.label}
                                </span>
                                {item.required && (
                                  <StatusChip tone="neutral">
                                    Required for this service
                                  </StatusChip>
                                )}
                              </span>
                              <span className="mt-0.5 block text-body-sm text-fg-secondary">
                                {item.consequence}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-caption font-medium",
                                on ? "text-action" : "text-fg-muted",
                              )}
                            >
                              {on ? "Shared" : "Private"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* channel + period */}
                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="text-h4 text-fg-heading">
                      How they may contact you
                    </h2>
                    <div className="mt-4 space-y-2.5">
                      {CONTACT_CHANNELS.map((c) => (
                        <ChoiceRow
                          key={c.value}
                          type="radio"
                          name="channel"
                          value={c.value}
                          checked={channel === c.value}
                          onChange={() => chooseChannel(c.value)}
                          label={c.label}
                          description={c.description}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-h4 text-fg-heading">How long</h2>
                    <p className="mt-1.5 text-body-sm text-fg-muted">
                      Access ends automatically. You can withdraw sooner.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      {EXPIRY_OPTIONS.map((o) => (
                        <ChoiceRow
                          key={o.value}
                          type="radio"
                          name="expiry"
                          value={String(o.value)}
                          checked={expiryDays === o.value}
                          onChange={() => setExpiryDays(o.value)}
                          label={o.label}
                          description={o.recommended ? "Suggested" : undefined}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <label
                    htmlFor="tl-note"
                    className="text-h4 text-fg-heading"
                  >
                    Anything they should know?
                  </label>
                  <p className="mt-1.5 text-body-sm text-fg-muted">
                    Optional. Goes to them with the request.
                  </p>
                  <Textarea
                    id="tl-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="I'm hoping to inspect before the weekend."
                    className="mt-4"
                  />
                </div>

                <StepNav
                  onBack={() => setStep("professional")}
                  onNext={() => setStep("confirm")}
                  nextLabel="Review before sending"
                />
              </section>
            )}

            {/* ================================================= 4 · confirm */}
            {step === "confirm" && professional && service && property && (
              <section aria-labelledby="confirm-heading">
                <p className="text-overline uppercase text-fg-muted">
                  Nothing has been sent yet
                </p>
                <h1
                  id="confirm-heading"
                  className="mt-3 text-h1 text-fg-heading"
                >
                  Check this before it goes
                </h1>
                <p className="measure mt-4 text-body-lg text-fg-secondary">
                  This is everything {professional.name} will receive, in plain
                  English.
                </p>

                {/* A definition list, because that is what a disclosure is:
                    term and value. Screen readers announce the pairing. */}
                <dl className="mt-10 overflow-hidden rounded-2xl border border-line-subtle">
                  <Disclosure label="Who receives it">
                    <div className="flex items-center gap-3">
                      <ProfessionalAvatar
                        professional={professional}
                        className="size-10"
                      />
                      <span>
                        <span className="block font-medium text-fg-heading">
                          {professional.name}
                        </span>
                        <span className="block text-body-sm text-fg-muted">
                          {professional.category} · {professional.area}
                        </span>
                      </span>
                    </div>
                  </Disclosure>

                  <Disclosure label="Why">{service.purpose}</Disclosure>

                  <Disclosure label="About which property">
                    {property.address}, {property.suburb} QLD {property.postcode}
                  </Disclosure>

                  <Disclosure label="What they will see">
                    <ul className="space-y-1.5">
                      {SCOPE_ITEMS.filter((i) => sharedItems.includes(i.id)).map(
                        (i) => (
                          <li
                            key={i.id}
                            className="flex items-start gap-2 text-fg"
                          >
                            <Check
                              aria-hidden="true"
                              className="mt-1 size-3.5 shrink-0 text-action"
                            />
                            {i.label}
                          </li>
                        ),
                      )}
                    </ul>
                  </Disclosure>

                  <Disclosure label="What stays private">
                    <ul className="space-y-1.5">
                      {SCOPE_ITEMS.filter(
                        (i) => !sharedItems.includes(i.id),
                      ).map((i) => (
                        <li
                          key={i.id}
                          className="flex items-start gap-2 text-fg-muted"
                        >
                          <Lock
                            aria-hidden="true"
                            className="mt-1 size-3 shrink-0"
                          />
                          {i.label}
                        </li>
                      ))}
                      {SCOPE_ITEMS.every((i) => sharedItems.includes(i.id)) && (
                        <li className="text-fg-muted">
                          Nothing — you chose to share everything above.
                        </li>
                      )}
                    </ul>
                  </Disclosure>

                  <Disclosure label="How they may contact you">
                    {
                      CONTACT_CHANNELS.find((c) => c.value === channel)
                        ?.label
                    }
                  </Disclosure>

                  <Disclosure label="How long it lasts">
                    <span className="flex items-center gap-2">
                      <Clock aria-hidden="true" className="size-4 text-fg-muted" />
                      {expiryDays} days from the moment they accept, then access
                      ends by itself.
                    </span>
                  </Disclosure>
                </dl>

                <p className="mt-6 flex items-start gap-3 rounded-xl bg-trustlink-wash p-4 text-body-sm text-fg-secondary">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-action"
                  />
                  <span>
                    You can withdraw this at any time, and their access stops
                    immediately. Nothing you share here can be passed on to
                    anyone else.
                  </span>
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button variant="tertiary" onClick={() => setStep("sharing")}>
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Change what I share
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={send}
                    className="group"
                  >
                    Send this request
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </Button>
                </div>
              </section>
            )}
        </motion.div>

        {/* context reminder */}
        {property && step !== "confirm" && (
          <p className="mt-12 flex items-center gap-2 border-t border-line-subtle pt-6 text-body-sm text-fg-muted">
            <Home aria-hidden="true" className="size-3.5 shrink-0" />
            About {property.address}, {property.suburb} · journey &ldquo;
            {state.journeys[0].name}&rdquo;
          </p>
        )}
      </PageShell>
    </AppShell>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-6">
      <Button variant="tertiary" onClick={onBack}>
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onNext}
        disabled={nextDisabled}
        className="group"
      >
        {nextLabel}
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
        />
      </Button>
    </div>
  );
}

function Disclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-line-subtle bg-surface-card p-5 last:border-0 sm:grid-cols-[14rem_1fr] sm:gap-6">
      <dt className="text-body-sm text-fg-muted">{label}</dt>
      <dd className="text-body text-fg">{children}</dd>
    </div>
  );
}
