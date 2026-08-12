import { notFound } from "next/navigation";

import { ProfessionalProfile } from "@/components/professionals/professional-profile";
import { professionalById } from "@/lib/mock/marketplace";

/**
 * S21 — Professional profile.
 *
 * FR-06-06…14. The CTA is **Request via Trust Link**, never "Connect" ([C-16]) —
 * the difference matters because "Connect" implies the connection has already
 * happened, and nothing has been sent at this point.
 */
export default async function ProfessionalPage({
  params,
}: PageProps<"/professionals/[professionalId]">) {
  const { professionalId } = await params;
  const professional = professionalById(professionalId);

  if (!professional) notFound();

  return <ProfessionalProfile professional={professional} />;
}
