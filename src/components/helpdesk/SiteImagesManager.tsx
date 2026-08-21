import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  SITE_IMAGES_BUCKET,
  loadSiteImages,
  siteImageStoragePath,
  type SiteImageWithUrl,
} from "@/lib/siteImages";

const inputCls = "h-9";

const SiteImagesManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { toast } = useToast();
  const [images, setImages] = useState<SiteImageWithUrl[]>([]);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState({
    title: "",
    caption: "",
    area: "",
    category: "Existing Conditions",
    captured_on: new Date().toISOString().slice(0, 10),
  });

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive" as never,
    });

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setImages(await loadSiteImages(projectId));
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const path = siteImageStoragePath(projectId, meta.captured_on, file.name);
      const { error: upErr } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
      if (upErr) throw upErr;

      const nextOrder = images.reduce((m, i) => Math.max(m, i.sort_order), 0) + 1;
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("portal_site_images").upsert(
        {
          project_id: projectId,
          storage_path: path,
          original_filename: file.name,
          title: meta.title || file.name.replace(/\.[^.]+$/, ""),
          caption: meta.caption || null,
          area: meta.area || null,
          category: meta.category || "Existing Conditions",
          captured_on: meta.captured_on || null,
          sort_order: nextOrder,
          uploaded_by: auth.user?.id ?? null,
        },
        { onConflict: "project_id,original_filename" },
      );
      if (error) throw error;
      setMeta({ ...meta, title: "", caption: "" });
      toast({ title: "Site image uploaded" });
      await load();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, values: Record<string, unknown>) => {
    try {
      const { error } = await supabase.from("portal_site_images").update(values).eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) {
      fail(e);
    }
  };

  const move = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const a = images[index];
    const b = images[target];
    try {
      const r1 = await supabase.from("portal_site_images").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (r1.error) throw r1.error;
      const r2 = await supabase.from("portal_site_images").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (r2.error) throw r2.error;
      await load();
    } catch (e) {
      fail(e);
    }
  };

  const remove = async (img: SiteImageWithUrl) => {
    if (!window.confirm(`Delete "${img.title}"? The stored image file will also be removed.`)) return;
    try {
      const { error } = await supabase.from("portal_site_images").delete().eq("id", img.id);
      if (error) throw error;
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([img.storage_path]);
      toast({ title: "Site image deleted" });
      await load();
    } catch (e) {
      fail(e);
    }
  };

  if (!projectId) return <p className="text-sm text-muted-foreground">Select a project above.</p>;

  return (
    <div>
      <section className="border border-border p-5 md:p-6 mb-6">
        <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">
          Upload site image — {images.length} on record
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input className={inputCls} placeholder="Title" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
          <Input className={inputCls} placeholder="Area" value={meta.area} onChange={(e) => setMeta({ ...meta, area: e.target.value })} />
          <Input className={inputCls} placeholder="Category" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} />
          <Input className={inputCls} type="date" aria-label="Captured on" value={meta.captured_on} onChange={(e) => setMeta({ ...meta, captured_on: e.target.value })} />
          <div className="sm:col-span-2">
            <Input className={inputCls} placeholder="Caption shown to the client" value={meta.caption} onChange={(e) => setMeta({ ...meta, caption: e.target.value })} />
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="site-image-file" className="text-xs">Image file</Label>
          <input
            id="site-image-file"
            type="file"
            accept="image/*"
            disabled={busy}
            className="block mt-1 text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <ul className="grid md:grid-cols-2 gap-4">
        {images.map((img, i) => (
          <li key={img.id} className="border border-border p-4">
            <div className="flex gap-4">
              {img.url ? (
                <img src={img.url} alt={img.title} className="h-24 w-24 object-cover border border-border" />
              ) : (
                <div className="h-24 w-24 border border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground text-center">
                  No preview
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <Input className={inputCls} defaultValue={img.title} onBlur={(e) => e.target.value !== img.title && patch(img.id, { title: e.target.value })} aria-label="Title" />
                <Input className={inputCls} defaultValue={img.caption ?? ""} placeholder="Caption" onBlur={(e) => e.target.value !== (img.caption ?? "") && patch(img.id, { caption: e.target.value || null })} aria-label="Caption" />
                <div className="grid grid-cols-3 gap-2">
                  <Input className={inputCls} defaultValue={img.area ?? ""} placeholder="Area" onBlur={(e) => e.target.value !== (img.area ?? "") && patch(img.id, { area: e.target.value || null })} aria-label="Area" />
                  <Input className={inputCls} defaultValue={img.category} placeholder="Category" onBlur={(e) => e.target.value !== img.category && patch(img.id, { category: e.target.value })} aria-label="Category" />
                  <Input className={inputCls} type="date" defaultValue={img.captured_on ?? ""} onBlur={(e) => e.target.value !== (img.captured_on ?? "") && patch(img.id, { captured_on: e.target.value || null })} aria-label="Captured on" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => move(i, -1)} disabled={i === 0}>Up</Button>
              <Button size="sm" variant="outline" onClick={() => move(i, 1)} disabled={i === images.length - 1}>Down</Button>
              <Button size="sm" variant="outline" onClick={() => patch(img.id, { client_visible: !img.client_visible })}>
                {img.client_visible ? "Visible to client" : "Hidden from client"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(img)}>Delete</Button>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-auto">{img.original_filename}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SiteImagesManager;
