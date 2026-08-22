import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/lib/deals";
import type { Proposal } from "@/lib/proposals";

const db = supabase as unknown as { from: (t: string) => any };

export type PmClient = {
  id: string;
  display_name: string;
  contact_name: string | null;
  contact_email: string | null;
  phone: string | null;
  status: string | null;
  notes: string | null;
};

export type PmSite = {
  id: string;
  client_id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  venue_type: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string | null;
  archived_at: string | null;
};

export type PmProject = {
  id: string;
  client_id: string | null;
  site_id: string | null;
  title: string;
  status: string | null;
  reference: string | null;
  address: string | null;
  consultant: string | null;
  description: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
};

export type PmBoq = {
  id: string;
  project_id: string;
  title: string;
  revision_label: string;
  version_no: number;
  status: string;
  vat_enabled: boolean;
  vat_rate: number;
  updated_at: string;
};

export type PmClientUser = { id: string; client_id: string; email: string; full_name: string | null; status: string | null };

export function usePmWorkspace() {
  const [clients, setClients] = useState<PmClient[]>([]);
  const [sites, setSites] = useState<PmSite[]>([]);
  const [projects, setProjects] = useState<PmProject[]>([]);
  const [boqs, setBoqs] = useState<PmBoq[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clientUsers, setClientUsers] = useState<PmClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [c, s, p, b, d, pr, cu] = await Promise.all([
      db.from("portal_clients").select("*").order("display_name"),
      db.from("portal_sites").select("*").order("name"),
      db.from("portal_projects").select("*").order("created_at", { ascending: false }),
      db.from("portal_boqs").select("id, project_id, title, revision_label, version_no, status, vat_enabled, vat_rate, updated_at").order("updated_at", { ascending: false }),
      db.from("director_projects").select("*").order("created_at", { ascending: false }),
      db.from("portal_proposals").select("*").order("created_at", { ascending: false }),
      db.from("portal_client_users").select("id, client_id, email, full_name, status"),
    ]);
    const firstError = [c, s, p, b, d, pr, cu].find((r: any) => r.error)?.error;
    if (firstError) setError(firstError.message);
    setClients((c.data ?? []) as PmClient[]);
    setSites((s.data ?? []) as PmSite[]);
    setProjects((p.data ?? []) as PmProject[]);
    setBoqs((b.data ?? []) as PmBoq[]);
    setDeals((d.data ?? []) as Deal[]);
    setProposals((pr.data ?? []) as Proposal[]);
    setClientUsers((cu.data ?? []) as PmClientUser[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { clients, sites, projects, boqs, deals, proposals, clientUsers, loading, error, reload };
}

export type PmWorkspace = ReturnType<typeof usePmWorkspace>;
