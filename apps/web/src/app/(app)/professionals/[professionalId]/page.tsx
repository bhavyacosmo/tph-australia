import { ProfessionalProfile } from "@/components/professionals/professional-profile";

/**
 * S21 — Professional profile.
 *
 * FR-06-06…14. The CTA is **Request via Trust Link**, never "Connect" ([C-16]) —
 * the difference matters because "Connect" implies the connection has already
 * happened, and nothing has been sent at this point.
 *
 * The id is resolved in the CLIENT. A professional an admin approved during this
 * session exists only in localStorage, so a server lookup against the seed
 * module would 404 the one profile the onboarding demonstration produces.
 */
export default async function ProfessionalPage({
  params,
}: PageProps<"/professionals/[professionalId]">) {
  const { professionalId } = await params;
  return <ProfessionalProfile professionalId={professionalId} />;
}
