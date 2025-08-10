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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Signed in", description: "Welcome back." });
      }
    } else {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
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
