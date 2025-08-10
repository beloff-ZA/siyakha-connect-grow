import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import SignInForm from "@/components/msp/SignInForm";
import ResetPasswordForm from "@/components/msp/ResetPasswordForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
      toast({ title: "You're already signed in", description: "Redirecting to home." });
      navigate("/", { replace: true });
    }
  }, [session, isPasswordRecovery, navigate, toast]);

  return (
    <div>
      <Header />
      <main>
        <section className="container mx-auto px-4 py-10">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>{isPasswordRecovery ? "Reset your password" : "Sign in or create an account"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isPasswordRecovery ? <ResetPasswordForm /> : <SignInForm />}
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
