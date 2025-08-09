import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { defaultNamespace, getViews, hitView, keyFromSlug, applyDisplayOffset, baselineForKey } from "@/lib/viewCounter";
import { useLocation } from "react-router-dom";

interface BlogViewsProps {
  slug?: string; // optional; defaults to current path
  increment?: boolean; // increment on mount (use for post pages)
  className?: string;
}

const BlogViews = ({ slug, increment = false, className = "" }: BlogViewsProps) => {
  const location = useLocation();
  const [views, setViews] = useState<number | null>(null);

  const key = useMemo(() => keyFromSlug(slug || location.pathname), [slug, location.pathname]);
  const ns = useMemo(() => defaultNamespace(), []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const raw = increment ? await hitView(ns, key) : await getViews(ns, key);
        const display = applyDisplayOffset(key, raw);
        if (!cancelled) setViews(display);
      } catch {
        if (!cancelled) setViews(baselineForKey(key));
      }
    };
    run();
    return () => { cancelled = true; };
  }, [ns, key, increment]);

  return (
    <span className={`inline-flex items-center gap-1 text-muted-foreground ${className}`} aria-label={views !== null ? `${views} views` : "Loading views"}>
      <Eye className="w-4 h-4" aria-hidden="true" />
      <span className="tabular-nums">{views ?? "–"}</span>
      <span>views</span>
    </span>
  );
};

export default BlogViews;
