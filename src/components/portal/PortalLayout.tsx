import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Camera, FileText, Calculator, Layers, LogOut, Menu, X } from "lucide-react";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import { useAuth } from "@/contexts/AuthContext";
import { usePortal } from "@/hooks/usePortal";

// Primary navigation only. Tracker, building view, registers, gallery, updates,
// support, onboarding and profile routes remain intact and reachable by URL.
const nav = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/portal/floor-plans", label: "Plans", icon: Layers },
  { to: "/portal/boq", label: "BOQ", icon: Calculator },
  { to: "/portal/documents", label: "Documents", icon: FileText },
  { to: "/portal/site-images", label: "Site images", icon: Camera },
];



const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const {
    client,
    clientUser,
    sites,
    activeSiteId,
    setActiveSiteId,
    projects,
    activeProjectId,
    setActiveProjectId,
    loading,
  } = usePortal();
  const [open, setOpen] = useState(false);
  const siteProjects = projects.filter((p) => !activeSiteId || !p.site_id || p.site_id === activeSiteId);


  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] border-l-2 transition-colors",
      isActive
        ? "border-foreground text-foreground bg-muted"
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60",
    ].join(" ");

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile bar */}
      <div className="lg:hidden flex items-center justify-between border-b border-border px-5 h-16 sticky top-0 bg-background/95 backdrop-blur z-40">
        <Link to="/portal" className="flex items-center gap-3">
          <img src={siyakhaWordmark} alt="Siyakha Interlink" className="h-6 w-auto" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Portal</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close portal menu" : "Open portal menu"}
          aria-expanded={open}
          className="border border-border p-2 hover:bg-muted transition-colors"
        >
          {open ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Menu className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={[
          "lg:w-72 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border lg:min-h-screen print:hidden",
          open ? "block" : "hidden lg:block",
        ].join(" ")}
      >
        <div className="lg:sticky lg:top-0 flex flex-col lg:h-screen">
          <div className="hidden lg:block px-6 py-8 border-b border-border">
            <Link to="/" className="block">
              <img src={siyakhaWordmark} alt="Siyakha Interlink" className="h-7 w-auto" />
            </Link>
            <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Client Portal
            </p>
          </div>

          <div className="px-6 py-5 border-b border-border">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-1">Client</p>
            <p className="font-display text-lg font-light tracking-tight">
              {loading ? "…" : client?.display_name ?? "Siyakha client"}
            </p>
            {clientUser?.full_name && (
              <p className="text-xs text-muted-foreground mt-1">{clientUser.full_name}</p>
            )}
          </div>

          {sites.length > 1 && (
            <div className="px-6 py-5 border-b border-border">
              <label
                htmlFor="portal-site-select"
                className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2"
              >
                Site
              </label>
              <select
                id="portal-site-select"
                value={activeSiteId ?? ""}
                onChange={(e) => setActiveSiteId(e.target.value)}
                className="w-full border border-border bg-background text-sm px-3 py-2"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {siteProjects.length > 1 && (
            <div className="px-6 py-5 border-b border-border">
              <label
                htmlFor="portal-project-select"
                className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2"
              >
                Project
              </label>
              <select
                id="portal-project-select"
                value={activeProjectId ?? ""}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="w-full border border-border bg-background text-sm px-3 py-2"
              >
                {siteProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}


          <nav className="py-4 flex-1 overflow-y-auto" aria-label="Client portal">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkCls} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="px-6 py-6 border-t border-border space-y-3">
            <Link
              to="/"
              className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Siyakha website
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-5 md:px-10 py-8 md:py-12">{children}</main>
    </div>
  );
};

export default PortalLayout;
