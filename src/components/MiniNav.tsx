import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const links = [
  { id: "vision", label: "Vision" },
  { id: "solutions", label: "Solutions" },
  { id: "capabilities", label: "Capabilities" },
  { id: "process", label: "Process" },
  { id: "command", label: "Command" },
  { id: "contact", label: "Contact" },
];

const citiesMenu = [
  { to: "/regional-services#angola", label: "Luanda · Angola" },
  { to: "/regional-services#zambia", label: "Lusaka · Zambia" },
  { to: "/regional-services#mozambique", label: "Maputo · Mozambique" },
  { to: "/regional-services#namibia", label: "Windhoek · Namibia" },
  { to: "/regional-services#botswana", label: "Gaborone · Botswana" },
  { to: "/regional-services#tanzania", label: "Dar es Salaam · Tanzania" },
  { to: "/regional-services#kenya", label: "Nairobi · Kenya" },
  { to: "/regional-services#drc", label: "Kinshasa · DRC" },
];

const supportMenu = [
  { to: "/regional-services", label: "Web Design" },
  { to: "/regional-services", label: "Web Development" },
  { to: "/regional-services", label: "Web Apps & SaaS" },
  { to: "/regional-services", label: "Mobile-First & PWA" },
  { to: "/regional-services", label: "Local SEO" },
  { to: "/regional-services", label: "Hosting & Security" },
];

const MiniNav = () => {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | "cities" | "support">(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const openWith = (key: "cities" | "support") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

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
      ref={navRef}
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

          {/* Cities dropdown */}
          <li
            className="flex-shrink-0 relative"
            onMouseEnter={() => openWith("cities")}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "cities" ? null : "cities")}
              aria-haspopup="true"
              aria-expanded={openMenu === "cities"}
              className="inline-flex items-center gap-1 text-[10px] md:text-[11px] uppercase tracking-[0.22em] px-3 py-2 text-foreground/60 hover:text-foreground transition-colors border-b border-transparent"
            >
              Cities <ChevronDown className="w-3 h-3" />
            </button>
            {openMenu === "cities" && (
              <div
                className="absolute left-0 top-full pt-1 min-w-[260px] z-50"
              >
                <ul className="py-2 bg-background border border-border shadow-lg">
                  {citiesMenu.map((m) => (
                    <li key={m.label}>
                      <Link
                        to={m.to}
                        onClick={() => setOpenMenu(null)}
                        className="block px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          {/* Support / Services Offered dropdown */}
          <li
            className="flex-shrink-0 relative"
            onMouseEnter={() => openWith("support")}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "support" ? null : "support")}
              aria-haspopup="true"
              aria-expanded={openMenu === "support"}
              className="inline-flex items-center gap-1 text-[10px] md:text-[11px] uppercase tracking-[0.22em] px-3 py-2 text-foreground/60 hover:text-foreground transition-colors border-b border-transparent"
            >
              Services <ChevronDown className="w-3 h-3" />
            </button>
            {openMenu === "support" && (
              <div
                className="absolute left-0 top-full pt-1 min-w-[240px] z-50"
              >
                <ul className="py-2 bg-background border border-border shadow-lg">
                  {supportMenu.map((m) => (
                    <li key={m.label}>
                      <Link
                        to={m.to}
                        onClick={() => setOpenMenu(null)}
                        className="block px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MiniNav;
