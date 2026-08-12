"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Info,
  ListTodo,
  Lock,
} from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { PageShell } from "@/components/ui/page";
import { StatusChip } from "@/components/ui/status-chip";
import { Reveal } from "@/components/motion/reveal";
import { useJourneyStore } from "@/lib/store/journey-store";
import { serviceFor } from "@/lib/mock/marketplace";
import { formatRelative, formatUntil } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { TrustLink } from "@/lib/mock/types";

/**
 * P03 — the professional's dashboard.
 *
 * The client described exactly this screen: *"New request awaiting, completed,
 * in progress, building and pest inspection"* — *"that's pretty good"*
 * (transcript L467-469).
 *
 * **FR-08-07 is the important constraint here.** Before accepting, a
 * professional may see the purpose, a broad location, the timing and the reason
 * — and nothing else. No buyer name, no address, no contact detail. This queue
 * therefore shows the suburb, never the street address, and the request detail
 * screen enforces the same line.
 *
 * Documents and Tasks appear in the PM wireframe but are Path B scope ([C-02],
 * [C-07]) and are shown as placeholders rather than half-built.
 */
export default function ProDashboardPage() {
  const reduce = useReducedMotion();
  const { trustLinks, outputs, getProperty } = useJourneyStore();

  const pending = trustLinks.filter((t) => t.status === "pending");
  const active = trustLinks.filter((t) => t.status === "active");
  const completed = trustLinks.filter(
    (t) => t.status === "completed" || t.status === "declined",
  );

  return (
    <ProShell>
      <PageShell>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-overline uppercase text-fg-muted">
              BuildCheck · Brisbane southside
            </p>
            <h1 className="mt-3 text-h1 text-fg-heading">Your work</h1>
            <p className="measure mt-3 text-body-lg text-fg-secondary">
              Requests come to you through a Trust Link. You see enough to decide
              whether to take it on — and the rest only once you accept.
            </p>
          </div>
        </div>

        {/* --------------------------------------------------------- counters */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle lg:grid-cols-4">
          <Counter
            label="New requests"
            value={pending.length}
            icon={Inbox}
            emphasis={pending.length > 0}
          />
          <Counter label="In progress" value={active.length} icon={Clock} />
          <Counter
            label="Completed"
            value={completed.length}
            icon={CheckCircle2}
          />
          <Counter label="Outputs sent" value={outputs.length} icon={FileText} />
        </div>

        {/* ---------------------------------------------------- new requests */}
        <section aria-labelledby="new-heading" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="new-heading" className="text-h2 text-fg-heading">
              New requests
            </h2>
            {pending.length > 0 && (
              <StatusChip tone="attention">
                {pending.length} awaiting you
              </StatusChip>
            )}
          </div>

          {pending.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-10 text-center text-body-sm text-fg-muted">
              Nothing waiting. When a buyer authorises a Trust Link for you, it
              appears here.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {pending.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={reduce ? undefined : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.42,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <RequestRow link={link} suburb={getProperty(link.propertyId)?.suburb} />
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        {/* --------------------------------------------------------- active */}
        <section aria-labelledby="active-heading" className="mt-14">
          <h2 id="active-heading" className="text-h2 text-fg-heading">
            Active connections
          </h2>

          {active.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface-card px-6 py-10 text-center text-body-sm text-fg-muted">
              Nothing active. Accepting a request opens the connection and shows
              you what the buyer chose to share.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {active.map((link) => {
                const property = getProperty(link.propertyId);
                const service = serviceFor(link.serviceKey);
                return (
                  <li key={link.id}>
                    <Link
                      href={routes.proConnection(link.id)}
                      className={cn(
                        "group flex flex-wrap items-center gap-5 rounded-2xl border border-line-subtle bg-surface-card p-5",
                        "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                        "hover:-translate-y-0.5 hover:border-line hover:shadow-elev-2",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-overline uppercase text-fg-muted">
                          {service.label}
                        </p>
                        <p className="mt-1.5 text-h4 text-fg-heading">
                          {property?.address ?? "Property"}
                        </p>
                        <p className="text-body-sm text-fg-muted">
                          {property?.suburb} QLD {property?.postcode}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusChip tone="success">Active</StatusChip>
                        {link.expiresAt && (
                          <p className="text-body-sm text-fg-muted">
                            Access ends {formatUntil(link.expiresAt)}
                          </p>
                        )}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 text-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ------------------------------------------------------ completed */}
        {completed.length > 0 && (
          <section aria-labelledby="completed-heading" className="mt-14">
            <h2 id="completed-heading" className="text-h3 text-fg-heading">
              Completed
            </h2>
            <ul className="mt-5 divide-y divide-line-subtle border-y border-line-subtle">
              {completed.map((link) => {
                const property = getProperty(link.propertyId);
                return (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <span className="min-w-0">
                      <span className="block text-body font-medium text-fg-heading">
                        {property?.address ?? "Property"}
                      </span>
                      <span className="block text-body-sm text-fg-muted">
                        {serviceFor(link.serviceKey).label} ·{" "}
                        {formatRelative(link.createdAt)}
                      </span>
                    </span>
                    <StatusChip
                      tone={link.status === "completed" ? "success" : "neutral"}
                    >
                      {link.status === "completed" ? "Output sent" : "Declined"}
                    </StatusChip>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ---------------------------------------------- scope placeholders */}
        <section aria-labelledby="later-heading" className="mt-16">
          <h2 id="later-heading" className="text-h4 text-fg-heading">
            Not in this prototype
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Placeholder
              icon={ListTodo}
              title="Tasks"
              body="Assigning and tracking tasks appears in the wireframe but sits outside the agreed Stage 1 professional scope. It needs a decision before it is built."
            />
            <Placeholder
              icon={Lock}
              title="Document library"
              body="Sharing documents both ways was raised on the call and called “too much for now” for the first stage. Outputs you submit do reach the buyer's record."
            />
          </div>
        </section>
      </PageShell>
    </ProShell>
  );
}

/**
 * FR-08-07 — pre-acceptance shows purpose, broad location, timing and reason
 * ONLY. Note what is absent: the buyer's name, the street address, any contact
 * detail. That absence is the requirement, not an oversight.
 */
function RequestRow({
  link,
  suburb,
}: {
  link: TrustLink;
  suburb: string | undefined;
}) {
  const service = serviceFor(link.serviceKey);

  return (
    <Link
      href={routes.proRequest(link.id)}
      className={cn(
        "group block rounded-2xl border-2 border-action/30 bg-trustlink-wash p-6",
        "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 hover:border-action/60 hover:shadow-elev-2",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-overline uppercase text-fg-muted">
            {service.label}
          </p>
          <p className="mt-2 text-h3 text-fg-heading">{link.purpose}</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-body-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-muted">Area</dt>
              <dd className="font-medium text-fg">{suburb ?? "Brisbane"}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-muted">Requested</dt>
              <dd className="font-medium text-fg">
                {formatRelative(link.createdAt)}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-muted">Permission period</dt>
              <dd className="font-medium text-fg">{link.expiryDays} days</dd>
            </div>
          </dl>
        </div>
        <StatusChip tone="attention" icon={<Clock aria-hidden="true" className="size-3" />}>
          Awaiting you
        </StatusChip>
      </div>

      {link.note && (
        <p className="measure mt-5 border-t border-action/20 pt-4 text-body-sm italic text-fg-secondary">
          “{link.note}”
        </p>
      )}

      <p className="mt-5 flex items-center gap-2 text-body-sm font-medium text-fg-link">
        Read the request and decide
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
        />
      </p>
    </Link>
  );
}

function Counter({
  label,
  value,
  icon: Icon,
  emphasis = false,
}: {
  label: string;
  value: number;
  icon: typeof Inbox;
  emphasis?: boolean;
}) {
  return (
    <div className={cn("bg-surface-card p-5", emphasis && "bg-trustlink-wash")}>
      <Icon
        aria-hidden="true"
        className={cn("size-4", emphasis ? "text-action" : "text-fg-muted")}
      />
      <p className="tabular mt-3 text-h2 font-bold text-fg-heading">{value}</p>
      <p className="mt-1 text-body-sm text-fg-secondary">{label}</p>
    </div>
  );
}

function Placeholder({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Inbox;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface-card p-5">
      <p className="flex items-center gap-2 text-body font-medium text-fg-heading">
        <Icon aria-hidden="true" className="size-4 text-fg-muted" />
        {title}
      </p>
      <p className="mt-2 flex items-start gap-2 text-body-sm text-fg-muted">
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        {body}
      </p>
    </div>
  );
}
