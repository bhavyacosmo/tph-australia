import { SaveBoundary } from "@/components/journey/save-boundary";

/**
 * S02 — Save boundary. FR-01-15, ENT-03.
 *
 * Deliberately outside the app chrome: no header, no nav, no stage bar. This
 * screen has one job, and the surrounding navigation is the main thing that
 * competes with it.
 */
export default function SaveBoundaryPage() {
  return <SaveBoundary />;
}
