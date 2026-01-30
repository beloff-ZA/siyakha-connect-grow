import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { createCompanyAndAdmin } from "@/lib/companies";

const AdminQuickCreate: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkRole() {
      if (!user) return;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "siyakha_admin")
        .limit(1);
      if (!cancelled) {
        if (error) {
          console.error("role check error", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data && data.length > 0);
        }
      }
    }
    checkRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const handleCreate = async () => {
    try {
      setLoading(true);
      toast({ title: "Creating company…", description: "Inviting admin and assigning roles" });
      const res = await createCompanyAndAdmin({
        company_name: "SIYAKHA TECHNOLOGY",
        admin_email: "nikita@siyakhatechnology.co.za",
        make_superadmin: true,
      });
      toast({ title: "Success", description: `Company ${res.company_id} and admin ${res.admin_user_id} set up.` });
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message || "Unexpected error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border shadow-lg rounded-md p-3">
      <div className="text-sm mb-2 text-muted-foreground">Admin quick action</div>
      <Button size="sm" onClick={handleCreate} disabled={loading}>
        {loading ? "Working…" : "Create Siyakha + Admin"}
      </Button>
    </div>
  );
};

export default AdminQuickCreate;
