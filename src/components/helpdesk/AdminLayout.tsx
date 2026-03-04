import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Ticket, Users, UserPlus, Mail, Wrench,
  LogOut, Menu, X, ChevronRight, BookOpen, CalendarDays, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Command Centre", icon: LayoutDashboard, path: "/helpdesk" },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Diary", icon: BookOpen, path: "/helpdesk/diary" },
      { label: "Calendar", icon: CalendarDays, path: "/helpdesk/calendar" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Support Tickets", icon: Ticket, path: "/helpdesk/tickets" },
      { label: "Technicians", icon: Wrench, path: "/helpdesk/technicians" },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Clients", icon: Users, path: "/helpdesk/clients" },
      { label: "Leads & Pipeline", icon: UserPlus, path: "/helpdesk/leads" },
      { label: "Campaigns", icon: Mail, path: "/helpdesk/campaigns" },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

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
    <div className="flex h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground flex flex-col transition-transform duration-200 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/10">
          <Link to="/helpdesk" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Director PA
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider text-primary-foreground/40 font-semibold">
                {group.label}
              </p>
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const active = pathname === item.path || (item.path !== "/helpdesk" && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-foreground/15 text-primary-foreground"
                          : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                      {active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <p className="text-xs text-primary-foreground/50 truncate">{user?.email}</p>
          <div className="flex gap-2">
            <Link to="/" className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                ← Website
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b px-4 py-3 flex items-center gap-3 md:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground truncate">
            {allItems.find(n => pathname === n.path || (n.path !== "/helpdesk" && pathname.startsWith(n.path)))?.label || "Director PA"}
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
