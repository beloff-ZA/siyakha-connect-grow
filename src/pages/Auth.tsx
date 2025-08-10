import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import SignInForm from "@/components/msp/SignInForm";
import ResetPasswordForm from "@/components/msp/ResetPasswordForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import { Server, Shield, Cloud, Users, LifeBuoy, Activity, FileText, CheckCircle2, History, Clock, ShoppingCart, KanbanSquare, PiggyBank } from "lucide-react";

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

  useEffect(() => {
    const msg = sessionStorage.getItem('signup_success_msg');
    if (msg) {
      toast({ title: 'Thank you for registering', description: msg });
      sessionStorage.removeItem('signup_success_msg');
    }
  }, [toast]);

  return (
    <main className="min-h-screen bg-background">
      <section className="min-h-screen grid md:grid-cols-2">
        <h1 className="sr-only">Sign in to Siyakha Technology</h1>
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
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
            <div className="mt-4 text-center">
              <Button asChild variant="link" size="sm" aria-label="Return to home">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="relative h-full">
            <img
              src={heroImage}
              alt="Modern IT solutions by Siyakha Technology"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-background/10" />
            {/* Circular process diagram overlay */}
            <div className="absolute inset-x-0 top-0 bottom-24 flex items-center justify-center z-10">
              <div className="relative w-[420px] h-[420px] hidden xl:block pointer-events-none animate-fade-in">
                <div className="absolute inset-0 rounded-full border border-border/60" aria-hidden="true" />
                <div className="absolute inset-8 rounded-full border border-border/50" aria-hidden="true" />
                <div className="absolute inset-16 rounded-full border border-border/40" aria-hidden="true" />

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(0deg) translateX(178px) rotate(0deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <FileText className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Request Your Quote</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(45deg) translateX(178px) rotate(-45deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Accept Your Quote</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(90deg) translateX(178px) rotate(-90deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <LifeBuoy className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Quick Help Request</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(135deg) translateX(178px) rotate(-135deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <History className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Manage History of Calls</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(180deg) translateX(178px) rotate(-180deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Clock className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Manage ETA</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(225deg) translateX(178px) rotate(-225deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <ShoppingCart className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Order Products</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(270deg) translateX(178px) rotate(-270deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <KanbanSquare className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Manage Projects</span>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2" style={{ transform: "rotate(315deg) translateX(178px) rotate(-315deg)" }}>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <PiggyBank className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground/90">Save Money</span>
                  </div>
                </div>

                <ul className="sr-only">
                  <li>Request Your Quote</li>
                  <li>Accept Your Quote</li>
                  <li>Quick Help Request</li>
                  <li>Manage Your History of Calls</li>
                  <li>Manage ETA</li>
                  <li>Order Products</li>
                  <li>Manage Projects</li>
                  <li>Save Money</li>
                </ul>
              </div>
            </div>
            <aside className="absolute bottom-0 left-0 right-0 z-10">
              <div className="bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 border-t border-border">
                <ul className="px-6 py-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <li className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground">Infrastructure & Networking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground">Security & Surveillance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground">Cloud & Edge Solutions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground">Smart Collaboration Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground">National Field Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs text-foreground">Healthcare IT Support</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
