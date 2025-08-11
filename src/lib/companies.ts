import { supabase } from "@/integrations/supabase/client";

export interface CreateCompanyAdminParams {
  company_name: string;
  admin_email: string;
  billing_email?: string | null;
  phone?: string | null;
  address?: string | null;
  vat_number?: string | null;
  company_type?: string | null;
  make_superadmin?: boolean; // default true
}

export async function createCompanyAndAdmin(params: CreateCompanyAdminParams) {
  const { data, error } = await supabase.functions.invoke("create-company-admin", {
    body: params,
  });

  if (error) throw error;
  return data as { success: boolean; company_id: string; admin_user_id: string };
}
