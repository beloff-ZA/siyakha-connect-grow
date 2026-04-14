import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, CheckCircle, Loader2, Shield, Mail, Upload, Search,
  ArrowRight, ArrowLeft, User, Building2, Palette, GlobeLock,
  Plus, Minus, FileText, Image, X, Check, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import websiteOfferBanner from "@/assets/website-offer-banner.png";

const TOTAL_STEPS = 8;

const PACKAGES = [
  { value: "starter", label: "Starter – R199/mo", price: 199, description: "Single-page website, mobile-friendly, SEO basics" },
  { value: "business", label: "Business – R399/mo", price: 399, description: "Multi-page site, contact forms, Office 365 email setup" },
  { value: "premium", label: "Premium – R599/mo", price: 599, description: "E-commerce ready, Office 365, ESET security, priority support" },
  { value: "enterprise", label: "Enterprise – R999/mo", price: 999, description: "Custom build, Office 365 suite, ESET endpoint protection, analytics, dedicated support" },
];

const PAGE_OPTIONS = [
  { value: "1", label: "1 page (Landing page)" },
  { value: "3", label: "3 pages (Home, About, Contact)" },
  { value: "5", label: "5 pages (Standard business site)" },
  { value: "8", label: "8 pages (Full business site)" },
  { value: "10+", label: "10+ pages (Large / E-commerce)" },
];

const INDUSTRIES = [
  "Retail / E-commerce", "Professional Services", "Healthcare", "Education",
  "Hospitality / Restaurant", "Construction / Property", "Technology",
  "Non-Profit / NGO", "Other",
];

type DomainStatus = "idle" | "checking" | "available" | "taken" | "unknown";

const WebsiteOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Profile
  const [profile, setProfile] = useState({
    fullName: "", email: "", phone: "", company: "", idNumber: "", address: "",
  });

  // Step 2: Business
  const [business, setBusiness] = useState({
    about: "", currentWebsite: "", industry: "", yearsInBusiness: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 3: Website Requirements
  const [requirements, setRequirements] = useState({
    pages: "", designStyle: "", features: "",
  });
  const [mockupFiles, setMockupFiles] = useState<File[]>([]);
  const [mockupPreviews, setMockupPreviews] = useState<string[]>([]);

  // Step 4: Domain
  const [domainInput, setDomainInput] = useState("");
  const [domainStatus, setDomainStatus] = useState<DomainStatus>("idle");
  const [domainMessage, setDomainMessage] = useState("");
  const [checkedDomain, setCheckedDomain] = useState("");
  const [hasExistingDomain, setHasExistingDomain] = useState(false);

  // Step 5: Add-ons
  const [addons, setAddons] = useState({
    esetLicenses: 0, microsoftLicenses: 0,
  });

  // Step 6: Package
  const [selectedPackage, setSelectedPackage] = useState("");

  // Step 7: Banking
  const [banking, setBanking] = useState({
    bankName: "", accountHolder: "", accountNumber: "",
    accountType: "", branchCode: "", debitDay: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    document.title = "Order a Website – From R199/mo | Siyakha";
  }, []);

  // File upload handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Logo must be under 5MB.", variant: "destructive" });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleMockupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (mockupFiles.length + files.length > 5) {
      toast({ title: "Too many files", description: "Maximum 5 reference images.", variant: "destructive" });
      return;
    }
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    setMockupFiles(prev => [...prev, ...validFiles]);
    setMockupPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeMockup = (idx: number) => {
    setMockupFiles(prev => prev.filter((_, i) => i !== idx));
    setMockupPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Domain check
  const checkDomain = async () => {
    if (!domainInput.trim()) return;
    setDomainStatus("checking");
    setDomainMessage("");
    try {
      const { data, error } = await supabase.functions.invoke("check-domain", {
        body: { domain: domainInput.trim() },
      });
      if (error) throw error;
      setCheckedDomain(data.domain);
      if (data.available === true) {
        setDomainStatus("available");
      } else if (data.available === false) {
        setDomainStatus("taken");
      } else {
        setDomainStatus("unknown");
      }
      setDomainMessage(data.message || "");
    } catch {
      setDomainStatus("unknown");
      setDomainMessage("Could not check domain. We'll verify manually.");
    }
  };

  // Upload files to storage
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("website-orders").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data: urlData } = supabase.storage.from("website-orders").getPublicUrl(path);
    return urlData.publicUrl;
  };

  // Step validation
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1: return !!(profile.fullName && profile.email && profile.phone && profile.idNumber && profile.address);
      case 2: return !!(business.about && business.industry);
      case 3: return !!requirements.pages;
      case 4: return hasExistingDomain || domainStatus === "available" || domainStatus === "unknown" || domainStatus === "taken";
      case 5: return !!selectedPackage;
      case 6: return true;
      case 7: return !!(banking.bankName && banking.accountHolder && banking.accountNumber && banking.accountType && banking.branchCode && banking.debitDay && agreeTerms);
      case 8: return true;
      default: return false;
    }
  }, [step, profile, business, requirements, domainStatus, hasExistingDomain, selectedPackage, banking, agreeTerms]);

  // Calculate total
  const pkg = PACKAGES.find(p => p.value === selectedPackage);
  const esetCost = addons.esetLicenses * 49;
  const m365Cost = addons.microsoftLicenses * 99;
  const totalMonthly = (pkg?.price || 0) + esetCost + m365Cost;

  // Submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload logo
      let logoUrl = "";
      if (logoFile) {
        logoUrl = (await uploadFile(logoFile, "logos")) || "";
      }

      // Upload mockups
      const mockupUrls: string[] = [];
      for (const file of mockupFiles) {
        const url = await uploadFile(file, "mockups");
        if (url) mockupUrls.push(url);
      }

      const emailHtml = `
<h2 style="color:#1a365d;">🌐 New Website Order</h2>
<hr/>

<h3>👤 Client Profile</h3>
<table style="border-collapse:collapse;width:100%;">
<tr><td style="padding:4px 12px;font-weight:bold;">Full Name</td><td>${profile.fullName}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Email</td><td>${profile.email}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Phone</td><td>${profile.phone}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Company</td><td>${profile.company || "N/A"}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">ID Number</td><td>${profile.idNumber}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Address</td><td>${profile.address}</td></tr>
</table>

<h3>🏢 Business Details</h3>
<table style="border-collapse:collapse;width:100%;">
<tr><td style="padding:4px 12px;font-weight:bold;">Industry</td><td>${business.industry}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Years in Business</td><td>${business.yearsInBusiness || "N/A"}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Current Website</td><td>${business.currentWebsite || "None"}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">About</td><td>${business.about}</td></tr>
${logoUrl ? `<tr><td style="padding:4px 12px;font-weight:bold;">Logo</td><td><a href="${logoUrl}">View Logo</a></td></tr>` : ""}
</table>

<h3>🎨 Website Requirements</h3>
<table style="border-collapse:collapse;width:100%;">
<tr><td style="padding:4px 12px;font-weight:bold;">Pages</td><td>${requirements.pages}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Design Style</td><td>${requirements.designStyle || "No preference"}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Features</td><td>${requirements.features || "None specified"}</td></tr>
</table>
${mockupUrls.length > 0 ? `<p><strong>Reference Images:</strong><br/>${mockupUrls.map((u, i) => `<a href="${u}">Mockup ${i + 1}</a>`).join(" | ")}</p>` : ""}

<h3>🌍 Domain</h3>
<p><strong>${hasExistingDomain ? "Existing domain" : "Requested domain"}:</strong> ${hasExistingDomain ? business.currentWebsite : checkedDomain || domainInput}</p>
<p><strong>Status:</strong> ${hasExistingDomain ? "Client owns this domain" : domainStatus === "available" ? "✅ Available" : domainStatus === "taken" ? "❌ Already registered" : "⚠️ Needs manual check"}</p>

<h3>➕ Add-ons</h3>
<table style="border-collapse:collapse;width:100%;">
<tr><td style="padding:4px 12px;font-weight:bold;">ESET Licenses</td><td>${addons.esetLicenses} × R49/mo = R${esetCost}/mo</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Microsoft 365 Licenses</td><td>${addons.microsoftLicenses} × R99/mo = R${m365Cost}/mo</td></tr>
</table>

<h3>📦 Package Selected</h3>
<p><strong>${pkg?.label}</strong> — ${pkg?.description}</p>

<h3 style="color:#16a34a;">💰 Total Monthly: R${totalMonthly}/mo</h3>

<h3>🏦 Banking Details</h3>
<table style="border-collapse:collapse;width:100%;">
<tr><td style="padding:4px 12px;font-weight:bold;">Bank</td><td>${banking.bankName}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Account Holder</td><td>${banking.accountHolder}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Account Number</td><td>${banking.accountNumber}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Account Type</td><td>${banking.accountType}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Branch Code</td><td>${banking.branchCode}</td></tr>
<tr><td style="padding:4px 12px;font-weight:bold;">Debit Day</td><td>${banking.debitDay}st of the month</td></tr>
</table>

<hr/>
<p><em>Submitted via Siyakha website — ${new Date().toLocaleString("en-ZA")}</em></p>
      `.trim();

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: ["nikita@siyakhatechnology.co.za", "ben@siyakhatechnology.co.za"],
          subject: `🌐 New Website Order – ${profile.fullName} (${pkg?.label}) – R${totalMonthly}/mo`,
          html: emailHtml,
        },
      });

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Order submitted!", description: "We'll be in touch shortly." });
    } catch (err) {
      console.error("Submit failed:", err);
      toast({ title: "Submission failed", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <CheckCircle className="w-20 h-20 text-primary mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-3">Order Received!</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Thank you, {profile.fullName}. We have everything we need to start building your website. Our team will be in touch within 24 hours.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-8 text-sm text-muted-foreground">
            <p><strong>Package:</strong> {pkg?.label}</p>
            <p><strong>Monthly Total:</strong> R{totalMonthly}/mo</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const stepLabels = ["Profile", "Business", "Website", "Domain", "Package", "Add-ons", "Payment", "Review"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <img src={websiteOfferBanner} alt="Complete client websites from R199/mo" className="mx-auto w-full max-w-md rounded-2xl shadow-xl mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Get Your Website – From <span className="text-primary">R199/mo</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete the steps below. By the end, we'll have everything needed to build your site.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm text-muted-foreground">{stepLabels[step - 1]}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Step 1: Profile */}
          {step === 1 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Your Profile</CardTitle>
                </div>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full Name *</Label>
                  <Input required value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" required value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input type="tel" required value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="081 234 5678" />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>ID / Passport Number *</Label>
                  <Input required value={profile.idNumber} onChange={e => setProfile(p => ({ ...p, idNumber: e.target.value }))} placeholder="For debit order verification" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Physical Address *</Label>
                  <Input required value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Business */}
          {step === 2 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle>About Your Business</CardTitle>
                </div>
                <CardDescription>Help us understand your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Select value={business.industry} onValueChange={v => setBusiness(b => ({ ...b, industry: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Years in Business</Label>
                  <Input value={business.yearsInBusiness} onChange={e => setBusiness(b => ({ ...b, yearsInBusiness: e.target.value }))} placeholder="e.g. 5 years" />
                </div>
                <div className="space-y-2">
                  <Label>Current Website (if any)</Label>
                  <Input value={business.currentWebsite} onChange={e => setBusiness(b => ({ ...b, currentWebsite: e.target.value }))} placeholder="https://www.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>About Your Business *</Label>
                  <Textarea value={business.about} onChange={e => setBusiness(b => ({ ...b, about: e.target.value }))} placeholder="Tell us what your business does, your target audience, and what makes you unique..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Upload Your Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    {logoPreview ? (
                      <div className="space-y-3">
                        <img src={logoPreview} alt="Logo preview" className="mx-auto h-24 object-contain" />
                        <Button variant="ghost" size="sm" onClick={() => { setLogoFile(null); setLogoPreview(null); }}>
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload (max 5MB)</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Website Requirements */}
          {step === 3 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <CardTitle>Website Requirements</CardTitle>
                </div>
                <CardDescription>What do you need your website to look like?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>How many pages? *</Label>
                  <Select value={requirements.pages} onValueChange={v => setRequirements(r => ({ ...r, pages: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select number of pages" /></SelectTrigger>
                    <SelectContent>
                      {PAGE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Design Style / Preferences</Label>
                  <Textarea value={requirements.designStyle} onChange={e => setRequirements(r => ({ ...r, designStyle: e.target.value }))} placeholder="e.g. Modern & minimal, bold colours, similar to www.example.com..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Special Features</Label>
                  <Textarea value={requirements.features} onChange={e => setRequirements(r => ({ ...r, features: e.target.value }))} placeholder="e.g. Online booking, product catalog, blog, contact form, payment gateway..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Upload Reference Images / Mockups</Label>
                  <p className="text-xs text-muted-foreground">Show us what you'd like your website to look like (max 5 images)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mockupPreviews.map((src, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                        <img src={src} alt={`Mockup ${i + 1}`} className="w-full h-28 object-cover" />
                        <button onClick={() => removeMockup(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {mockupFiles.length < 5 && (
                      <label className="border-2 border-dashed border-border rounded-lg h-28 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Image className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleMockupChange} />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Domain */}
          {step === 4 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GlobeLock className="w-5 h-5 text-primary" />
                  <CardTitle>Domain Name</CardTitle>
                </div>
                <CardDescription>Check if your desired domain is available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <Checkbox id="hasDomain" checked={hasExistingDomain} onCheckedChange={v => setHasExistingDomain(!!v)} />
                  <Label htmlFor="hasDomain" className="cursor-pointer text-sm">I already own a domain name</Label>
                </div>

                {hasExistingDomain ? (
                  <div className="space-y-2">
                    <Label>Your Existing Domain</Label>
                    <Input value={business.currentWebsite} onChange={e => setBusiness(b => ({ ...b, currentWebsite: e.target.value }))} placeholder="www.yourdomain.co.za" />
                    <p className="text-xs text-muted-foreground">We'll help you point this domain to your new website.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Desired Domain Name</Label>
                      <div className="flex gap-2">
                        <Input value={domainInput} onChange={e => { setDomainInput(e.target.value); setDomainStatus("idle"); }} placeholder="mybusiness.co.za" className="flex-1" />
                        <Button onClick={checkDomain} disabled={!domainInput.trim() || domainStatus === "checking"} variant="outline">
                          {domainStatus === "checking" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          <span className="ml-1.5 hidden sm:inline">Check</span>
                        </Button>
                      </div>
                    </div>

                    {domainStatus !== "idle" && domainStatus !== "checking" && (
                      <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                        domainStatus === "available" ? "border-primary/30 bg-primary/5" :
                        domainStatus === "taken" ? "border-destructive/30 bg-destructive/5" :
                        "border-accent/30 bg-accent/5"
                      }`}>
                        {domainStatus === "available" ? <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" /> :
                         domainStatus === "taken" ? <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" /> :
                         <AlertCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />}
                        <div>
                          <p className="font-medium text-foreground">{checkedDomain}</p>
                          <p className="text-sm text-muted-foreground">{domainMessage}</p>
                          {domainStatus === "taken" && (
                            <p className="text-sm text-muted-foreground mt-1">Try a different domain name or extension (.co.za, .com, .net).</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Add-ons (after package selection) */}
          {step === 6 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <CardTitle>Add-ons</CardTitle>
                </div>
                <CardDescription>Optional extras — quoted monthly alongside your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Microsoft 365 */}
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Microsoft 365 Licenses</p>
                        <p className="text-xs text-muted-foreground">Professional email, Word, Excel, Teams — R99/license/mo</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Button variant="outline" size="icon" onClick={() => setAddons(a => ({ ...a, microsoftLicenses: Math.max(0, a.microsoftLicenses - 1) }))} disabled={addons.microsoftLicenses === 0}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-2xl font-bold w-10 text-center text-foreground">{addons.microsoftLicenses}</span>
                    <Button variant="outline" size="icon" onClick={() => setAddons(a => ({ ...a, microsoftLicenses: a.microsoftLicenses + 1 }))}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    {addons.microsoftLicenses > 0 && (
                      <Badge variant="secondary" className="ml-auto">R{addons.microsoftLicenses * 99}/mo</Badge>
                    )}
                  </div>
                </div>

                {/* ESET */}
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">ESET Endpoint Security</p>
                        <p className="text-xs text-muted-foreground">Antivirus & endpoint protection — R49/license/mo</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Button variant="outline" size="icon" onClick={() => setAddons(a => ({ ...a, esetLicenses: Math.max(0, a.esetLicenses - 1) }))} disabled={addons.esetLicenses === 0}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-2xl font-bold w-10 text-center text-foreground">{addons.esetLicenses}</span>
                    <Button variant="outline" size="icon" onClick={() => setAddons(a => ({ ...a, esetLicenses: a.esetLicenses + 1 }))}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    {addons.esetLicenses > 0 && (
                      <Badge variant="secondary" className="ml-auto">R{addons.esetLicenses * 49}/mo</Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">Add-ons are optional. You can skip this step.</p>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Package */}
          {step === 5 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Select a Package</CardTitle>
                </div>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PACKAGES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPackage(p.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPackage === p.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{p.label}</p>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      </div>
                      {selectedPackage === p.value && <Check className="w-5 h-5 text-primary shrink-0" />}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 7: Banking */}
          {step === 7 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Debit Order Details</CardTitle>
                <CardDescription>For monthly payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bank Name *</Label>
                    <Input required value={banking.bankName} onChange={e => setBanking(b => ({ ...b, bankName: e.target.value }))} placeholder="e.g. FNB, Standard Bank" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder *</Label>
                    <Input required value={banking.accountHolder} onChange={e => setBanking(b => ({ ...b, accountHolder: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number *</Label>
                    <Input required value={banking.accountNumber} onChange={e => setBanking(b => ({ ...b, accountNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type *</Label>
                    <Select value={banking.accountType} onValueChange={v => setBanking(b => ({ ...b, accountType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cheque">Cheque / Current</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="transmission">Transmission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Code *</Label>
                    <Input required value={banking.branchCode} onChange={e => setBanking(b => ({ ...b, branchCode: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Debit Day *</Label>
                    <Select value={banking.debitDay} onValueChange={v => setBanking(b => ({ ...b, debitDay: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st of the month</SelectItem>
                        <SelectItem value="15">15th of the month</SelectItem>
                        <SelectItem value="25">25th of the month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 mt-4">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={v => setAgreeTerms(!!v)} />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I authorise Siyakha Tech Solutions (Pty) Ltd to debit my bank account monthly for the total amount. I understand this is a recurring debit order that I may cancel with 30 days' written notice.
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 8: Review */}
          {step === 8 && (
            <div className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>Please confirm all details are correct</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-foreground mb-1">👤 Profile</p>
                      <p className="text-muted-foreground">{profile.fullName}</p>
                      <p className="text-muted-foreground">{profile.email}</p>
                      <p className="text-muted-foreground">{profile.phone}</p>
                      {profile.company && <p className="text-muted-foreground">{profile.company}</p>}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">🏢 Business</p>
                      <p className="text-muted-foreground">{business.industry}</p>
                      <p className="text-muted-foreground line-clamp-2">{business.about}</p>
                      {logoPreview && <img src={logoPreview} alt="Logo" className="h-10 mt-1 object-contain" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">🎨 Website</p>
                      <p className="text-muted-foreground">{requirements.pages} page(s)</p>
                      {requirements.designStyle && <p className="text-muted-foreground line-clamp-1">{requirements.designStyle}</p>}
                      {mockupFiles.length > 0 && <p className="text-muted-foreground">{mockupFiles.length} reference image(s)</p>}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">🌍 Domain</p>
                      <p className="text-muted-foreground">
                        {hasExistingDomain ? business.currentWebsite || "Existing domain" : checkedDomain || domainInput || "Not specified"}
                      </p>
                      {!hasExistingDomain && domainStatus === "available" && <Badge className="bg-primary text-primary-foreground text-xs mt-1">Available</Badge>}
                      {!hasExistingDomain && domainStatus === "taken" && <Badge variant="destructive" className="text-xs mt-1">Taken</Badge>}
                    </div>
                  </div>

                  <hr className="border-border" />

                  <div>
                    <p className="font-semibold text-foreground mb-2">💰 Pricing Summary</p>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">{pkg?.label}</span><span className="text-foreground">R{pkg?.price}/mo</span></div>
                      {addons.microsoftLicenses > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">Microsoft 365 × {addons.microsoftLicenses}</span><span className="text-foreground">R{m365Cost}/mo</span></div>
                      )}
                      {addons.esetLicenses > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">ESET Security × {addons.esetLicenses}</span><span className="text-foreground">R{esetCost}/mo</span></div>
                      )}
                      <hr className="border-border" />
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total Monthly</span>
                        <span className="text-primary">R{totalMonthly}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>🏦 {banking.bankName} •••{banking.accountNumber.slice(-4)}</span>
                    <span>Debit: {banking.debitDay}st</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-primary hover:bg-primary/90">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Order <Check className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default WebsiteOrder;
