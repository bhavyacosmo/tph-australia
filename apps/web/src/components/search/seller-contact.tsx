"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Mail, MessageSquare, Phone, Send, ShieldCheck } from "lucide-react";

import { RailPanel } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useJourneyStore } from "@/lib/store/journey-store";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/mock/types";

/**
 * Contact the seller.
 *
 * The design constraint is the same one that governs a Trust Link: **the buyer
 * decides what travels.** Concretely —
 *
 *  · the seller receives the buyer's FIRST NAME only, never their surname;
 *  · the phone toggle starts OFF, and when it is off the number is not merely
 *    hidden from the seller's screen, it is never written into the record;
 *  · the panel lists what will be sent before it is sent, not afterwards.
 *
 * A buyer who is not signed in is sent to sign in and returned here — the same
 * boundary saving a property uses, for the same reason: this is the moment a
 * browser becomes a user.
 */
export function SellerContact({ listing }: { listing: Listing }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { session, state, expressInterest, interestForListing } =
    useJourneyStore();

  const existing = interestForListing(listing.id);
  const [message, setMessage] = useState("");
  const [sharePhone, setSharePhone] = useState(false);
  const [pending, setPending] = useState(false);

  /* ------------------------------------------------------------ already sent */
  if (existing) {
    return (
      <RailPanel>
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="grid size-11 place-items-center rounded-full bg-success-bg text-success-fg">
            <Check aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-4 text-h4 text-fg-heading">
            Your enquiry has been sent
          </h2>
          <p className="mt-2 text-body-sm text-fg-secondary">
            Sent {formatRelative(existing.createdAt)} to{" "}
            {listing.sellerName ?? "the seller"}. They can see your first name
            and your message
            {existing.sharePhone ? ", and your phone number" : " — nothing else"}.
          </p>

          {existing.thread.length > 0 ? (
            <ul className="mt-5 space-y-3 border-t border-line-subtle pt-5">
              {existing.thread.map((m, i) => (
                <li key={`${m.at}-${i}`} className="rounded-xl bg-surface-sunken p-4">
                  <p className="text-caption font-medium uppercase tracking-wider text-fg-muted">
                    {m.by === "seller" ? "Seller" : "You"} ·{" "}
                    {formatRelative(m.at)}
                  </p>
                  <p className="mt-1.5 text-body-sm text-fg-secondary">{m.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-caption text-fg-muted">
              Their reply will appear here and in your Prop ID.
            </p>
          )}
        </motion.div>
      </RailPanel>
    );
  }

  const send = () => {
    if (!session) {
      router.push(
        `/sign-in?next=${encodeURIComponent(routes.listing(listing.id))}`,
      );
      return;
    }
    if (!message.trim()) return;

    setPending(true);
    window.setTimeout(() => {
      expressInterest({
        listingId: listing.id,
        message: message.trim(),
        sharePhone,
      });
      setPending(false);
    }, 600);
  };

  const CHANNEL = {
    through_tph: {
      icon: MessageSquare,
      line: "Replies arrive here and in your Prop ID.",
    },
    phone: { icon: Phone, line: "This seller prefers a phone call." },
    email: { icon: Mail, line: "This seller prefers email." },
  }[listing.sellerContact ?? "through_tph"];

  return (
    <RailPanel>
      <h2 className="text-h4 text-fg-heading">Interested in this one?</h2>
      <p className="mt-2 text-body-sm text-fg-secondary">
        Send {listing.sellerName ?? "the seller"} a message. You decide what they
        can see about you.
      </p>

      <label htmlFor="interest-message" className="sr-only">
        Your message to the seller
      </label>
      <Textarea
        id="interest-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Is the property still available, and could I arrange an inspection this week?"
        className="mt-4 min-h-24"
      />

      {/* ------------------------------------------ the one thing that leaks */}
      <label
        className={cn(
          "mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5",
          "transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
          sharePhone
            ? "border-action bg-trustlink-wash"
            : "border-line-subtle bg-surface-page hover:border-line",
        )}
      >
        <input
          type="checkbox"
          checked={sharePhone}
          onChange={(e) => setSharePhone(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[0.3rem] border-2 transition-colors duration-[var(--duration-fast)]",
            sharePhone ? "border-action bg-action" : "border-line bg-surface-card",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-line-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-card",
          )}
        >
          {sharePhone && (
            <span className="size-2.5 rounded-[0.1rem] bg-action-fg" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-body-sm font-medium text-fg-heading">
            Also share my phone number
          </span>
          <span className="mt-0.5 block text-body-sm text-fg-secondary">
            {sharePhone
              ? `They will see ${state.user.phone ?? "your number"} and can call you directly.`
              : "Off — they can only reply through The Property Helpline."}
          </span>
        </span>
      </label>

      {/* --------------------------------------- stated before, not after */}
      <div className="mt-4 rounded-xl bg-surface-sunken p-4">
        <p className="text-caption font-semibold uppercase tracking-wider text-fg-muted">
          What the seller will see
        </p>
        <ul className="mt-2 space-y-1.5 text-body-sm text-fg-secondary">
          <li className="flex items-center gap-2">
            <Check aria-hidden="true" className="size-3.5 shrink-0 text-action" />
            Your first name — {state.user.firstName}
          </li>
          <li className="flex items-center gap-2">
            <Check aria-hidden="true" className="size-3.5 shrink-0 text-action" />
            Your message
          </li>
          <li className="flex items-center gap-2">
            {sharePhone ? (
              <Check aria-hidden="true" className="size-3.5 shrink-0 text-action" />
            ) : (
              <span
                aria-hidden="true"
                className="size-3.5 shrink-0 text-center text-fg-muted"
              >
                —
              </span>
            )}
            Your phone number
          </li>
        </ul>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={pending}
        disabled={!message.trim()}
        onClick={send}
        className="mt-5"
      >
        <Send aria-hidden="true" className="size-4" />
        {session ? "Send enquiry" : "Sign in to send"}
      </Button>

      <p className="mt-4 flex items-start gap-2.5 text-caption text-fg-muted">
        <CHANNEL.icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        {CHANNEL.line}
      </p>
      <p className="mt-2 flex items-start gap-2.5 text-caption text-fg-muted">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        Your surname, email and everything in your Prop ID stay private. This is
        an enquiry, not a Trust Link.
      </p>
    </RailPanel>
  );
}
