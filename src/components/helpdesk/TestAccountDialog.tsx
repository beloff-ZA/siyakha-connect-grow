import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export type TestAccountTarget = {
  id: string;
  email: string;
  full_name: string | null;
  mode: "activate" | "reset";
};

type Props = {
  target: TestAccountTarget | null;
  onClose: () => void;
  onDone: () => void;
};

const strength = (pw: string): string | null => {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/.test(pw)) return "Include a lowercase letter.";
  if (!/[A-Z]/.test(pw)) return "Include an uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Include a number.";
  return null;
};

/**
 * TESTING-ONLY admin dialog. Sets a client portal password directly, with no
 * email of any kind. The password is sent once to the secured edge function and
 * is never stored, logged or displayed again.
 */
const TestAccountDialog: React.FC<Props> = ({ target, onClose, onDone }) => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [requireChange, setRequireChange] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPassword("");
    setConfirm("");
    setRequireChange(false);
    setError(null);
  }, [target?.id, target?.mode]);

  if (!target) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const problem = strength(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("Passwords do not match.");

    setBusy(true);
    const { data, error: fnError } = await supabase.functions.invoke(
      "provision-client-test-account",
      {
        body: {
          client_user_id: target.id,
          password,
          confirm_password: confirm,
          require_password_change: requireChange,
          action: target.mode,
        },
      },
    );
    setBusy(false);
    setPassword("");
    setConfirm("");

    const payload = data as { success?: boolean; error?: string } | null;
    if (fnError || payload?.success !== true) {
      setError(payload?.error ?? fnError?.message ?? "The operation failed.");
      return;
    }
    toast({
      title: target.mode === "reset" ? "Test password reset" : "Test account activated",
      description: "No email was sent. Share the password privately.",
    });
    onDone();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {target.mode === "reset"
              ? "Reset test password without email"
              : "Activate test account without email"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            TESTING-ONLY admin operation. No invitation, setup or notification email is sent.
            The password is never stored or shown again.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="ta-email">Username / email</Label>
            <Input id="ta-email" value={target.email} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ta-pw">Temporary password</Label>
            <Input
              id="ta-pw"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters, with upper case, lower case and a number.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ta-pw2">Confirm password</Label>
            <Input
              id="ta-pw2"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <Label htmlFor="ta-force" className="text-sm font-normal">
              Require password change at next login
            </Label>
            <Switch id="ta-force" checked={requireChange} onCheckedChange={setRequireChange} />
          </div>

          {error && (
            <p role="alert" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Working…" : target.mode === "reset" ? "Reset password" : "Activate account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TestAccountDialog;
