import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { PageHeader, Panel, Loading, ErrorNote } from "@/components/portal/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PortalProfile: React.FC = () => {
  const { client, clientUser, loading, error } = usePortal();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Profile & Security | Siyakha Client Portal";
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newPassword.length < 8) return setFormError("Use at least 8 characters.");
    if (newPassword !== confirmPassword) return setFormError("Passwords do not match.");
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (updateError) return setFormError(updateError.message);
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/client-login", { replace: true });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;

  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Account" title="Profile & security" />

      <div className="space-y-6">
        <Panel title="Your details">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Name</dt>
              <dd>{clientUser?.full_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Email</dt>
              <dd className="break-all">{user?.email ?? clientUser?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Client</dt>
              <dd>{client?.display_name ?? "—"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Change password">
          <form onSubmit={changePassword} className="space-y-5" noValidate>
            {formError && <ErrorNote message={formError} />}
            <div className="space-y-2">
              <Label htmlFor="profile-new-password">New password</Label>
              <Input
                id="profile-new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-confirm-password">Confirm password</Label>
              <Input
                id="profile-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        </Panel>

        <Panel title="Session">
          <Button type="button" variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </Panel>
      </div>
    </div>
  );
};

export default PortalProfile;
