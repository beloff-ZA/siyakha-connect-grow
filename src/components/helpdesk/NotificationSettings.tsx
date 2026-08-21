import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Settings = {
  id: string;
  login_notify_enabled: boolean;
  recipient_email: string;
  client_emails_enabled: boolean;
};

type LogRow = {
  id: string;
  user_email: string | null;
  full_name: string | null;
  client_name: string | null;
  recipient_email: string | null;
  event_kind: string;
  delivery_status: string;
  error_message: string | null;
  created_at: string;
};

const joburg = (iso: string) =>
  new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

/** Admin-only controls for client sign-in email notifications. */
const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [recipient, setRecipient] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    const [s, l] = await Promise.all([
      supabase
        .from("portal_notification_settings")
        .select("id, login_notify_enabled, recipient_email, client_emails_enabled")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("portal_login_notifications")
        .select(
          "id, user_email, full_name, client_name, recipient_email, event_kind, delivery_status, error_message, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(25),
    ]);
    if (s.data) {
      setSettings(s.data as Settings);
      setRecipient(s.data.recipient_email);
    }
    setLogs((l.data ?? []) as LogRow[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (values: Partial<Settings>) => {
    if (!settings) return;
    setBusy(true);
    const { error } = await supabase
      .from("portal_notification_settings")
      .update(values)
      .eq("id", settings.id);
    setBusy(false);
    if (error) {
      toast({
        title: "Could not save",
        description: error.message,
        variant: "destructive" as never,
      });
      return;
    }
    toast({ title: "Notification settings saved" });
    void load();
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    const { data, error } = await supabase.functions.invoke("notify-client-login", {
      body: { test: true },
    });
    setTesting(false);
    const payload = data as { success?: boolean; error?: string; delivery_status?: string } | null;
    if (error || payload?.success === false) {
      setTestResult({
        ok: false,
        message: error?.message ?? payload?.error ?? "The test email could not be delivered.",
      });
    } else {
      setTestResult({ ok: true, message: `Test email sent to ${recipient}.` });
    }
    void load();
  };

  const emailsEnabled = settings?.client_emails_enabled === true;

  return (
    <div className="space-y-6">
      <section className="border-2 border-foreground p-5 md:p-6">
        <h3 className="text-[10px] uppercase tracking-[0.26em] mb-4">
          Testing mode — client email safety switch
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Label htmlFor="client-emails-toggle" className="text-sm">
              Allow emails to clients
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              While this is off, the server refuses every client invitation, setup-link and
              notification email, and those actions are hidden in the admin UI.
            </p>
          </div>
          <Switch
            id="client-emails-toggle"
            checked={emailsEnabled}
            disabled={!settings || busy}
            onCheckedChange={(checked) => patch({ client_emails_enabled: checked })}
          />
        </div>
      </section>

      <section className="border border-border p-5 md:p-6">
        <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-5">
          Client sign-in notifications
        </h3>


        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <Label htmlFor="notify-toggle" className="text-sm">
              Notify me when a client signs in
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Sends a portal login summary to the recipient below. Never includes passwords, tokens
              or session data.
            </p>
          </div>
          <Switch
            id="notify-toggle"
            checked={settings?.login_notify_enabled ?? false}
            disabled={!settings || busy}
            onCheckedChange={(checked) => patch({ login_notify_enabled: checked })}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="notify-recipient">Recipient email</Label>
            <Input
              id="notify-recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="nikita@siyakhatechnology.co.za"
            />
            <p className="text-xs text-muted-foreground">
              Editable by Siyakha admins only. Clients cannot read or change this.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={busy || !recipient.trim() || recipient === settings?.recipient_email}
              onClick={() => patch({ recipient_email: recipient.trim().toLowerCase() })}
            >
              Save recipient
            </Button>
            <Button
              type="button"
              disabled={testing || !emailsEnabled}
              title={emailsEnabled ? undefined : "Disabled while client emails are off (testing mode)"}
              onClick={sendTest}
            >
              {testing ? "Sending…" : "Send test email"}
            </Button>
          </div>
        </div>

        {testResult && (
          <div
            role="status"
            className={`mt-4 border px-4 py-3 text-xs ${
              testResult.ok
                ? "border-border text-muted-foreground"
                : "border-destructive/50 bg-destructive/5 text-destructive"
            }`}
          >
            {testResult.message}
          </div>
        )}
      </section>

      <section className="border border-border p-5 md:p-6">
        <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">
          Recent notifications
        </h3>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Time (SAST)</th>
                  <th className="py-2 pr-4">Sent to</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-2 pr-4">
                      {row.full_name ?? "—"}
                      <span className="block text-muted-foreground">{row.user_email ?? "—"}</span>
                    </td>
                    <td className="py-2 pr-4">{row.client_name ?? "—"}</td>
                    <td className="py-2 pr-4">{joburg(row.created_at)}</td>
                    <td className="py-2 pr-4">{row.recipient_email ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          row.delivery_status === "sent" ? "text-foreground" : "text-destructive"
                        }
                      >
                        {row.delivery_status}
                        {row.event_kind === "test" ? " (test)" : ""}
                      </span>
                      {row.error_message && (
                        <span className="block text-muted-foreground">{row.error_message}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationSettings;
