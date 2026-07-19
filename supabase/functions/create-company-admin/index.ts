import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  company_name: string;
  admin_email: string;
  billing_email?: string | null;
  phone?: string | null;
  address?: string | null;
  vat_number?: string | null;
  company_type?: string | null;
  make_superadmin?: boolean; // default true
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const {
      company_name,
      admin_email,
      billing_email = null,
      phone = null,
      address = null,
      vat_number = null,
      company_type = null,
      make_superadmin = true,
    } = body || ({} as RequestBody);

    if (!company_name || !admin_email) {
      return new Response(
        JSON.stringify({ error: "Missing company_name or admin_email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller client (uses the user's JWT for auth/identity)
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Admin client (service role)
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Ensure the caller is authenticated
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Require caller to already be a global siyakha_admin.
    // The historical "bootstrap when no admin exists" path was removed because
    // it let any signed-up user seize admin control. Seed the first admin
    // directly in the database (INSERT INTO user_roles ...).
    const { data: adminRow, error: roleErr } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("role", "siyakha_admin")
      .maybeSingle();

    if (roleErr) {
      console.error("Role check error", roleErr);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!adminRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1) Create or find the company by name (case-insensitive)
    const { data: existingCompanies, error: findCompanyErr } = await admin
      .from("companies")
      .select("id")
      .ilike("name", company_name)
      .limit(1);

    if (findCompanyErr) {
      console.error("Find company error", findCompanyErr);
      return new Response(JSON.stringify({ error: "Failed to search company" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let companyId: string | null = existingCompanies?.[0]?.id ?? null;

    if (!companyId) {
      const { data: inserted, error: insertCompanyErr } = await admin
        .from("companies")
        .insert([
          {
            name: company_name,
            billing_email,
            phone,
            address,
            vat_number,
            company_type,
          },
        ])
        .select("id")
        .single();

      if (insertCompanyErr) {
        console.error("Insert company error", insertCompanyErr);
        return new Response(JSON.stringify({ error: "Failed to create company" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      companyId = inserted.id as string;
    }

    // 2) Ensure the admin user exists (get by email or invite)
    let adminUserId: string | null = null;

    // Try getUserByEmail first
    const getByEmail = await admin.auth.admin.getUserByEmail(admin_email).catch(() => null);
    if (getByEmail && getByEmail.data?.user) {
      adminUserId = getByEmail.data.user.id;
    } else {
      // Invite user if not found
      const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(admin_email);
      if (inviteErr) {
        // If user already exists, try again to fetch by email
        const retry = await admin.auth.admin.getUserByEmail(admin_email).catch(() => null);
        if (retry && retry.data?.user) {
          adminUserId = retry.data.user.id;
        } else {
          console.error("Invite error", inviteErr);
          return new Response(JSON.stringify({ error: inviteErr.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      } else {
        adminUserId = invite.user?.id ?? null;
      }
    }

    if (!adminUserId) {
      return new Response(JSON.stringify({ error: "Failed to resolve admin user id" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 3) Optionally grant global superadmin role
    if (make_superadmin) {
      const { error: roleUpsertErr } = await admin
        .from("user_roles")
        .upsert({ user_id: adminUserId, role: "siyakha_admin" }, { onConflict: "user_id,role" });

      if (roleUpsertErr) {
        console.error("Grant global role error", roleUpsertErr);
        // Don't fail hard; continue, but report partial success
      }
    }

    // 4) Add as company admin
    const { error: memberUpsertErr } = await admin
      .from("company_members")
      .upsert(
        { company_id: companyId, user_id: adminUserId, role: "admin" },
        { onConflict: "company_id,user_id" }
      );

    if (memberUpsertErr) {
      console.error("Company member upsert error", memberUpsertErr);
      return new Response(
        JSON.stringify({ error: "Company created, but failed to assign admin" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, company_id: companyId, admin_user_id: adminUserId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("Unhandled error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
