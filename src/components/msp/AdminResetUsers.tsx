import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function AdminResetUsers() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState<"keep_current" | "keep_email" | "delete_all">("keep_current");
  const [keepEmail, setKeepEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [callerEmail, setCallerEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCallerEmail(user?.email || "");
      const { data, error } = await supabase.from("user_roles").select("role");
      if (error) {
        console.error(error);
      }
      const admin = Array.isArray(data) && data.some(r => r.role === "siyakha_admin");
      setIsAdmin(admin);
    };
    load();
  }, []);

  const canSubmit = useMemo(() => confirmText === "DELETE USERS" && (!loading), [confirmText, loading]);

  const run = async () => {
    try {
      setLoading(true);
      const body: any = { mode };
      if (mode === "keep_email") body.keepEmail = keepEmail.trim();

      const { data, error } = await supabase.functions.invoke("purge-users", { body });
      if (error) throw error;

      const keptInfo = mode === "delete_all" ? "All users deleted" : `Kept ${data?.keptEmail}`;
      toast({
        title: "Users purged",
        description: `${keptInfo}. Deleted ${data?.deletedUserIds?.length || 0} users.`,
      });
    } catch (e: any) {
      toast({ title: "Failed to purge", description: e?.message || "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Card className="rounded-2xl shadow-sm lg:col-span-3">
      <CardHeader>
        <CardTitle>Reset Users (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep_current">Keep current account ({callerEmail || "you"})</SelectItem>
                <SelectItem value="keep_email">Keep specific email</SelectItem>
                <SelectItem value="delete_all">Delete ALL users (admin only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "keep_email" && (
            <div className="grid gap-2">
              <Label htmlFor="keepEmail">Email to keep</Label>
              <Input id="keepEmail" value={keepEmail} onChange={(e) => setKeepEmail(e.target.value)} placeholder="admin@example.com" className="rounded-xl" />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="confirm">Type DELETE USERS to confirm</Label>
            <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="rounded-xl" />
          </div>

          <p className="text-xs text-muted-foreground">Dangerous action: In keep modes we remove all users except the one you keep; in Delete ALL we remove every user. Companies and Sites are not affected.</p>

          <Button disabled={!canSubmit} onClick={run} className="rounded-2xl" variant="destructive">
            {loading ? "Purging…" : "Purge users"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
