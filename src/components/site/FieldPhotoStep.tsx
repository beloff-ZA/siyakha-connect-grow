import React, { useRef } from "react";
import { Camera, Images, RotateCcw, Trash2 } from "lucide-react";
import type { DraftPhoto } from "@/lib/siteDeliveryClient";
import type { PhotoCategory } from "@/lib/siteDelivery";

/** Simple photo buttons for the phone form: take, add, tag, remove. */
const SIMPLE_CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: "before", label: "Before" },
  { value: "during", label: "Work" },
  { value: "after", label: "After" },
  { value: "issue", label: "Problem" },
];

const bigBtn =
  "flex min-h-[60px] flex-1 items-center justify-center gap-2 border-2 border-foreground text-base font-semibold";

const FieldPhotoStep: React.FC<{
  photos: DraftPhoto[];
  timestampUsed: boolean;
  onTimestampUsed: (value: boolean) => void;
  onPick: (files: FileList | null) => void;
  onSetCategory: (localId: string, category: PhotoCategory) => void;
  onSetTitle: (localId: string, title: string) => void;
  onSetCaption: (localId: string, caption: string) => void;
  onRemove: (localId: string) => void;
  onRetry: (localId: string) => void;
}> = ({ photos, timestampUsed, onTimestampUsed, onPick, onSetCategory, onSetTitle, onSetCaption, onRemove, onRetry }) => {
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <p className="border-2 border-foreground bg-foreground p-4 text-base font-semibold text-background">
        Client needs photos every day. Take photos with the Timestamp App, then add them here.
      </p>

      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={library}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex gap-3">
        <button type="button" className={bigBtn} onClick={() => camera.current?.click()}>
          <Camera className="h-6 w-6" aria-hidden /> TAKE
        </button>
        <button type="button" className={bigBtn} onClick={() => library.current?.click()}>
          <Images className="h-6 w-6" aria-hidden /> ADD PHOTOS
        </button>
      </div>

      <label className="flex min-h-[56px] items-center gap-3 border-2 border-border p-3 text-base">
        <input type="checkbox" className="h-6 w-6" checked={timestampUsed} onChange={(e) => onTimestampUsed(e.target.checked)} />
        <span>I used Timestamp App</span>
      </label>

      {photos.length ? (
        <div className="space-y-4">
          {photos.map((p) => (
            <div key={p.localId} className="border-2 border-border p-2">
              {p.previewUrl && <img src={p.previewUrl} alt="Site photo" className="h-56 w-full object-cover" />}
              <p className="mt-2 text-sm">
                {p.status === "uploading" && "Loading…"}
                {p.status === "ready" && "Saved"}
                {p.status === "failed" && (p.errorMessage ?? "Did not load")}
              </p>
              <label className="mt-2 block text-sm font-semibold">
                Photo name
                <input
                  value={p.title}
                  onChange={(e) => onSetTitle(p.localId, e.target.value)}
                  placeholder="Example: Fifth floor pipe"
                  className="mt-1 min-h-[52px] w-full border-2 border-border px-3 text-base"
                />
              </label>
              <label className="mt-2 block text-sm">
                More about the photo (not needed)
                <input
                  value={p.caption}
                  onChange={(e) => onSetCaption(p.localId, e.target.value)}
                  className="mt-1 min-h-[52px] w-full border-2 border-border px-3 text-base"
                />
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SIMPLE_CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onSetCategory(p.localId, c.value)}
                    className={`min-h-[48px] border-2 text-sm ${
                      p.category === c.value ? "border-foreground bg-foreground text-background" : "border-border"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                {p.status === "failed" && (
                  <button
                    type="button"
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-2 border-2 border-foreground text-sm"
                    onClick={() => onRetry(p.localId)}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden /> Try again
                  </button>
                )}
                <button
                  type="button"
                  className="flex min-h-[48px] flex-1 items-center justify-center gap-2 border-2 border-border text-sm"
                  onClick={() => onRemove(p.localId)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-base text-muted-foreground">No photos yet.</p>
      )}
    </div>
  );
};

export default FieldPhotoStep;
