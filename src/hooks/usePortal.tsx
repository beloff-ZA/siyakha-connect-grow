import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PortalClient = {
  id: string;
  display_name: string;
  contact_name: string | null;
  contact_email: string | null;
  phone: string | null;
  status: string;
};

export type PortalClientUser = {
  id: string;
  client_id: string;
  email: string;
  full_name: string | null;
  portal_role: string;
  status: string;
};

export type PortalSite = {
  id: string;
  client_id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  venue_type: string | null;
  status: string;
  budget_reference: number | null;
  budget_currency: string | null;
  budget_includes_vat: boolean | null;
  budget_client_visible: boolean | null;
  notes: string | null;
};

export type PortalProject = {
  id: string;
  client_id: string;
  site_id: string | null;
  title: string;
  status: string;
  address: string | null;
  reference: string | null;
  consultant: string | null;
  description: string | null;
  site_context: string | null;
  objectives: string | null;
  stakeholders: string | null;
  risks_notes: string | null;
  planning_narrative: string | null;
  start_date: string | null;
  target_date: string | null;
  updated_at: string;
};

type PortalContextValue = {
  loading: boolean;
  error: string | null;
  clientUser: PortalClientUser | null;
  client: PortalClient | null;
  sites: PortalSite[];
  activeSite: PortalSite | null;
  activeSiteId: string | null;
  setActiveSiteId: (id: string) => void;
  projects: PortalProject[];
  activeProject: PortalProject | null;
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  refresh: () => void;
};

const PortalContext = createContext<PortalContextValue | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientUser, setClientUser] = useState<PortalClientUser | null>(null);
  const [client, setClient] = useState<PortalClient | null>(null);
  const [sites, setSites] = useState<PortalSite[]>([]);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    (async () => {
      const { data: cuRows, error: cuErr } = await supabase
        .from("portal_client_users")
        .select("id, client_id, email, full_name, portal_role, status")
        .limit(1);

      if (cancelled) return;
      if (cuErr) {
        setError(cuErr.message);
        setLoading(false);
        return;
      }

      const cu = (cuRows?.[0] as PortalClientUser | undefined) ?? null;
      setClientUser(cu);

      if (cu) {
        const { data: clientRow } = await supabase
          .from("portal_clients")
          .select("id, display_name, contact_name, contact_email, phone, status")
          .eq("id", cu.client_id)
          .maybeSingle();
        if (!cancelled) setClient((clientRow as PortalClient | null) ?? null);
      }

      const { data: projectRows, error: pErr } = await supabase
        .from("portal_projects")
        .select("*")
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (pErr) setError(pErr.message);

      const list = (projectRows ?? []) as unknown as PortalProject[];
      setProjects(list);
      setActiveProjectId((prev) => prev ?? list[0]?.id ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, tick]);

  const value = useMemo<PortalContextValue>(
    () => ({
      loading,
      error,
      clientUser,
      client,
      projects,
      activeProjectId,
      activeProject: projects.find((p) => p.id === activeProjectId) ?? null,
      setActiveProjectId,
      refresh,
    }),
    [loading, error, clientUser, client, projects, activeProjectId, refresh],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};

export const usePortal = () => {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
};

export const statusLabel = (status?: string | null) =>
  !status ? "—" : status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
