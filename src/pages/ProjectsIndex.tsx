import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import heroImage from "@/assets/hero-bg.jpg";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const ProjectsIndex = () => {
  useEffect(() => {
    const title = "Projects | Siyakha Technology Solutions — IT Company Johannesburg, Sandton MSP";
    const description = "Projects by Siyakha: IT company in Johannesburg (Sandton MSP). Networking, CCTV, cloud, school IT support and more.";
    document.title = title;

    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/projects`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/projects`);
  }, []);

  const gallery = [
    { src: "/lovable-uploads/d0d561bc-eb6e-4495-86ed-ef27147f2ba7.png", alt: "School computer lab deployment with desktop PCs and headsets" },
    { src: "/lovable-uploads/7ece805f-8460-412e-940f-6dcd049dae2d.png", alt: "Retail POS network with payment terminals and barcode scanners" },
    { src: "/lovable-uploads/bdeb1ff0-b433-4f7e-81e4-74b548b53871.png", alt: "Desktop rollout staging area with HP desktops prepared for deployment" },
    { src: "/lovable-uploads/20b05504-4a1c-4678-b6ab-6a94216b63de.png", alt: "Interactive classroom display installation by Siyakha" },
    { src: "/lovable-uploads/9608ab6f-4906-42bb-9c2d-29ed733d19bb.png", alt: "Taxi fleet technology setup with in-vehicle display and connectivity" },
    { src: "/lovable-uploads/802e7b64-5c69-4376-a3d3-33b379205fb4.png", alt: "Structured cabling patch panels with neatly dressed blue Cat6 leads" },
    { src: "/lovable-uploads/33161a8a-1aec-45a5-8a2b-a26ec1af6c80.png", alt: "Data center network configuration session in server room" },
    { src: "/lovable-uploads/f409af22-ace0-4220-9a51-a600a978c3e3.png", alt: "Student classroom infrastructure build — server and switch network cleanup with new cabinet" },
    { src: "/lovable-uploads/6c70ec7d-f786-4aee-8762-c5d34b30c103.png", alt: "Industrial control room multi-screen operations center" },
    { src: "/lovable-uploads/4c8f615b-1c86-4be3-a8e4-17cd204ec541.png", alt: "Netgear switch cabinet with organized Cat6a patching" },
  ];

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={"/src/assets/hero-bg.jpg"} alt="Showcase of successful ICT projects" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Our Projects</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">A selection of recent deployments and case studies.</p>
          </div>
        </section>
        <Projects />
        <section className="py-16 bg-background border-t border-border" aria-label="Project Gallery">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">Project Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setLightbox(img)}
                  className="relative group focus:outline-none"
                  aria-label={`Open image: ${img.alt}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-40 object-cover rounded-lg border border-border cursor-zoom-in"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
        <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
          <DialogContent className="max-w-5xl w-[92vw] p-0">
            {lightbox && (
              <div className="p-2">
                <img src={lightbox.src} alt={lightbox.alt} className="max-h-[85vh] w-full object-contain" loading="eager" />
                <p className="text-sm text-muted-foreground mt-2 px-2">{lightbox.alt}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsIndex;
