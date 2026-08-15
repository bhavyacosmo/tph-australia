"use client";

import { Inbox } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { RequestCard } from "@/components/pro/request-card";
import { useJourneyStore } from "@/lib/store/journey-store";

/**
 * P03a — the request queue.
 *
 * The full list, where the Overview shows only the first few. Everything a
 * professional can see before accepting is governed by FR-08-07 and lives in
 * `RequestCard`.
 */
export default function ProRequestsPage() {
  const { trustLinks, getProperty } = useJourneyStore();
  const pending = trustLinks.filter((t) => t.status === "pending");

  return (
    <ProShell>
      <SectionHeader
        title="New requests"
        subtitle="Buyers who have asked you to take something on. You see enough to decide, and the rest only once you accept."
        count={pending.length > 0 ? `${pending.length} awaiting you` : undefined}
      />

      {pending.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Inbox aria-hidden="true" className="size-5" />}
          title="Nothing waiting"
          body="When a buyer sends you a Trust Link request, it arrives here with the purpose, the suburb and their timing — never their name or address."
        />
      ) : (
        <RevealGroup className="mt-8 space-y-4" stagger={0.06}>
          {pending.map((link) => (
            <RevealItem key={link.id}>
              <RequestCard
                link={link}
                suburb={getProperty(link.propertyId)?.suburb}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </ProShell>
  );
}
