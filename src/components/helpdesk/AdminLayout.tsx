import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { adminDisplayName, adminIdentityLabel } from "@/lib/adminIdentity";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, LogOut, Menu, X, ChevronRight, BookOpen, CalendarDays,
  Briefcase, Sparkles, DollarSign, FolderKanban, Users, Inbox,
  StickyNote, Rocket, Activity, Building2, Truck, Wifi, Phone, Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navSections = [
  {
    label: "Operations",
    items: [
      { label: "Command Centre", icon: LayoutDashboard, path: "/helpdesk" },
      { label: "Inbox", icon: Inbox, path: "/helpdesk/inbox" },
      { label: "AI PA", icon: Sparkles, path: "/helpdesk/ai-pa" },
      { label: "Calendar", icon: CalendarDays, path: "/helpdesk/calendar" },
      { label: "Notes", icon: StickyNote, path: "/helpdesk/notes" },
      { label: "Diary", icon: BookOpen, path: "/helpdesk/diary" },
    ],
  },
  {
    label: "Planning",
    items: [
      { label: "Project Management", icon: Briefcase, path: "/helpdesk/project-management" },
      { label: "Projects", icon: FolderKanban, path: "/helpdesk/projects" },
      { label: "Future Projects", icon: Rocket, path: "/helpdesk/future-projects" },
      { label: "Site Performance", icon: Activity, path: "/helpdesk/site-performance" },
      { label: "Costs", icon: DollarSign, path: "/helpdesk/costs" },
      { label: "Leads", icon: Users, path: "/helpdesk/leads" },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Customers", icon: Building2, path: "/helpdesk/customers" },
      { label: "Client Portal", icon: Users, path: "/helpdesk/client-portal" },
      { label: "Suppliers", icon: Truck, path: "/helpdesk/suppliers" },
      { label: "Internet Providers", icon: Wifi, path: "/helpdesk/internet-providers" },
      { label: "VoIP Providers", icon: Phone, path: "/helpdesk/voip-providers" },
      { label: "Packages", icon: Package, path: "/helpdesk/packages" },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-56 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 md:relative md:translate-x-0 border-r border-sidebar-border",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link to="/helpdesk" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Director
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={section.label}>
              {idx > 0 && <Separator className="my-2 bg-sidebar-border" />}
              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">{section.label}</p>
              {section.items.map((item) => {
                const active = pathname === item.path || (item.path !== "/helpdesk" && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="min-w-0">
            <p className="text-sm text-sidebar-foreground truncate">{adminIdentityLabel(user)}</p>
            {adminDisplayName(user) && (
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                ← Website
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b px-4 py-3 flex items-center gap-3 md:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground truncate">
            {allNavItems.find(n => pathname === n.path || (n.path !== "/helpdesk" && pathname.startsWith(n.path)))?.label || "Director PA"}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
