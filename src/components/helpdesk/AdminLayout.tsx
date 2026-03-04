import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Ticket, Users, UserPlus, Mail, Wrench,
  LogOut, Menu, X, ChevronRight, BookOpen, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/helpdesk" },
  { label: "Diary", icon: BookOpen, path: "/helpdesk/diary" },
  { label: "Calendar", icon: CalendarDays, path: "/helpdesk/calendar" },
  { label: "Tickets", icon: Ticket, path: "/helpdesk/tickets" },
  { label: "Clients", icon: Users, path: "/helpdesk/clients" },
  { label: "Leads", icon: UserPlus, path: "/helpdesk/leads" },
  { label: "Technicians", icon: Wrench, path: "/helpdesk/technicians" },
  { label: "Campaigns", icon: Mail, path: "/helpdesk/campaigns" },
];

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
          <Link to="/helpdesk" className="font-bold text-lg tracking-tight">Director PA & Diary</Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.path || (item.path !== "/helpdesk" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
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
        </nav>

        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <p className="text-xs text-primary-foreground/50 truncate">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4 mr-2" />Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b px-4 py-3 flex items-center gap-3 md:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground truncate">
            {navItems.find(n => pathname === n.path || (n.path !== "/helpdesk" && pathname.startsWith(n.path)))?.label || "Director PA"}
          </h2>
          <Link to="/" className="ml-auto text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
