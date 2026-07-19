import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  name?: string;
  make_superadmin?: boolean; // default true
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, make_superadmin = true } = (await req.json()) as InviteRequest;
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client bound to caller's JWT to identify the invoker
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Ensure the caller is authenticated
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check caller has siyakha_admin role
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

    // Send invite via Admin API
    const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name ?? undefined },
      // The redirect URL must be configured in Supabase Auth settings (Site URL/Redirects)
    });

    if (inviteErr) {
      console.error("Invite error", inviteErr);
      return new Response(JSON.stringify({ error: inviteErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const invitedUserId = invite.user?.id;

    // Optionally assign superadmin role immediately
    if (make_superadmin && invitedUserId) {
      const { error: roleInsertErr } = await admin
        .from("user_roles")
        .insert({ user_id: invitedUserId, role: "siyakha_admin" });

      if (roleInsertErr) {
        console.error("Role insert error", roleInsertErr);
        return new Response(
          JSON.stringify({ error: "Invite sent, but failed to assign role" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, invited_user_id: invitedUserId }),
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
