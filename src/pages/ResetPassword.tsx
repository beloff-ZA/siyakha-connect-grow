import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { decideSignInRedirect, resolveAccessProfile, PATH_SIGN_IN } from "@/lib/authRouting";
import { takeRecoveryLink, PATH_RESET_PASSWORD, type RecoveryLink } from "@/lib/recoveryLink";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";

type Stage = "verifying" | "ready" | "invalid" | "request";

/**
 * Dedicated password-recovery screen.
 *
 * The recovery link is captured before the auth client can clean the URL, then
 * exchanged here into a real session before the new password is saved. This
 * screen never falls through to the ordinary app: a bad or expired link shows a
 * clear message and a way to request a fresh email.
 */
const ResetPassword: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("verifying");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Set a new password | Siyakha Technology Solutions";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hasSession = async () => {
      const { data } = await supabase.auth.getSession();
      return Boolean(data.session);
    };

    /** Auth errors are technical; the person only needs to know to ask for a new link. */
    const friendly = (raw: string) =>
      /expired|invalid or has expired/i.test(raw)
        ? "This password reset link has expired or has already been used."
        : "This password reset link could not be verified. It may have expired or already been used.";



    const establish = async (link: RecoveryLink | null) => {
      if (!link) {
        // No link on this page load — only an already-restored recovery session
        // can legitimately be here.
        return (await hasSession())
          ? { ok: true as const }
          : { ok: false as const, reason: "This password reset link is missing or has already been used." };
      }

      if (link.kind === "error") return { ok: false as const, reason: link.message };

      if (link.kind === "tokens") {
        const { error } = await supabase.auth.setSession({
          access_token: link.accessToken,
          refresh_token: link.refreshToken,
        });
        if (!error) return { ok: true as const };
        return (await hasSession())
          ? { ok: true as const }
          : { ok: false as const, reason: error.message };
      }

      if (link.kind === "code") {
        const { error } = await supabase.auth.exchangeCodeForSession(link.code);
        if (!error) return { ok: true as const };
        // The client may already have exchanged the same code on start-up.
        return (await hasSession())
          ? { ok: true as const }
          : { ok: false as const, reason: error.message };
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: link.tokenHash,
        type: link.type === "invite" ? "invite" : link.type === "signup" ? "signup" : "recovery",
      });
      if (!error) return { ok: true as const };
      return (await hasSession()) ? { ok: true as const } : { ok: false as const, reason: error.message };
    };

    void (async () => {
      const result = await establish(takeRecoveryLink());
      if (cancelled) return;
      // Remove any residual tokens from the address bar once handled.
      window.history.replaceState({}, "", PATH_RESET_PASSWORD);
      if (result.ok) {
        setStage("ready");
      } else {
        setMessage(result.reason);
        setStage("invalid");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newPassword.length < 8) return setFormError("Use at least 8 characters.");
    if (newPassword !== confirmPassword) return setFormError("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });
    setLoading(false);
    if (error) {
      if (/session|jwt|expired/i.test(error.message)) {
        setMessage("Your reset link expired before the password was saved. Request a new one below.");
        setStage("invalid");
        return;
      }
      return setFormError(error.message);
    }
    toast({ title: "Password updated", description: "You can now use your new password." });
    const { data } = await supabase.auth.getUser();
    if (!data.user) return navigate(PATH_SIGN_IN, { replace: true });
    const decision = decideSignInRedirect(await resolveAccessProfile(data.user.id));
    navigate(decision.state === "redirect" ? decision.to : PATH_SIGN_IN, { replace: true });
  };

  const sendReset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError("Enter a valid email address.");
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}${PATH_RESET_PASSWORD}`,
      });
      setLoading(false);
      if (error) return setFormError(error.message);
      toast({
        title: "Check your inbox",
        description: "If this email belongs to a Siyakha account, a new reset link is on its way.",
      });
    },
    [email, toast],
  );

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 lg:px-10 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back to site
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <img src={siyakhaWordmark} alt="Siyakha Technology Solutions" className="h-8 w-auto mb-10" />

          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
            Siyakha Secure Access
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight uppercase mb-3">
            {stage === "ready" ? "Set new password" : stage === "verifying" ? "Checking your link" : "Reset link problem"}
          </h1>

          <div className="border border-border p-6 md:p-8">
            {stage === "verifying" && (
              <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
            )}

            {stage === "ready" && (
              <form onSubmit={savePassword} className="space-y-5" noValidate>
                <p className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>Your reset link is valid. Choose a new password for your account.</span>
                </p>
                {formError && (
                  <div
                    role="alert"
                    className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {formError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(ev) => setNewPassword(ev.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating…" : "Update password"}
                </Button>
              </form>
            )}

            {stage === "invalid" && (
              <div className="space-y-5">
                <div
                  role="alert"
                  className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {message ?? "This password reset link is no longer valid."}
                </div>
                <Button type="button" className="w-full" onClick={() => setStage("request")}>
                  Request a new reset email
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate(PATH_SIGN_IN)}>
                  Back to sign in
                </Button>
              </div>
            )}

            {stage === "request" && (
              <form onSubmit={sendReset} className="space-y-5" noValidate>
                {formError && (
                  <div
                    role="alert"
                    className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {formError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate(PATH_SIGN_IN)}>
                  Back to sign in
                </Button>
              </form>
            )}
          </div>

          <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span>
              Passwords are stored scrambled and can never be read by anyone, including Siyakha staff.
            </span>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
