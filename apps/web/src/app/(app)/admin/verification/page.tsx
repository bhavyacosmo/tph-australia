"use client";

import { SectionHeader } from "@/components/ui/page";
import { ApplicationReview } from "@/components/admin/application-review";
import { useJourneyStore } from "@/lib/store/journey-store";

/**
 * A03a/A04 — professional verification.
 *
 * Verifying an application now CREATES the live directory profile, adds the
 * professional to the account directory, and writes the check to the activity
 * log. Before this round it only stamped the application, which meant an
 * admin's decision had no visible effect anywhere else in the product.
 *
 * ⚠️ [C-03] holds: an application is not an account and is not listed anywhere
 * until an admin records what was checked.
 */
export default function AdminVerificationPage() {
  const { applications } = useJourneyStore();
  const pending = applications.filter((a) => a.status === "pending");

  return (
    <>
      <SectionHeader
        title="Verification"
        subtitle="Professionals who applied through the website. Recording a check is what puts them in the directory."
        count={pending.length > 0 ? `${pending.length} pending` : undefined}
      />
      <div className="mt-8">
        <ApplicationReview />
      </div>
    </>
  );
}
