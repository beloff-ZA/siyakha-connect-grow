
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: string;
  name: string;
  billing_email?: string | null;
  phone?: string | null;
  address?: string | null;
  vat_number?: string | null;
  logo_url?: string | null;
  metadata?: any;
}


interface Membership {
  company_id: string;
  role: string;
  created_at: string;
}

export function useCompany() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        if (!cancelled) {
          setCompanies([]);
          setCompany(null);
          setLoading(false);
        }
        return;
      }

      const { data: memberships, error: memErr } = await supabase
        .from("company_members")
        .select("company_id, role, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (memErr) {
        console.error("[useCompany] memberships error:", memErr);
        if (!cancelled) setLoading(false);
        return;
      }

      const ids = (memberships || []).map((m: Membership) => m.company_id).filter(Boolean);
      if (ids.length === 0) {
        if (!cancelled) {
          setCompanies([]);
          setCompany(null);
          setLoading(false);
        }
        return;
      }

      const { data: comps, error: compErr } = await supabase
        .from("companies")
        .select("id, name, billing_email, phone, address, vat_number, logo_url, metadata")
        .in("id", ids);

      if (compErr) {
        console.error("[useCompany] companies error:", compErr);
        if (!cancelled) setLoading(false);
        return;
      }

      const all = comps || [];
      // Pick the first membership as the active company for now
      const firstId = (memberships && memberships[0]?.company_id) || all[0]?.id || null;
      const active = all.find((c) => c.id === firstId) || null;

      if (!cancelled) {
        setCompanies(all);
        setCompany(active);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { company, companies, loading };
}
