import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { PageHeader, Loading, ErrorNote, NoProject, EmptyState } from "@/components/portal/ui";
import { PHOTOS_BUCKET, formatDate, signedUrl } from "@/lib/portalFiles";

type Photo = {
  id: string;
  caption: string | null;
  taken_at: string | null;
  storage_path: string;
  phase_id: string | null;
};

const PortalGallery: React.FC = () => {
  const { activeProject, loading, error } = usePortal();
  const [photos, setPhotos] = useState<(Photo & { url?: string; phaseName?: string })[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    document.title = "Site Gallery | Siyakha Client Portal";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    (async () => {
      const [{ data: rows }, { data: phaseRows }] = await Promise.all([
        supabase
          .from("portal_photos")
          .select("id, caption, taken_at, storage_path, phase_id")
          .eq("project_id", activeProject.id)
          .order("taken_at", { ascending: false, nullsFirst: false }),
        supabase.from("portal_phases").select("id, name").eq("project_id", activeProject.id),
      ]);
      const phaseMap = new Map((phaseRows ?? []).map((p) => [p.id as string, p.name as string]));
      const withUrls = await Promise.all(
        ((rows ?? []) as unknown as Photo[]).map(async (p) => {
          try {
            return { ...p, url: await signedUrl(PHOTOS_BUCKET, p.storage_path, 300), phaseName: p.phase_id ? phaseMap.get(p.phase_id) : undefined };
          } catch {
            return { ...p, phaseName: p.phase_id ? phaseMap.get(p.phase_id) : undefined };
          }
        }),
      );
      if (cancelled) return;
      setPhotos(withUrls);
      setBusy(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Site records"
        title="Site gallery"
        description="Progress photography and site records, tagged by date and delivery phase."
      />

      {busy ? (
        <Loading />
      ) : photos.length === 0 ? (
        <EmptyState
          title="No site photos yet"
          description="Progress photography will be uploaded once site work begins. Nothing has been captured for this project so far."
        />
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((p) => (
            <li key={p.id} className="border border-border">
              {p.url ? (
                <img
                  src={p.url}
                  alt={p.caption ?? "Site progress photo"}
                  className="w-full h-56 object-cover grayscale"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-56 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Image unavailable
                </div>
              )}
              <div className="p-4">
                <p className="text-sm">{p.caption ?? "Untitled"}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
                  {formatDate(p.taken_at)}
                  {p.phaseName ? ` · ${p.phaseName}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PortalGallery;
