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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = (mode === 'signin' ? 'Sign In' : 'Sign Up') + " | Siyakha Technology";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "Sign in or create an account to access the portal.");
    if (!meta.parentNode) document.head.appendChild(meta);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, [mode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        window.location.replace("/portal/tickets");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) window.location.replace("/portal/tickets");
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
    const redirectUrl = `${window.location.origin}/portal/tickets`;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Access the Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {mode === 'signin' ? (
                  <Button onClick={signIn} disabled={loading}>Sign In</Button>
                ) : (
                  <Button onClick={signUp} disabled={loading}>Create Account</Button>
                )}
                <Button variant="outline" type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                  {mode === 'signin' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
                </Button>
                {mode === 'signin' && (
                  <Button variant="link" type="button" onClick={forgotPassword}>Forgot password?</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
