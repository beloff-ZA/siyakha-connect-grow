import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import SignInForm from "@/components/msp/SignInForm";
import ResetPasswordForm from "@/components/msp/ResetPasswordForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

export default function Auth() {
  const { isPasswordRecovery, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const title = isPasswordRecovery ? "Reset Password | Siyakha Technology" : "Login or Register | Siyakha Technology";
    const description = isPasswordRecovery ? "Reset your Siyakha Technology account password securely." : "Log in or create your Siyakha Technology account.";

    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/auth`);
  }, [isPasswordRecovery]);

  useEffect(() => {
    if (session && !isPasswordRecovery) {
      toast({ title: "You're already signed in", description: "Redirecting to your dashboard." });
      navigate("/dashboard", { replace: true });
    }
  }, [session, isPasswordRecovery, navigate, toast]);

  return (
    <div>
      <Header />
      <main>
        <section className="container mx-auto px-4 py-10">
          <h1 className="sr-only">Sign in to Siyakha Technology</h1>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="max-w-lg mx-auto w-full">
              <div className="flex items-center justify-center mb-6">
                <img
                  src="/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"
                  alt="Siyakha Technology logo"
                  width="199"
                  height="51"
                  className="h-10 w-auto"
                  decoding="async"
                />
              </div>
              <Card className="shadow-xl border border-border">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    {isPasswordRecovery ? "Reset your password" : "Sign in to Siyakha"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isPasswordRecovery ? <ResetPasswordForm /> : <SignInForm />}
                </CardContent>
              </Card>
            </div>
            <div className="hidden md:block">
              <div className="relative h-[520px] rounded-xl overflow-hidden border border-border bg-muted/20">
                <img
                  src={heroImage}
                  alt="Modern IT solutions by Siyakha Technology"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
