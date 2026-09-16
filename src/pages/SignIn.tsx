import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  decideSignInRedirect,
  isRecoveryRequest,
  resolveAccessProfile,
} from "@/lib/authRouting";
import { hasPendingRecoveryLink, PATH_RESET_PASSWORD } from "@/lib/recoveryLink";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";

type Mode = "signin" | "forgot" | "setup";

/**
 * The single secure access screen for the whole platform.
 *
 * /sign-in is canonical; /auth and /client-login render this exact component so
 * existing bookmarks and password-recovery links keep working with one set of
 * redirect rules. There is no public self-signup and no automatic mail: password
 * reset and first-time setup are always started by the person signing in.
 */
const SignIn: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /** Set when the access lookup itself failed, so the person can retry safely. */
  const [retryable, setRetryable] = useState(false);

  useEffect(() => {
    document.title = "Secure Sign In | Siyakha Interlink";
    const meta = document.querySelector('meta[name="description"]') ?? document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute(
      "content",
      "Secure sign in for Siyakha Interlink clients and staff to access project portals and the management workspace.",
    );
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  // One access decision, one redirect. Never fall back to a portal on failure.
  const routeAfterAuth = useCallback(
    async (userId: string) => {
      const profile = await resolveAccessProfile(userId);
      const decision = decideSignInRedirect(profile);
      if (decision.state === "redirect") {
        setRetryable(false);
        setFormError(null);
        navigate(decision.to, { replace: true });
        return;
      }
      setFormError(decision.state === "error" ? decision.reason : null);
      if (profile.access === "error") {
        // A lookup failure keeps the session so the person can simply retry.
        setRetryable(true);
        return;
      }
      setRetryable(false);
      await supabase.auth.signOut();
    },
    [navigate],
  );

  const retryAccessCheck = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setLoading(false);
    if (data.user) await routeAfterAuth(data.user.id);
    else {
      setRetryable(false);
      setFormError("Your session ended. Please sign in again.");
    }
  }, [routeAfterAuth]);

  useEffect(() => {
    // A genuine recovery link is handled only by /reset-password. If one is
    // pending, this screen does nothing at all so it cannot consume the link or
    // redirect the person into the app.
    const isRecovery =
      hasPendingRecoveryLink() || isRecoveryRequest(window.location.search, window.location.hash);
    if (isRecovery) return;

    const mustChange = (u: { user_metadata?: Record<string, unknown> } | undefined | null) =>
      u?.user_metadata?.must_change_password === true;

    // Guard against the auth-event / getSession race: whichever resolves first
    // performs the single redirect, the other becomes a no-op.
    let handled = false;
    const handle = (session: { user?: { id: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user || isRecovery) return;
      if (mustChange(session.user)) {
        setMode("setup");
        return;
      }
      if (handled) return;
      handled = true;
      void routeAfterAuth(session.user.id);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("setup");
        return;
      }
      if (event === "SIGNED_OUT") {
        handled = false;
        return;
      }
      handle(session);
    });

    supabase.auth.getSession().then(({ data }) => handle(data.session));

    return () => subscription.unsubscribe();
  }, [routeAfterAuth]);

  const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setRetryable(false);
    if (!validEmail(email)) return setFormError("Enter a valid email address.");
    if (!password) return setFormError("Enter your password.");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setFormError(
        error.message === "Invalid login credentials"
          ? "Those details don't match an active account. Check your email and password, or use the reset option below."
          : error.message,
      );
      return;
    }
    // Provisioned accounts may require a password change before access.
    if (data.user?.user_metadata?.must_change_password === true) {
      setMode("setup");
      setPassword("");
      toast({ title: "Set a new password", description: "Choose your own password to continue." });
      return;
    }
    if (data.user) await routeAfterAuth(data.user.id);
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validEmail(email)) return setFormError("Enter a valid email address.");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${PATH_RESET_PASSWORD}`,
    });
    setLoading(false);
    if (error) return setFormError(error.message);
    toast({
      title: "Check your inbox",
      description: "If this email belongs to a Siyakha account, a reset link is on its way.",
    });
    setMode("signin");
  };

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
    if (error) return setFormError(error.message);
    // No outbound notification is sent from this screen.
    toast({ title: "Password set", description: "Your password has been updated." });
    const { data } = await supabase.auth.getUser();
    if (data.user) await routeAfterAuth(data.user.id);
  };

  const heading =
    mode === "signin" ? "Secure Sign In" : mode === "forgot" ? "Reset your password" : "Set your password";

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
          <img src={siyakhaWordmark} alt="Siyakha Interlink" className="h-8 w-auto mb-10" />

          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
            Siyakha Secure Access
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-3">{heading}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            {mode === "setup"
              ? "Choose a password for your account to continue."
              : "Access is by invitation only. Use the email address Siyakha registered for you — you are taken to the right workspace automatically."}
          </p>

          <div className="border border-border p-6 md:p-8">
            {formError && (
              <div
                role="alert"
                className="mb-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {formError}
                {retryable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={loading}
                    onClick={retryAccessCheck}
                  >
                    {loading ? "Checking…" : "Try again"}
                  </Button>
                )}
              </div>
            )}

            {mode === "setup" ? (
              <form onSubmit={savePassword} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving…" : "Save password & continue"}
                </Button>
              </form>
            ) : mode === "forgot" ? (
              <form onSubmit={sendReset} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("signin")}>
                  Back to sign in
                </Button>
              </form>
            ) : (
              <form onSubmit={signIn} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="w-full text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password / first-time setup
                </button>
              </form>
            )}
          </div>

          <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span>
              Accounts are created by Siyakha. If you need access, email{" "}
              <a className="underline" href="mailto:nikita@siyakhatechnology.co.za">
                nikita@siyakhatechnology.co.za
              </a>
              .
            </span>
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
