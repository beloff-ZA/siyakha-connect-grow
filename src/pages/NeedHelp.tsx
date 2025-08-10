import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SignInForm from "@/components/msp/SignInForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const issueOptions = [
  { key: "computer", label: "Computer Issues – Software errors, slow performance, setup help" },
  { key: "printer", label: "Printer Problems – Paper jams, connectivity, configuration" },
  { key: "network", label: "Network & Wi‑Fi – Connection drops, slow speeds, setup" },
  { key: "server", label: "Server & Cloud – Downtime, storage, security" },
  { key: "other", label: "Other – Please describe below" },
] as const;

const locationOptions = [
  { key: "company", label: "Company – Offices, retail, business premises" },
  { key: "school", label: "School – Classrooms, labs, admin offices" },
  { key: "home", label: "Home – Personal devices, Wi‑Fi, printers" },
  { key: "church", label: "Church – Office tech, sound systems, networking" },
] as const;

type ClientStatus = "registered" | "new" | null;

type IssueKey = typeof issueOptions[number]["key"];

type LocationKey = typeof locationOptions[number]["key"];

export default function NeedHelp() {
  const { toast } = useToast();

  // Steps state
  const [step, setStep] = useState(1);
  const [clientStatus, setClientStatus] = useState<ClientStatus>(null);
  const [location, setLocation] = useState<LocationKey | null>(null);
  const [issues, setIssues] = useState<IssueKey[]>([]);
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // SEO metadata
  useEffect(() => {
    const title = "Need Help? Your Tech Problems, Solved | Siyakha Technology";
    const descriptionMeta =
      "Fast IT support for company, school, home or church. Computer, printer, Wi‑Fi, server issues — solved quickly by Siyakha.";

    document.title = title;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", descriptionMeta);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", descriptionMeta);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/need-help`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/need-help`);
  }, []);

  // Auth listener to react to login/logout and prefill data
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session) {
        setClientStatus("registered");
        setAuthOpen(false);
        setEmail((prev) => prev || session.user.email || "");
        if (step === 1) setStep(2);
        toast({ title: "Signed in", description: "You're now signed in." });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
      if (session) {
        setClientStatus((s) => s ?? "registered");
      }
    });

    return () => subscription.unsubscribe();
  }, [step, toast]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return clientStatus !== null;
      case 2:
        return !!location;
      case 3:
        return issues.length > 0;
      case 4:
        return description.trim().length > 5;
      case 5:
        return fullName && email && phone;
      default:
        return true;
    }
  }, [step, clientStatus, location, issues, description, fullName, email, phone]);

  const toggleIssue = (key: IssueKey) => {
    setIssues((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const next = () => {
    if (!canContinue) {
      toast({ title: "Complete this step", description: "Please fill the required fields before continuing.", variant: "destructive" });
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!canContinue) return;
    setLoading(true);

    const locationLabel = locationOptions.find((l) => l.key === location)?.label ?? "";
    const issuesLabels = issueOptions.filter((i) => issues.includes(i.key)).map((i) => i.label);

    const subject = `Need Help — ${locationLabel} — ${issuesLabels.join(", ")} — ${fullName}`;

    const html = `
      <h2>New Need Help Request</h2>
      <p><strong>Client status:</strong> ${clientStatus === "registered" ? "Registered" : "New to Siyakha"}</p>
      <p><strong>Location:</strong> ${locationLabel}</p>
      <p><strong>Issues:</strong><br/> ${issuesLabels.map((l) => `• ${l}`).join("<br/>")}</p>
      <p><strong>Description:</strong><br/>${description.replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><strong>Contact</strong><br/>
      Name: ${fullName}<br/>
      Email: ${email}<br/>
      Phone: ${phone}
      </p>
    `;

    try {
      // Persist to database for dashboard tracking if user is authenticated
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user ?? null;
      if (user) {
        const { error: insertError } = await supabase.from("support_calls").insert([
          {
            user_id: user.id,
            client_status: clientStatus ?? "new",
            location,
            issues,
            description,
            contact_name: fullName,
            contact_email: email,
            contact_phone: phone,
            status: "open",
          },
        ]);
        if (insertError) {
          console.error("Insert support_call failed", insertError);
        }
      }

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: [
            "nikita@siyakhatechnology.co.za",
            "accounts@siyakhatechnology.co.za",
            "admin@siyakhatechnology.co.za",
          ],
          subject,
          html,
        },
      });

      if (error) throw error;

      toast({ title: "Request submitted", description: user ? "Track it in your dashboard." : "Our team will reach out shortly." });
      setStep(6);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Could not send request", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Signed out", description: "You have been logged out." });
      setClientStatus(null);
      setUserEmail(null);
    } catch (e: any) {
      toast({ title: "Sign out failed", description: e.message ?? "Please try again.", variant: "destructive" });
    }
  };

  const StepHeader = ({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) => (
    <div className="mb-6">
      <div className="text-sm text-muted-foreground">Step {number} of 6</div>
      <h2 className="text-2xl md:text-3xl font-semibold text-primary mt-1">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-10 md:py-14 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Need Help?</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">
              Your tech problems, solved. Whether you’re at a company, school, home, or church, Siyakha’s support team is ready to get you back online — fast.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Support Request</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Step 1 */}
                {step === 1 && (
                  <div>
                    <StepHeader number={1} title="Are You a Client?" />
                    {userEmail && (
                      <div className="mb-4 flex items-center justify-between rounded-md border border-border p-3">
                        <div className="text-sm">Signed in as <span className="font-medium">{userEmail}</span></div>
                        <Button variant="secondary" size="sm" onClick={signOut}>Sign out</Button>
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setClientStatus("registered");
                          setAuthOpen(true);
                        }}
                        className={cn(
                          "rounded-md border border-border p-4 text-left hover:bg-accent/40 transition",
                          clientStatus === "registered" && "ring-2 ring-ring"
                        )}
                      >
                        <div className="text-lg font-medium">✅ Yes, I’m Registered</div>
                        <div className="text-sm text-muted-foreground mt-1">Log in for faster service & tracking</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setClientStatus("new");
                          setAuthOpen(true);
                        }}
                        className={cn(
                          "rounded-md border border-border p-4 text-left hover:bg-accent/40 transition",
                          clientStatus === "new" && "ring-2 ring-ring"
                        )}
                      >
                        <div className="text-lg font-medium">✨ I’m New to Siyakha</div>
                        <div className="text-sm text-muted-foreground mt-1">Register now for priority support</div>
                      </button>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Button onClick={next} className="cta-primary" disabled={!canContinue}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div>
                    <StepHeader number={2} title="Where Do You Need Help?" />
                    <RadioGroup value={location ?? undefined} onValueChange={(v) => setLocation(v as LocationKey)} className="grid gap-3 sm:grid-cols-2">
                      {locationOptions.map((opt) => (
                        <label key={opt.key} className={cn("flex gap-3 items-start rounded-md border border-border p-4 hover:bg-accent/40 cursor-pointer", location === opt.key && "ring-2 ring-ring")}> 
                          <RadioGroupItem value={opt.key} className="mt-1" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </RadioGroup>

                    <div className="mt-6 flex items-center gap-3">
                      <Button variant="secondary" onClick={back}>Back</Button>
                      <Button onClick={next} className="cta-primary" disabled={!canContinue}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div>
                    <StepHeader number={3} title="What’s the Issue?" subtitle="Select one or more" />
                    <div className="grid gap-3">
                      {issueOptions.map((opt) => (
                        <label key={opt.key} className={cn("flex gap-3 items-start rounded-md border border-border p-4 hover:bg-accent/40 cursor-pointer", issues.includes(opt.key) && "ring-2 ring-ring")}> 
                          <Checkbox
                            checked={issues.includes(opt.key)}
                            onCheckedChange={() => toggleIssue(opt.key)}
                            className="mt-1"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Button variant="secondary" onClick={back}>Back</Button>
                      <Button onClick={next} className="cta-primary" disabled={!canContinue}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <div>
                    <StepHeader number={4} title="Describe the Problem" subtitle="Tell us exactly what’s going wrong." />
                    <p className="text-sm text-muted-foreground mb-2">Example: My printer won’t connect to Wi‑Fi and my laptop freezes during startup.</p>
                    <Textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your issue(s) in detail..."
                    />

                    <div className="mt-6 flex items-center gap-3">
                      <Button variant="secondary" onClick={back}>Back</Button>
                      <Button onClick={next} className="cta-primary" disabled={!canContinue}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                  <div>
                    <StepHeader number={5} title="Contact Details" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Button variant="secondary" onClick={back}>Back</Button>
                      <Button onClick={() => setStep(6)} className="cta-primary" disabled={!canContinue}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 6 */}
                {step === 6 && (
                  <div>
                    <StepHeader number={6} title="Let’s Fix It" />
                    <div className="space-y-4">
                      <Button onClick={submit} disabled={loading} className="cta-primary">Get Help Now</Button>
                      <div>
                        <a
                          href={`https://wa.me/27815012993?text=${encodeURIComponent(
                            `Need Help request — ${fullName} (${email}, ${phone})\nLocation: ${location}\nIssues: ${issues.join(", ")}\n\n${description}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                        >
                          Or chat via WhatsApp now
                        </a>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-primary mb-3">Why Siyakha Support?</h3>
                      <ul className="list-disc pl-5 text-foreground space-y-1">
                        <li>Real-Time Tracking – Watch your request progress</li>
                        <li>Fast Response Times – Issues handled quickly</li>
                        <li>Tailored Solutions – We match the right tech to your problem</li>
                        <li>Issue History – We remember past fixes for faster troubleshooting</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{clientStatus === "registered" ? "Sign in for faster service" : "Create an account"}</DialogTitle>
            <DialogDescription>
              {clientStatus === "registered"
                ? "Log in to track your request and get priority support."
                : "Register to get priority support and access to all our IT services."}
            </DialogDescription>
          </DialogHeader>
          <SignInForm />
        </DialogContent>
      </Dialog>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Need Help | Siyakha Technology",
            url: `${window.location.origin}/need-help`,
            description:
              "Fast IT support for company, school, home or church. Computer, printer, Wi‑Fi, server issues — solved quickly by Siyakha.",
          }),
        }}
      />
    </div>
  );
}
