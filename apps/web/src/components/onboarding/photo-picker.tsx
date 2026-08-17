"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { monogram } from "@/lib/mock/media";
import { cn } from "@/lib/utils";

/**
 * Choose a profile photograph.
 *
 * ⚠️ NOTHING IS UPLOADED. The file never leaves the device — it is read, drawn
 * to a canvas, centre-cropped to a 256px square and kept as a data URL in the
 * same localStorage record as the rest of the profile.
 *
 * That is a deliberate choice over the "upload isn't wired" note used on the
 * seller's listing form. A file picker that visibly does nothing teaches a
 * reviewer to distrust everything else on the screen, whereas this genuinely
 * works for the length of the demonstration — and 256px of JPEG at 0.82 is
 * roughly 15–25KB, which sits comfortably inside the storage budget. A full
 * 4MB phone photo held as base64 would blow that budget and take the whole
 * prototype's state down with it, which is why the downscale is not optional.
 *
 * Rendered with a plain `<img>`, not `next/image`: the optimiser cannot process
 * a data URL, and asking it to would only produce a warning and a passthrough.
 */

const SIZE = 256;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

export function PhotoPicker({
  value,
  onChange,
  name,
  label = "Profile photo",
  hint = "Optional. Buyers see it beside your name.",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Used for the monogram fallback so the empty state is never a grey blob. */
  name: string;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("That image is very large. Choose one under 12MB.");
      return;
    }

    setBusy(true);
    const reader = new FileReader();

    reader.onerror = () => {
      setError("That file couldn't be read. Try another.");
      setBusy(false);
    };

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        setError("That file isn't an image we can read.");
        setBusy(false);
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Your browser wouldn't let us resize that image.");
          setBusy(false);
          return;
        }

        /* Centre-crop to a square, so a portrait or a landscape both give a
           face rather than a squashed one. */
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(
          img,
          (img.naturalWidth - side) / 2,
          (img.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          SIZE,
          SIZE,
        );

        onChange(canvas.toDataURL("image/jpeg", 0.82));
        setBusy(false);
      };
      img.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="text-body-sm font-medium text-fg-heading">{label}</p>
      <p className="mt-1 text-body-sm text-fg-muted">{hint}</p>

      <div className="mt-3 flex flex-wrap items-center gap-5">
        <div
          className={cn(
            "relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full",
            value ? "bg-surface-sunken" : "bg-brand text-brand-fg",
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL; see the note above
            <img
              src={value}
              alt=""
              aria-hidden="true"
              className="size-full object-cover"
            />
          ) : name.trim() ? (
            <span aria-hidden="true" className="text-h4 font-bold tracking-tight">
              {monogram(name)}
            </span>
          ) : (
            <UserRound aria-hidden="true" className="size-7 opacity-70" />
          )}

          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-navy-900/60">
              <Loader2
                aria-hidden="true"
                className="size-5 animate-spin text-white"
              />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              /* Reset so choosing the same file twice still fires. */
              e.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            size="md"
            loading={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera aria-hidden="true" className="size-4" />
            {value ? "Change photo" : "Choose a photo"}
          </Button>
          {value && (
            <Button
              variant="tertiary"
              size="md"
              onClick={() => {
                onChange(null);
                setError(null);
              }}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-body-sm text-danger-fg">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-caption text-fg-muted">
          Kept on this device only. It is resized to 256px here in your browser
          and never sent anywhere.
        </p>
      )}
    </div>
  );
}
