import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { attachmentLink, removeAttachment, uploadAttachment, listAttachments } from "@/lib/loggedCalls";
import { useToast } from "@/hooks/use-toast";
import type { SurveyPhoto } from "@/lib/siteSurvey";

type Props = {
  callId: string;
  /** Survey line this photo belongs to, used as the file label. */
  item: string;
  value: SurveyPhoto;
  onChange: (next: SurveyPhoto) => void;
};

/** Take or choose one photo for a single survey line. */
const SurveyPhotoField: React.FC<Props> = ({ callId, item, value, onChange }) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    if (!value.photo_path) {
      setPreview(null);
      return;
    }
    attachmentLink(value.photo_path)
      .then((url) => live && setPreview(url))
      .catch(() => live && setPreview(null));
    return () => {
      live = false;
    };
  }, [value.photo_path]);

  const pick = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const att = await uploadAttachment(callId, file, `Survey photo — ${item}`);
      onChange({ photo_path: att.storage_path, photo_name: att.file_name });
      toast({ title: "Photo added", description: item });
    } catch (e: unknown) {
      toast({ title: "Could not add the photo", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clear = async () => {
    const path = value.photo_path;
    onChange({ photo_path: "", photo_name: "" });
    if (!path) return;
    try {
      const att = (await listAttachments(callId)).find((a) => a.storage_path === path);
      if (att) await removeAttachment(att);
    } catch {
      /* the line is already cleared; leaving a stray file is harmless */
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {preview && (
        <a href={preview} target="_blank" rel="noreferrer" className="block">
          <img src={preview} alt={`Photo for ${item}`} className="max-h-28 rounded-md border border-border" />
        </a>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Camera className="h-4 w-4 mr-1" />}
          {value.photo_path ? "Replace photo" : "Add photo"}
        </Button>
        {value.photo_path && (
          <>
            <span className="text-xs text-muted-foreground break-all">{value.photo_name}</span>
            <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyPhotoField;
