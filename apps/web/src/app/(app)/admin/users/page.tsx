"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { EmptyState, SectionHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { ROLE_LABEL } from "@/lib/mock/accounts";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock/types";

/**
 * The account directory — one table, several entry points.
 *
 * The sidebar's Users, Buyers, Sellers and Suspended rows all land here with a
 * different query. Three near-identical pages would drift apart the first time
 * a column changed; a filter cannot.
 *
 * Suspension is real state, not a label: the store refuses sign-in for a
 * suspended demo account, so an admin can suspend the buyer, sign out, and watch
 * the sign-in fail.
 *
 * `ADM-08` — this shows account state only. There is no route from any row to
 * that person's properties, notes or documents.
 */
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<SectionHeader title="Users" subtitle="Loading…" />}>
      <UsersTable />
    </Suspense>
  );
}

function UsersTable() {
  const params = useSearchParams();
  const { users, setUserSuspended, session } = useJourneyStore();

  const roleFilter = params.get("role") as Role | null;
  const statusFilter = params.get("status");

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter === "suspended" && !u.suspended) return false;
    return true;
  });

  const title =
    statusFilter === "suspended"
      ? "Suspended accounts"
      : roleFilter
        ? `${ROLE_LABEL[roleFilter]}s`
        : "Users";

  return (
    <>
      <SectionHeader
        title={title}
        subtitle="Every account on the platform. You can see who they are and whether they have access — nothing about what they have saved."
        count={`${filtered.length} of ${users.length}`}
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No accounts match"
          body="Nothing here right now. Try Users for the full directory."
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line-subtle">
          <table className="w-full min-w-[46rem] border-collapse bg-surface-card text-left">
            <caption className="sr-only">
              Platform accounts, with role, contact and status
            </caption>
            <thead>
              <tr className="border-b border-line-subtle bg-surface-sunken">
                {["Name", "Role", "Contact", "Joined", "Status", ""].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-caption font-semibold uppercase tracking-wider text-fg-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isSelf = session?.role === "admin" && user.role === "admin";
                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "border-b border-line-subtle last:border-0",
                      user.suspended && "bg-surface-sunken",
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <span className="block text-body-sm font-medium text-fg-heading">
                        {user.name}
                      </span>
                      <span className="block text-caption text-fg-muted">
                        {user.context}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      {ROLE_LABEL[user.role]}
                      {user.demo && (
                        <span className="ml-2 rounded bg-surface-sunken px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-fg-muted">
                          Demo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      <span className="block tabular">{user.phone}</span>
                      <span className="block text-caption text-fg-muted">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-body-sm text-fg-secondary">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusChip tone={user.suspended ? "danger" : "success"}>
                        {user.suspended ? "Suspended" : "Active"}
                      </StatusChip>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {/* An admin locking themselves out mid-demo is a support
                          call, not a feature. */}
                      {isSelf ? (
                        <span className="text-caption text-fg-muted">
                          Your account
                        </span>
                      ) : (
                        <Button
                          variant={user.suspended ? "secondary" : "tertiary"}
                          size="sm"
                          onClick={() =>
                            setUserSuspended(user.id, !user.suspended)
                          }
                        >
                          {user.suspended ? "Restore" : "Suspend"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-body-sm text-fg-muted">
        Suspending an account is not cosmetic — a suspended demo account is
        refused at sign-in. Sign out and try it.
      </p>
    </>
  );
}
