import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function SignInForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure onAuthStateChange is wired to keep session fresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Session is managed by the client config; no extra logic needed here.
    });
    return () => subscription.unsubscribe();
  }, []);

  const mapAuthError = (message?: string) => {
    if (!message) return "Something went wrong. Please try again.";
    const msg = message.toLowerCase();
    if (msg.includes("invalid login credentials")) return "Email or password is incorrect.";
    if (msg.includes("email not confirmed")) return "Please confirm your email address via the link we sent.";
    if (msg.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
    return message;
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email first", description: "We'll send a reset link to your email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't send reset link", description: mapAuthError(error.message), variant: "destructive" });
    } else {
      toast({ title: "Reset link sent", description: "Check your email to continue." });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Sign in failed", description: mapAuthError(error.message), variant: "destructive" });
      } else {
        toast({ title: "Signed in", description: "Welcome back." });
      }
    } else {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) {
        toast({ title: "Sign up failed", description: mapAuthError(error.message), variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "Confirm your address to complete sign up." });
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md w-full">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {isLogin && (
          <div className="text-right">
            <button type="button" onClick={handleResetPassword} className="text-sm underline">
              Forgot password?
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading} className="cta-primary">{isLogin ? "Sign in" : "Sign up"}</Button>
        <Button type="button" variant="secondary" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an account" : "Have an account? Sign in"}
        </Button>
      </div>
    </form>
  );
}
