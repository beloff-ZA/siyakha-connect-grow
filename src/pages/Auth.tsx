import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AuthPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "recovery">("signin");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const pageTitle = mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password';
    document.title = `${pageTitle} | Siyakha Technology`;
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", mode === 'recovery' ? "Set a new password to access your account." : "Sign in or create an account to access your tickets.");
    if (!meta.parentNode) document.head.appendChild(meta);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, [mode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        return;
      }
      if (session?.user) {
        // Check if admin
        const { data: adminRow } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("role", "siyakha_admin")
          .maybeSingle();
        window.location.replace(adminRow ? "/helpdesk" : "/portal");
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      const params = new URLSearchParams(window.location.search);
      const isRecovery = params.get('type') === 'recovery';
      if (data.session?.user && !isRecovery) {
        const { data: adminRow } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", data.session.user.id)
          .eq("role", "siyakha_admin")
          .maybeSingle();
        window.location.replace(adminRow ? "/helpdesk" : "/portal");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" as any });
    setLoading(false);
  };

  const signUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/portal`;
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" as any });
    } else {
      toast({ title: "Check your email", description: "Confirm your email to continue." });
    }
    setLoading(false);
  };

  const forgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "We'll send a password reset link." });
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" as any });
    } else {
      toast({ title: "Check your email", description: "We've sent a password reset link." });
    }
    setLoading(false);
  };

  const updatePassword = async () => {
    if (!newPassword) {
      toast({ title: "Enter a new password", description: "Please provide a new password to continue." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" as any });
    } else {
      toast({ title: "Password updated", description: "Your password has been updated. Redirecting..." });
      window.location.replace("/portal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
          {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'recovery' ? 'Set a New Password' : 'Access your account'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mode === 'recovery' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={updatePassword} disabled={loading}>Update Password</Button>
                    <Button variant="outline" type="button" onClick={() => setMode('signin')}>Back to Sign In</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={signIn} disabled={loading}>Sign In</Button>
                      <Button variant="link" type="button" onClick={forgotPassword}>Forgot password?</Button>
                    </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
