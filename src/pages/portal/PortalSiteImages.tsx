import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePortal } from "@/hooks/usePortal";
import { PageHeader, Loading, ErrorNote, NoProject, EmptyState } from "@/components/portal/ui";
import { formatDate } from "@/lib/portalFiles";
import { loadSiteImages, uniqueValues, type SiteImageWithUrl } from "@/lib/siteImages";

const chip = (active: boolean) =>
  [
    "border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors",
    active
      ? "border-foreground text-foreground bg-muted"
      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60",
  ].join(" ");

const PortalSiteImages: React.FC = () => {
  const { activeProject, loading, error } = usePortal();
  const [images, setImages] = useState<SiteImageWithUrl[]>([]);
  const [busy, setBusy] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [area, setArea] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Site Images | Siyakha Client Portal";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    setLoadError(null);
    loadSiteImages(activeProject.id)
      .then((rows) => {
        if (!cancelled) setImages(rows);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  const categories = useMemo(() => uniqueValues(images.map((i) => i.category)), [images]);
  const areas = useMemo(() => uniqueValues(images.map((i) => i.area)), [images]);

  const filtered = useMemo(
    () =>
      images.filter(
        (i) => (category === "all" || i.category === category) && (area === "all" || i.area === area),
      ),
    [images, category, area],
  );

  const capturedOn = images.find((i) => i.captured_on)?.captured_on ?? null;
  const active = openIndex !== null ? filtered[openIndex] : null;

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => {
        if (i === null || filtered.length === 0) return i;
        return (i + delta + filtered.length) % filtered.length;
      });
    },
    [filtered.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, step]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Site Survey – Existing Conditions"
        title="Site images"
        description="Photographic record of the building's existing condition, captured during the site survey walkthrough."
      />

      <div className="border border-border p-5 md:p-6 mb-8 grid sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Album</p>
          <p className="text-sm mt-1">Site Survey – Existing Conditions</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Captured</p>
          <p className="text-sm mt-1">{capturedOn ? formatDate(capturedOn) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Photographs</p>
          <p className="text-sm mt-1">{images.length}</p>
        </div>
      </div>

      {loadError && <ErrorNote message={loadError} />}

      {busy ? (
        <Loading />
      ) : images.length === 0 ? (
        <EmptyState
          title="No site images yet"
          description="Survey and progress photography will appear here once it has been captured and released for this project."
        />
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                <button type="button" className={chip(category === "all")} onClick={() => setCategory("all")}>
                  All categories
                </button>
                {categories.map((c) => (
                  <button key={c} type="button" className={chip(category === c)} onClick={() => setCategory(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            {areas.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by area">
                <button type="button" className={chip(area === "all")} onClick={() => setArea("all")}>
                  All areas
                </button>
                {areas.map((a) => (
                  <button key={a} type="button" className={chip(area === a)} onClick={() => setArea(a)}>
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((img, i) => (
              <li key={img.id} className="border border-border flex flex-col">
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className="block w-full text-left"
                  aria-label={`Open ${img.title}`}
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.caption ?? img.title}
                      loading="lazy"
                      className="w-full h-60 object-cover grayscale hover:grayscale-0 transition-[filter] duration-500"
                    />
                  ) : (
                    <div className="w-full h-60 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      Image unavailable
                    </div>
                  )}
                </button>
                <div className="p-4 flex-1">
                  <p className="text-sm">{img.title}</p>
                  {img.area && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2">{img.area}</p>
                  )}
                  {img.caption && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{img.caption}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {openIndex !== null ? openIndex + 1 : 0} / {filtered.length}
            </p>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close image"
              className="border border-border p-2 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center px-3 py-4">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="hidden sm:flex border border-border p-2 mr-4 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            {active.url ? (
              <img
                src={active.url}
                alt={active.caption ?? active.title}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Image unavailable</p>
            )}
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="hidden sm:flex border border-border p-2 ml-4 hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="border-t border-border px-5 py-4">
            <p className="text-sm">{active.title}</p>
            {active.caption && <p className="text-xs text-muted-foreground mt-2">{active.caption}</p>}
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
              {[active.area, active.category, formatDate(active.captured_on)].filter(Boolean).join(" · ")}
            </p>
            <div className="flex sm:hidden gap-3 mt-4">
              <button type="button" onClick={() => step(-1)} className="flex-1 border border-border py-2 text-[10px] uppercase tracking-[0.2em]">
                Previous
              </button>
              <button type="button" onClick={() => step(1)} className="flex-1 border border-border py-2 text-[10px] uppercase tracking-[0.2em]">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalSiteImages;
