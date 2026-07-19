import { useState } from "react";
import { Instagram } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { galleryImages, type GalleryImage } from "@/content/galleryImages";

type Props = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  limit?: number;
};

const InstagramGallery = ({
  eyebrow = "From The Field",
  title = "Work in progress",
  intro = "Real installs, real racks, real sites — a look at what we ship for clients across South Africa.",
  limit,
}: Props) => {
  const [active, setActive] = useState<GalleryImage | null>(null);
  const items = limit ? galleryImages.slice(0, limit) : galleryImages;

  return (
    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">{eyebrow}</p>
            <h2 className="font-display font-light text-3xl md:text-4xl tracking-[-0.02em] leading-[1.05] text-foreground">
              {title}
            </h2>
            <p className="mt-4 text-sm md:text-base text-foreground/70 leading-relaxed">{intro}</p>
          </div>
          <a
            href="https://www.instagram.com/siyakhatech/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/80 hover:text-foreground border border-foreground/25 hover:border-foreground px-4 py-2.5 transition-colors self-start"
          >
            <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} />
            @siyakhatech
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-foreground/15 border border-foreground/15">
          {items.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(img)}
              className="group relative bg-background aspect-square overflow-hidden text-left"
              aria-label={`Open ${img.caption}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover grayscale contrast-[1.02] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white">{img.caption}</p>
                {img.location && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mt-0.5">{img.location}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-4xl bg-background border-foreground/20 p-0 overflow-hidden">
          {active && (
            <div>
              <img src={active.src} alt={active.alt} className="w-full h-auto max-h-[80vh] object-contain grayscale bg-black" />
              <div className="px-6 py-4 border-t border-foreground/10">
                <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/80">{active.caption}</p>
                {active.location && (
                  <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/55 mt-1">{active.location}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InstagramGallery;