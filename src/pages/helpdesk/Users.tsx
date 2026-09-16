import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Chip, Field, Panel, selectCls } from "@/components/pm/ui";

type AppUser = {
  id: string;
  email: string;
  name: string;
  role_labels: string[];
  last_sign_in_at: string | null;
  created_at: string;
};

const TYPES = [
  { value: "admin", label: "Admin" },
  { value: "technician", label: "Technician" },
  { value: "client", label: "Client" },
];

/**
 * Admin user administration. Passwords are handed straight to the secure auth
 * provider — they are never stored, logged or shown back anywhere in the app.
 */
const Users: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", user_type: "technician", password: "" });

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-create-user", { body });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const load = useCallback(async () => {
    try {
      const res = await call({ action: "list" });
      setUsers(res.users ?? []);
    } catch (e) {
      toast({
        title: "Users could not be loaded",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive" as never,
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    setBusy(true);
    try {
      await call({ action: "create", ...form });
      toast({
        title: "User created",
        description: "Share the temporary password with them directly and ask them to change it after signing in.",
      });
      setForm({ name: "", email: "", user_type: form.user_type, password: "" });
      await load();
    } catch (e) {
      toast({
        title: "User could not be created",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive" as never,
      });
    } finally {
      setBusy(false);
    }
  };

  const changeType = async (id: string, user_type: string) => {
    try {
      await call({ action: "set_type", user_id: id, user_type });
      toast({ title: "User type changed" });
      await load();
    } catch (e) {
      toast({
        title: "Could not change the user type",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive" as never,
      });
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Users &amp; access</h1>

      <Panel title="Create a user">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email / login">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="User type">
            <select
              className={selectCls}
              value={form.user_type}
              onChange={(e) => setForm({ ...form, user_type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Temporary password (min 10 characters)">
            <Input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">
            The password is sent straight to the secure sign-in service. Nobody, including us, can read it back later.
          </p>
          <Button onClick={create} disabled={busy} className="ml-auto">
            Create user
          </Button>
        </div>
      </Panel>

      <Panel title={`People with a login — ${users.length}`}>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 border border-border p-3 text-sm">
              <span className="font-medium">{u.name || "No name captured"}</span>
              <span className="text-muted-foreground">{u.email}</span>
              {(u.role_labels.length ? u.role_labels : ["No type"]).map((r) => (
                <Chip key={r}>{r}</Chip>
              ))}
              <span className="text-xs text-muted-foreground">
                {u.last_sign_in_at
                  ? `last signed in ${new Date(u.last_sign_in_at).toLocaleDateString("en-ZA")}`
                  : "never signed in"}
              </span>
              <select
                className="ml-auto h-8 border border-input bg-background px-2 text-xs"
                defaultValue=""
                onChange={(e) => e.target.value && changeType(u.id, e.target.value)}
                aria-label="Change user type"
              >
                <option value="">Change type…</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {!users.length && <p className="text-sm text-muted-foreground">No users loaded.</p>}
        </div>
      </Panel>
    </AdminLayout>
  );
};

export default Users;
