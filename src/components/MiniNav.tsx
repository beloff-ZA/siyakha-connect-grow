import { useEffect, useState } from "react";

const links = [
  { id: "vision", label: "Vision" },
  { id: "solutions", label: "Solutions" },
  { id: "capabilities", label: "Capabilities" },
  { id: "process", label: "Process" },
  { id: "command", label: "Command" },
  { id: "cities", label: "Cities" },
  { id: "contact", label: "Contact" },
];

const MiniNav = () => {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className={`sticky top-20 md:top-28 z-40 border-b border-border bg-background/80 backdrop-blur-md transition-opacity duration-300 ${
        scrolled ? "opacity-100" : "opacity-95"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-10">
        <ul className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar h-11 md:h-12">
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <li key={l.id} className="flex-shrink-0">
                <a
                  href={`#${l.id}`}
                  onClick={(e) => handleClick(e, l.id)}
                  className={`inline-flex items-center text-[10px] md:text-[11px] uppercase tracking-[0.22em] px-3 py-2 transition-colors border-b ${
                    isActive
                      ? "text-foreground border-foreground"
                      : "text-foreground/60 hover:text-foreground border-transparent"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default MiniNav;
