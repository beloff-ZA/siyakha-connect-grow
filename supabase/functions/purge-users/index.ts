import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Mode = "keep_current" | "keep_email" | "delete_all";

interface PurgeBody {
  mode: Mode;
  keepEmail?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error("Missing required Supabase env vars");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const body = (await req.json().catch(() => ({}))) as Partial<PurgeBody>;
    const mode = (body.mode ?? "keep_current") as Mode;

    // Get calling user
    const { data: userResp, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userResp?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const caller = userResp.user;

    // Check if caller is admin
    const { data: roles, error: rolesErr } = await supabaseUser
      .from("user_roles")
      .select("role");
    if (rolesErr) {
      console.error("Failed to fetch roles:", rolesErr);
    }
    const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "siyakha_admin");

    // Branch by mode
    if (mode === "delete_all") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: only admins can delete all users" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Fetch up to 1000 users
      const { data: list2, error: listErr2 } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr2) {
        console.error("listUsers error:", listErr2);
        return new Response(JSON.stringify({ error: listErr2.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const allUsers = list2?.users ?? [];
      const targetIds = allUsers.map((u: any) => u.id);

      // Clean associated data for all users
      const cleaned: Record<string, number> = {};
      const doDelete = async (table: string, col: string) => {
        const { error: delErr, count } = await supabaseAdmin
          .from(table)
          .delete({ count: "exact" })
          .in(col, targetIds);
        if (delErr) {
          console.error(`Delete from ${table} failed:`, delErr);
          throw delErr;
        }
        cleaned[table] = count ?? 0;
      };

      await doDelete("user_roles", "user_id");
      await doDelete("company_members", "user_id");
      await doDelete("support_calls", "user_id");
      await doDelete("quotes", "requested_by");
      await doDelete("profiles", "id");

      // Finally delete auth users
      await Promise.allSettled(targetIds.map((id) => supabaseAdmin.auth.admin.deleteUser(id)));

      return new Response(
        JSON.stringify({ mode, deletedUserIds: targetIds, cleaned }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Determine keep target for keep_* modes
    let keepEmail = mode === "keep_email" ? (body.keepEmail || "").trim().toLowerCase() : (caller.email || "").toLowerCase();

    if (mode === "keep_email" && !keepEmail) {
      return new Response(JSON.stringify({ error: "keepEmail is required for mode keep_email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Non-admins can only keep themselves
    if (!isAdmin && keepEmail !== (caller.email || "").toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden: only admins can keep another email" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const users = list?.users ?? [];
    const keepUser = users.find((u: any) => (u.email || "").toLowerCase() === keepEmail);

    if (!keepUser) {
      return new Response(JSON.stringify({ error: `Keep user not found for ${keepEmail}` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const targetUsers = users.filter((u: any) => u.id !== keepUser.id);
    const targetIds = targetUsers.map((u: any) => u.id);

    if (targetIds.length === 0) {
      return new Response(JSON.stringify({ keptEmail: keepEmail, deletedUserIds: [], cleaned: {}, message: "No users to delete" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Clean associated data in public schema (order: children first)
    const cleaned: Record<string, number> = {};

    const doDelete = async (table: string, col: string) => {
      const { error: delErr, count } = await supabaseAdmin
        .from(table)
        .delete({ count: "exact" })
        .in(col, targetIds);
      if (delErr) {
        console.error(`Delete from ${table} failed:`, delErr);
        throw delErr;
      }
      cleaned[table] = count ?? 0;
    };

    await doDelete("user_roles", "user_id");
    await doDelete("company_members", "user_id");
    await doDelete("support_calls", "user_id");
    await doDelete("quotes", "requested_by");
    await doDelete("profiles", "id");

    // Finally delete auth users
    const deleteResults = await Promise.allSettled(
      targetIds.map((id) => supabaseAdmin.auth.admin.deleteUser(id))
    );

    const failed = deleteResults.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error("Some user deletions failed:", failed);
    }

    const deletedUserIds = targetIds.filter((_id, idx) => deleteResults[idx].status === "fulfilled");

    return new Response(
      JSON.stringify({ keptEmail: keepEmail, deletedUserIds, cleaned }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (e) {
    console.error("Unhandled error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
