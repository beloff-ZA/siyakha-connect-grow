import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "siyakha_admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading || (user && isAdmin === null)) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;
