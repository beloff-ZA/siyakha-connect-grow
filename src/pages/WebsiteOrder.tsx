import { useState, useEffect } from "react";
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
import { Globe, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PortfolioCubes from "@/components/PortfolioCubes";

const PACKAGES = [
  { value: "starter", label: "Starter – R299/mo", description: "Single-page website, mobile-friendly" },
  { value: "business", label: "Business – R499/mo", description: "Multi-page, contact forms, SEO basics" },
  { value: "premium", label: "Premium – R799/mo", description: "E-commerce ready, analytics, priority support" },
];

const WebsiteOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    idNumber: "",
    address: "",
    package: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    accountType: "",
    branchCode: "",
    debitDay: "",
    additionalNotes: "",
    agreeTerms: false,
  });

  useEffect(() => {
    document.title = "Order a Website – From R299/mo | Siyakha";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Get a professional website for as little as R299/month. Complete your debit order form to get started with Siyakha Tech Solutions.");
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agreeTerms) {
      toast({ title: "Please accept the terms", description: "You must agree to the debit order terms to proceed.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const selectedPkg = PACKAGES.find((p) => p.value === form.package);

    const emailBody = `
<h2>New Website Order – Debit Order Form</h2>
<hr/>
<h3>Client Details</h3>
<p><strong>Full Name:</strong> ${form.fullName}</p>
<p><strong>Email:</strong> ${form.email}</p>
<p><strong>Phone:</strong> ${form.phone}</p>
<p><strong>Company:</strong> ${form.company || "N/A"}</p>
<p><strong>ID Number:</strong> ${form.idNumber}</p>
<p><strong>Address:</strong> ${form.address}</p>

<h3>Package Selected</h3>
<p><strong>${selectedPkg?.label || form.package}</strong> – ${selectedPkg?.description || ""}</p>

<h3>Banking Details</h3>
<p><strong>Bank:</strong> ${form.bankName}</p>
<p><strong>Account Holder:</strong> ${form.accountHolder}</p>
<p><strong>Account Number:</strong> ${form.accountNumber}</p>
<p><strong>Account Type:</strong> ${form.accountType}</p>
<p><strong>Branch Code:</strong> ${form.branchCode}</p>
<p><strong>Preferred Debit Day:</strong> ${form.debitDay}</p>

<h3>Additional Notes</h3>
<p>${form.additionalNotes || "None"}</p>
<hr/>
<p><em>Submitted via Siyakha website – ${new Date().toLocaleString("en-ZA")}</em></p>
    `.trim();

    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: [
            "nikita@siyakhatechnology.co.za",
            "ben@siyakhatechnology.co.za",
          ],
          subject: `New Website Order – ${form.fullName} (${selectedPkg?.label || form.package})`,
          html: emailBody,
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Order submitted!", description: "We'll be in touch shortly to get your website started." });
    } catch (err) {
      console.error("Failed to submit order:", err);
      // Mailto fallback
      const subject = encodeURIComponent(`Website Order – ${form.fullName}`);
      const body = encodeURIComponent(
        `Full Name: ${form.fullName}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany: ${form.company}\nPackage: ${selectedPkg?.label}\nBank: ${form.bankName}\nAccount Holder: ${form.accountHolder}\nAccount Number: ${form.accountNumber}\nAccount Type: ${form.accountType}\nBranch Code: ${form.branchCode}\nDebit Day: ${form.debitDay}\nNotes: ${form.additionalNotes}`
      );
      window.location.href = `mailto:nikita@siyakhatechnology.co.za,ben@siyakhatechnology.co.za?subject=${subject}&body=${body}`;
      toast({ title: "Opening email client", description: "Please send the pre-filled email as a fallback.", variant: "destructive" });
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
            Thank you, {form.fullName}. Our team will review your order and be in touch within 24 hours to kick off your new website.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Get Your Website – From <span className="text-primary">R299/mo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete the form below to set up your monthly debit order. No upfront costs – we'll build and host your professional website.
          </p>
        </div>
      </section>

      {/* Portfolio Cubes */}
      <PortfolioCubes />

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" required value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" required value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="081 234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" value={form.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID / Passport Number *</Label>
                  <Input id="idNumber" required value={form.idNumber} onChange={(e) => handleChange("idNumber", e.target.value)} placeholder="For debit order verification" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Physical Address *</Label>
                  <Input id="address" required value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Full address" />
                </div>
              </CardContent>
            </Card>

            {/* Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select a Package</CardTitle>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={form.package} onValueChange={(v) => handleChange("package", v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map((pkg) => (
                      <SelectItem key={pkg.value} value={pkg.value}>
                        {pkg.label} — {pkg.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Banking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Banking Details</CardTitle>
                <CardDescription>For monthly debit order processing</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input id="bankName" required value={form.bankName} onChange={(e) => handleChange("bankName", e.target.value)} placeholder="e.g. FNB, Standard Bank" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder *</Label>
                  <Input id="accountHolder" required value={form.accountHolder} onChange={(e) => handleChange("accountHolder", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input id="accountNumber" required value={form.accountNumber} onChange={(e) => handleChange("accountNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select value={form.accountType} onValueChange={(v) => handleChange("accountType", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cheque">Cheque / Current</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="transmission">Transmission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code *</Label>
                  <Input id="branchCode" required value={form.branchCode} onChange={(e) => handleChange("branchCode", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debitDay">Preferred Debit Day *</Label>
                  <Select value={form.debitDay} onValueChange={(v) => handleChange("debitDay", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st of the month</SelectItem>
                      <SelectItem value="15">15th of the month</SelectItem>
                      <SelectItem value="25">25th of the month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Anything else we should know?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.additionalNotes}
                  onChange={(e) => handleChange("additionalNotes", e.target.value)}
                  placeholder="e.g. website requirements, design preferences, deadline..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <Checkbox
                id="agreeTerms"
                checked={form.agreeTerms}
                onCheckedChange={(v) => handleChange("agreeTerms", !!v)}
              />
              <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I authorise Siyakha Tech Solutions (Pty) Ltd to debit my bank account monthly for the selected package amount. I understand this is a recurring debit order that I may cancel with 30 days' written notice.
              </Label>
            </div>

            <Button type="submit" size="lg" className="w-full font-semibold text-lg" disabled={loading}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</> : "Submit Debit Order"}
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WebsiteOrder;
