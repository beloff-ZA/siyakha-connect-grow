import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";

const SKILLS = [
  "CCTV & AI Surveillance",
  "Fibre Splicing & OTDR",
  "Structured Cabling",
  "Enterprise Wi-Fi",
  "Networking (L2/L3)",
  "VoIP & PBX",
  "Solar & Off-Grid",
  "EV Charging Installations",
  "Smart Home Automation",
  "Access Control & Biometrics",
  "Intercom & Intercom Apps",
  "Mikrotik / Ubiquiti / Cisco",
  "Server & Rack Installations",
  "Drone Surveillance",
  "Web / SaaS Development",
];

const REGIONS = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Namibia",
  "Botswana",
  "Zimbabwe",
  "Mozambique",
  "Eswatini",
  "Lesotho",
];

const accountSchema = z.object({
  email: z.string().trim().email("Valid email required").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

const profileSchema = z.object({
  company_name: z.string().trim().min(2, "Company name required").max(150),
  company_registration: z.string().trim().max(80).optional().or(z.literal("")),
  contact_person: z.string().trim().min(2, "Contact name required").max(120),
  phone: z.string().trim().min(7, "Valid phone required").max(30),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  years_experience: z.coerce.number().int().min(0).max(80).optional(),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
});

type CertFile = { file: File; name: string; issuer: string };

const STEPS = ["Account", "Company", "Skills & Regions", "Certificates", "Review"] as const;

const PartnerEngineers: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [account, setAccount] = useState({ email: "", password: "" });
  const [profile, setProfile] = useState({
    company_name: "",
    company_registration: "",
    contact_person: "",
    phone: "",
    address: "",
    city: "",
    country: "South Africa",
    years_experience: "" as string | number,
    bio: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [certs, setCerts] = useState<CertFile[]>([]);

  useEffect(() => {
    document.title = "Become a Partner Engineer | Siyakha Interlink";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute(
      "content",
      "Register your company and technician profile, upload certificates, and join the Siyakha Interlink partner engineer network across Southern Africa."
    );
    if (!meta.parentNode) document.head.appendChild(meta);
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, []);

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const onCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) {
      toast({ title: "Some files too large", description: "Max 5MB per file.", variant: "destructive" as any });
    }
    setCerts((prev) => [
      ...prev,
      ...valid.map((f) => ({ file: f, name: f.name.replace(/\.[^.]+$/, ""), issuer: "" })),
    ]);
    e.target.value = "";
  };

  const next = () => {
    if (step === 0) {
      const r = accountSchema.safeParse(account);
      if (!r.success) {
        toast({ title: "Check your details", description: r.error.issues[0].message, variant: "destructive" as any });
        return;
      }
    }
    if (step === 1) {
      const r = profileSchema.safeParse({
        ...profile,
        years_experience: profile.years_experience === "" ? undefined : profile.years_experience,
      });
      if (!r.success) {
        toast({ title: "Check your details", description: r.error.issues[0].message, variant: "destructive" as any });
        return;
      }
    }
    if (step === 2 && (skills.length === 0 || regions.length === 0)) {
      toast({ title: "Select at least one", description: "Pick your skills and the regions you cover.", variant: "destructive" as any });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      // 1. Create account
      const redirectUrl = `${window.location.origin}/partner-engineers`;
      const { data: signup, error: signErr } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { contact_person: profile.contact_person, company_name: profile.company_name },
        },
      });
      if (signErr) throw signErr;
      const userId = signup.user?.id;
      if (!userId) throw new Error("Account created but no user ID returned. Please check your email and sign in.");

      // 2. Get session (auto-confirm may or may not be enabled)
      let session = signup.session;
      if (!session) {
        const { data: signIn, error: siErr } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
        if (siErr) {
          // Email confirmation required
          toast({
            title: "Check your email",
            description: "Confirm your email, then sign in to finish your registration.",
          });
          setSuccess(true);
          return;
        }
        session = signIn.session;
      }

      // 3. Insert engineer profile
      const { data: engineer, error: engErr } = await supabase
        .from("partner_engineers")
        .insert({
          user_id: userId,
          company_name: profile.company_name.trim(),
          company_registration: profile.company_registration?.trim() || null,
          contact_person: profile.contact_person.trim(),
          email: account.email.trim(),
          phone: profile.phone.trim(),
          address: profile.address?.trim() || null,
          city: profile.city?.trim() || null,
          country: profile.country?.trim() || "South Africa",
          skills,
          service_regions: regions,
          bio: profile.bio?.trim() || null,
          years_experience: profile.years_experience === "" ? null : Number(profile.years_experience),
          status: "pending",
        })
        .select()
        .single();
      if (engErr) throw engErr;

      // 4. Upload certificates
      for (const c of certs) {
        const ext = c.file.name.split(".").pop() || "bin";
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("engineer-certificates")
          .upload(path, c.file, { contentType: c.file.type });
        if (upErr) {
          console.error("Upload failed", upErr);
          continue;
        }
        await supabase.from("engineer_certificates").insert({
          engineer_id: engineer.id,
          user_id: userId,
          name: c.name.trim() || c.file.name,
          issuer: c.issuer.trim() || null,
          file_path: path,
          file_name: c.file.name,
        });
      }

      setSuccess(true);
      toast({ title: "Welcome aboard", description: "Your profile is submitted for review." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Registration failed", description: e.message || "Please try again.", variant: "destructive" as any });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-xl text-center">
            <CheckCircle2 className="h-14 w-14 mx-auto mb-6" strokeWidth={1.25} />
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-4">
              Profile submitted
            </h1>
            <p className="text-foreground/70 leading-relaxed mb-8">
              Thank you for joining the Siyakha Interlink partner network. Our team will review your
              profile and certificates, then reach out about projects in your region.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-foreground text-background border-b border-border">
          <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-6">
              The Siyakha Network · SMMEs & Engineers · Southern Africa
            </p>
            <h1 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em] max-w-4xl">
              Join the <span className="italic font-extralight">Siyakha Network</span>.
              <br />
              An installer & engineer network built with SMMEs, for projects.
            </h1>
            <p className="mt-8 max-w-2xl text-base md:text-lg text-background/75 leading-relaxed font-light">
              We're building a national network of SMMEs, installers and L2/L3 engineers to deliver
              smart estate, fibre, CCTV and connectivity projects across South Africa and SADC.
              Register your company, list your skills and regions, upload your certificates — and
              get deployed on live projects in your area.
            </p>
            <div className="mt-10 grid sm:grid-cols-3 gap-px bg-background/10 max-w-3xl">
              <div className="bg-foreground p-5">
                <p className="text-2xl font-display font-light">SMME-first</p>
                <p className="text-xs text-background/60 mt-1 uppercase tracking-[0.18em]">Built with small businesses</p>
              </div>
              <div className="bg-foreground p-5">
                <p className="text-2xl font-display font-light">Project work</p>
                <p className="text-xs text-background/60 mt-1 uppercase tracking-[0.18em]">Real deployments, paid scopes</p>
              </div>
              <div className="bg-foreground p-5">
                <p className="text-2xl font-display font-light">Pan-SADC</p>
                <p className="text-xs text-background/60 mt-1 uppercase tracking-[0.18em]">South Africa & neighbours</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stepper */}
        <section className="container mx-auto px-6 lg:px-10 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-10 gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1 flex items-center gap-2 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      i <= step
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground/40 border-border"
                    }`}
                  >
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] md:text-xs uppercase tracking-[0.18em] truncate ${
                      i <= step ? "text-foreground" : "text-foreground/40"
                    }`}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="hidden md:block flex-1 h-px bg-border" />}
                </div>
              ))}
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display font-light text-2xl tracking-tight">
                  {STEPS[step]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 0 && (
                  <>
                    <p className="text-sm text-foreground/70 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Your account lets you update your profile and certificates anytime.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={account.email}
                        onChange={(e) => setAccount({ ...account, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password * (min 8 characters)</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={account.password}
                        onChange={(e) => setAccount({ ...account, password: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company name *</Label>
                        <Input id="company" value={profile.company_name} onChange={(e) => setProfile({ ...profile, company_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg">Registration number</Label>
                        <Input id="reg" value={profile.company_registration} onChange={(e) => setProfile({ ...profile, company_registration: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact person *</Label>
                        <Input id="contact" value={profile.contact_person} onChange={(e) => setProfile({ ...profile, contact_person: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exp">Years of experience</Label>
                        <Input id="exp" type="number" min={0} max={80} value={profile.years_experience} onChange={(e) => setProfile({ ...profile, years_experience: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Short bio</Label>
                      <Textarea id="bio" rows={4} maxLength={1000} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about your company, team size, flagship projects..." />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-3 block">Skills & specialisations *</Label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {SKILLS.map((s) => (
                          <label key={s} className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <Checkbox checked={skills.includes(s)} onCheckedChange={() => toggle(skills, s, setSkills)} />
                            <span className="text-sm">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-3 block mt-6">Service regions *</Label>
                      <div className="grid sm:grid-cols-3 gap-2">
                        {REGIONS.map((r) => (
                          <label key={r} className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <Checkbox checked={regions.includes(r)} onCheckedChange={() => toggle(regions, r, setRegions)} />
                            <span className="text-sm">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="text-sm text-foreground/70">
                      Upload certificates, qualifications, PSIRA, or vendor accreditations (Cisco, Mikrotik, CompTIA, Ubiquiti, etc.). PDF or image, max 5MB each.
                    </p>
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-md py-10 cursor-pointer hover:bg-muted/40 transition-colors">
                      <Upload className="h-6 w-6 text-foreground/60" strokeWidth={1.5} />
                      <span className="text-sm text-foreground/70">Click to upload certificates</span>
                      <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={onCertUpload} />
                    </label>
                    {certs.length > 0 && (
                      <div className="space-y-3">
                        {certs.map((c, i) => (
                          <div key={i} className="border border-border rounded-md p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs text-foreground/60 truncate">{c.file.name}</p>
                              <button type="button" onClick={() => setCerts(certs.filter((_, j) => j !== i))} className="text-foreground/60 hover:text-foreground">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <Input placeholder="Certificate name" value={c.name} onChange={(e) => setCerts(certs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                              <Input placeholder="Issuer (e.g. Cisco)" value={c.issuer} onChange={(e) => setCerts(certs.map((x, j) => j === i ? { ...x, issuer: e.target.value } : x))} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {step === 4 && (
                  <div className="space-y-5 text-sm">
                    <ReviewRow label="Email" value={account.email} />
                    <ReviewRow label="Company" value={profile.company_name} />
                    <ReviewRow label="Contact" value={`${profile.contact_person} · ${profile.phone}`} />
                    <ReviewRow label="Location" value={[profile.city, profile.country].filter(Boolean).join(", ") || "—"} />
                    <ReviewRow label="Skills" value={skills.join(", ") || "—"} />
                    <ReviewRow label="Regions" value={regions.join(", ") || "—"} />
                    <ReviewRow label="Certificates" value={certs.length ? `${certs.length} file${certs.length > 1 ? "s" : ""}` : "None"} />
                    <p className="text-xs text-foreground/60 pt-3 border-t border-border">
                      By submitting, you confirm the details above are accurate. Our team will review your profile and may request additional verification.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button type="button" onClick={next}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={submit} disabled={submitting}>
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting</> : <>Submit registration <ArrowRight className="h-4 w-4" /></>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4">
    <div className="text-xs uppercase tracking-[0.18em] text-foreground/60">{label}</div>
    <div className="col-span-2 text-foreground">{value}</div>
  </div>
);

export default PartnerEngineers;