"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Check, Eye, ShieldAlert, UserRound } from "lucide-react";

import { ProShell } from "@/components/shells/pro-shell";
import { SectionHeader, RailPanel } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { StatusChip } from "@/components/ui/status-chip";
import { useJourneyStore } from "@/lib/store/journey-store";
import { monogram } from "@/lib/mock/media";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * The professional's own profile.
 *
 * They may rewrite every word a buyer reads about them — and cannot touch the
 * one thing that carries weight. `verification` is not on this form: it is the
 * record of what TPH checked and when (PRO-05), and the store's patch type
 * excludes it, so an attempt to edit it here would not compile.
 *
 * There is no photograph field. We do not fabricate faces, and real headshots
 * have to come from the professionals themselves with permission — see
 * src/lib/mock/media.ts.
 *
 * There is no rating, no review count and no star. [C-15]: the client documents
 * do not contain a review system, and adding one would change what verification
 * means.
 */
export default function ProProfilePage() {
  const { myProfessional, updateProfessionalProfile } = useJourneyStore();

  const [form, setForm] = useState({
    name: myProfessional?.name ?? "",
    contactName: myProfessional?.contactName ?? "",
    area: myProfessional?.area ?? "",
    approach: myProfessional?.approach ?? "",
    experience: myProfessional?.experience ?? "",
    feeNote: myProfessional?.feeNote ?? "",
    serviceAreas: (myProfessional?.serviceAreas ?? []).join(", "),
  });
  const [saved, setSaved] = useState(false);

  if (!myProfessional) {
    return (
      <ProShell>
        <SectionHeader
          title="Profile"
          subtitle="We couldn't find a listing for this account."
        />
      </ProShell>
    );
  }

  const save = () => {
    updateProfessionalProfile(myProfessional.id, {
      name: form.name.trim() || myProfessional.name,
      contactName: form.contactName.trim() || null,
      area: form.area.trim(),
      approach: form.approach.trim(),
      experience: form.experience.trim(),
      feeNote: form.feeNote.trim() || null,
      serviceAreas: form.serviceAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <ProShell>
      <SectionHeader
        title="Profile"
        subtitle="What a buyer reads before they decide whether to contact you."
        actions={
          <Button variant="primary" size="md" onClick={save}>
            Save changes
          </Button>
        }
      />

      {saved && (
        <p
          role="status"
          className="mt-6 flex items-center gap-2 rounded-md border border-success-line bg-success-bg px-4 py-3 text-body-sm text-success-fg"
        >
          <Check aria-hidden="true" className="size-4" />
          Saved. Your directory profile is updated.
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <Field label="Business name">
            {({ id }) => (
              <Input
                id={id}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            )}
          </Field>

          <Field
            label="The person a buyer deals with"
            optional
            hint="Leave blank if enquiries go to the business rather than a named person."
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
              />
            )}
          </Field>

          <Field label="Area">
            {({ id }) => (
              <Input
                id={id}
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="Brisbane southside"
              />
            )}
          </Field>

          <Field
            label="Service areas"
            hint="Separate suburbs with commas. These decide which requests reach you."
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={form.serviceAreas}
                onChange={(e) => set("serviceAreas", e.target.value)}
                placeholder="Carindale, Camp Hill, Coorparoo"
              />
            )}
          </Field>

          <Field
            label="How you work"
            hint="A buyer is choosing between people they have never met. Say what you actually do and how quickly."
          >
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                value={form.approach}
                onChange={(e) => set("approach", e.target.value)}
              />
            )}
          </Field>

          <Field
            label="Experience"
            hint="In plain words. Never a rating or a review count — this product doesn't have those."
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                placeholder="12 years · 4,000+ Brisbane inspections"
              />
            )}
          </Field>

          <Field
            label="Indicative fee"
            optional
            hint="A range is fine. Buyers strongly prefer a number to “contact for a quote”."
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={form.feeNote}
                onChange={(e) => set("feeNote", e.target.value)}
                placeholder="Indicative $550–$690 depending on property size"
              />
            )}
          </Field>
        </div>

        {/* ------------------------------------------------------------ rail */}
        <aside className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-28">
            <RailPanel title="Verification">
              {myProfessional.verification ? (
                <>
                  <StatusChip
                    tone="success"
                    icon={<BadgeCheck aria-hidden="true" className="size-3" />}
                  >
                    {myProfessional.verification.what} checked
                  </StatusChip>
                  <p className="mt-3 text-body-sm text-fg-secondary">
                    Checked on {formatDate(myProfessional.verification.checkedOn)}{" "}
                    by The Property Helpline.
                  </p>
                </>
              ) : (
                <>
                  <StatusChip
                    tone="attention"
                    icon={<ShieldAlert aria-hidden="true" className="size-3" />}
                  >
                    Not yet checked
                  </StatusChip>
                  <p className="mt-3 text-body-sm text-fg-secondary">
                    Buyers see this plainly. Send your licence details to The
                    Property Helpline to have a check recorded.
                  </p>
                </>
              )}
              <p className="mt-4 border-t border-line-subtle pt-4 text-caption text-fg-muted">
                You can&apos;t edit this. It states what we checked and when — if
                you could write it yourself it would mean nothing.
              </p>
            </RailPanel>

            <RailPanel title="Photograph">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 place-items-center rounded-full bg-brand text-body font-semibold text-brand-fg"
                >
                  {monogram(myProfessional.name)}
                </span>
                <p className="text-body-sm text-fg-secondary">
                  Buyers currently see your initials.
                </p>
              </div>
              <p className="mt-4 text-caption text-fg-muted">
                Photo upload isn&apos;t built in this prototype — we don&apos;t
                generate pictures of people. Send a headshot to The Property
                Helpline and it will be added.
              </p>
            </RailPanel>

            <RailPanel tone="sunken">
              <Link
                href={routes.professional(myProfessional.id)}
                className="flex min-h-11 items-center gap-2 text-body-sm font-medium text-fg-link underline-offset-4 hover:underline"
              >
                <Eye aria-hidden="true" className="size-4" />
                See your public profile
              </Link>
              <p className="mt-2 flex items-start gap-2 text-caption text-fg-muted">
                <UserRound aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                Reading your profile sends you nothing. A buyer only reaches you
                by authorising a Trust Link.
              </p>
            </RailPanel>
          </div>
        </aside>
      </div>
    </ProShell>
  );
}
