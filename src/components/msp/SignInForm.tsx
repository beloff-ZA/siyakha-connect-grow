import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignInForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState("");
  const COMPANY_TYPES = [
    { value: "msp", label: "MSP" },
    { value: "isp", label: "ISP" },
    { value: "school", label: "School" },
    { value: "enterprise", label: "Enterprise" },
    { value: "government", label: "Government" },
    { value: "healthcare", label: "Healthcare" },
    { value: "hospitality", label: "Hospitality" },
    { value: "retail", label: "Retail" },
    { value: "nonprofit", label: "Nonprofit" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "finance", label: "Finance" },
    { value: "other", label: "Other" },
  ];
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
        const { data: userRes } = await supabase.auth.getUser();
        let org = "";
        if (userRes.user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("company_name, display_name")
            .eq("id", userRes.user.id)
            .maybeSingle();
          org = prof?.company_name || prof?.display_name || "";
        }
        toast({ title: "Signed in", description: org ? `Welcome back — ${org}` : "Welcome back." });
      }
    } else {
      const redirectUrl = `${window.location.origin}/auth`;
      if (!fullName || !phone || !companyType) {
        setLoading(false);
        toast({ title: "Missing details", description: "Please enter your full name, contact number, and company type.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, phone, company, company_type: companyType }
        },
      });
      if (error) {
        toast({ title: "Sign up failed", description: mapAuthError(error.message), variant: "destructive" });
      } else {
        const msg = "Thank you for registering as a Siyakha partner. We look forward to helping you. Please check your mail for registered company authentication confirmation.";
        sessionStorage.setItem('signup_success_msg', msg);
        toast({ title: "Thank you for registering", description: msg });
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
      {!isLogin && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Jane Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +27 82 123 4567" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company name</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Siyakha Technology" />
          </div>
          <div className="space-y-2">
            <Label>Company type</Label>
            <Select value={companyType || undefined} onValueChange={(v) => setCompanyType(v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading} className="cta-primary">{isLogin ? "Sign in" : "Sign up"}</Button>
        <Button type="button" variant="secondary" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an account" : "Have an account? Sign in"}
        </Button>
      </div>
    </form>
  );
}
