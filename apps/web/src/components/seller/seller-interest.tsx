"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  MessageSquare,
  Phone,
  PhoneOff,
  Send,
  User,
} from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useJourneyStore } from "@/lib/store/journey-store";
import { INTEREST_STATUS_LABEL } from "@/lib/mock/platform";
import { formatRelative } from "@/lib/format";

/**
 * Interested buyers.
 *
 * What a seller sees is the point of this screen: the buyer's FIRST NAME, the
 * property, and their message. A phone number appears only where the buyer
 * switched sharing on — and where they did not, the row says so explicitly
 * rather than showing an empty field, because "no number shown" and "buyer
 * declined to share" are different facts and the seller should know which.
 *
 * ⚠️ NOT a messaging product. Replies are stored on the record so the prototype
 * can show the exchange; there is no delivery and no notification.
 */
export function SellerInterest() {
  const { myInterests, markInterestSeen, replyToInterest, closeInterest } =
    useJourneyStore();
  const reduce = useReducedMotion();

  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const open = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
    setReply("");
    markInterestSeen(id);
  };

  const send = (id: string) => {
    if (!reply.trim()) return;
    replyToInterest(id, reply.trim());
    setReply("");
  };

  const active = myInterests.filter((i) => i.status !== "closed");
  const closed = myInterests.filter((i) => i.status === "closed");

  return (
    <>
      <SectionHeader
        title="Interested buyers"
        subtitle="Everyone who has asked about one of your properties."
        count={active.length > 0 ? `${active.length} open` : undefined}
      />

      {myInterests.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<MessageSquare aria-hidden="true" className="size-5" />}
          title="No enquiries yet"
          body="When a buyer registers interest in one of your listings, their message arrives here."
        />
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {[...active, ...closed].map((interest) => {
            const expanded = openId === interest.id;
            return (
              <RevealItem key={interest.id}>
                <article className="overflow-hidden rounded-2xl border border-line-subtle bg-surface-card">
                  <button
                    type="button"
                    onClick={() => open(interest.id)}
                    aria-expanded={expanded}
                    className="flex w-full flex-col gap-3 p-5 text-left transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-caption font-semibold text-brand-fg"
                      >
                        {interest.buyerName.charAt(0)}
                      </span>
                      <span className="text-body font-semibold text-fg-heading">
                        {interest.buyerName}
                      </span>
                      <StatusChip
                        tone={
                          interest.status === "sent"
                            ? "attention"
                            : interest.status === "replied"
                              ? "success"
                              : "neutral"
                        }
                      >
                        {INTEREST_STATUS_LABEL[interest.status]}
                      </StatusChip>
                      <span className="ml-auto text-caption text-fg-muted">
                        {formatRelative(interest.createdAt)}
                      </span>
                    </div>

                    <p className="text-body-sm text-fg-muted">
                      {interest.listingAddress}
                    </p>
                    <p className="measure text-body text-fg-secondary">
                      {interest.message}
                    </p>
                  </button>

                  {expanded && (
                    <motion.div
                      initial={reduce ? undefined : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="border-t border-line-subtle p-5"
                    >
                      {/* ------------------------------ what you can see */}
                      <h3 className="text-overline uppercase text-fg-muted">
                        What this buyer shared
                      </h3>
                      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-2.5">
                          <User
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-fg-muted"
                          />
                          <div>
                            <dt className="text-caption text-fg-muted">Name</dt>
                            <dd className="text-body-sm text-fg">
                              {interest.buyerName}{" "}
                              <span className="text-fg-muted">
                                (first name only)
                              </span>
                            </dd>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          {interest.sharePhone ? (
                            <Phone
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-action"
                            />
                          ) : (
                            <PhoneOff
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-fg-muted"
                            />
                          )}
                          <div>
                            <dt className="text-caption text-fg-muted">Phone</dt>
                            <dd className="text-body-sm text-fg">
                              {interest.sharePhone && interest.buyerPhone ? (
                                interest.buyerPhone
                              ) : (
                                <span className="text-fg-muted">
                                  Not shared — reply here instead
                                </span>
                              )}
                            </dd>
                          </div>
                        </div>
                      </dl>

                      {/* ---------------------------------------- thread */}
                      {interest.thread.length > 0 && (
                        <ul className="mt-6 space-y-3 border-t border-line-subtle pt-5">
                          {interest.thread.map((message, i) => (
                            <li
                              key={`${message.at}-${i}`}
                              className="rounded-xl bg-surface-sunken p-4"
                            >
                              <p className="text-caption font-medium uppercase tracking-wider text-fg-muted">
                                {message.by === "seller" ? "You" : "Buyer"} ·{" "}
                                {formatRelative(message.at)}
                              </p>
                              <p className="mt-1.5 text-body-sm text-fg-secondary">
                                {message.body}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* ----------------------------------------- reply */}
                      {interest.status !== "closed" && (
                        <div className="mt-6 border-t border-line-subtle pt-5">
                          <label
                            htmlFor={`reply-${interest.id}`}
                            className="text-body-sm font-medium text-fg-heading"
                          >
                            Reply to {interest.buyerName}
                          </label>
                          <Textarea
                            id={`reply-${interest.id}`}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Yes, the outdoor area is approved — happy to arrange a private inspection this Thursday."
                            className="mt-2"
                          />
                          <div className="mt-4 flex flex-wrap gap-3">
                            <Button
                              variant="primary"
                              size="md"
                              disabled={!reply.trim()}
                              onClick={() => send(interest.id)}
                            >
                              <Send aria-hidden="true" className="size-4" />
                              Send reply
                            </Button>
                            <Button
                              variant="tertiary"
                              size="md"
                              onClick={() => closeInterest(interest.id)}
                            >
                              <CheckCircle2 aria-hidden="true" className="size-4" />
                              Mark as closed
                            </Button>
                          </div>
                          <p className="mt-3 text-caption text-fg-muted">
                            Prototype: the reply is saved against this enquiry so
                            you can see the exchange. Nothing is sent anywhere.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </>
  );
}
