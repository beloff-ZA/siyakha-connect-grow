import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { submitSupportForm } from "@/lib/formSubmission";
import { Wifi, Camera, Monitor, Globe, Headphones, ArrowRight, CheckCircle2, Zap } from "lucide-react";

const services = [
  { id: "wifi", label: "Wi-Fi Installation & Upgrades", icon: Wifi },
  { id: "cctv", label: "CCTV & Surveillance", icon: Camera },
  { id: "networking", label: "Networking & Infrastructure", icon: Monitor },
  { id: "remote-support", label: "Remote IT Support", icon: Headphones },
  { id: "websites", label: "Website Design & Development", icon: Globe },
  { id: "field-support", label: "On-Site / Field Support", icon: Zap },
];

export default function TikTokLanding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", message: "", country: "", businessType: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast({ title: "Please select at least one service", variant: "destructive" });
      return;
    }
    if (!form.name || !form.email || !form.phone || !form.company) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const chosenServices = selected
      .map((id) => services.find((s) => s.id === id)?.label)
      .join(", ");

    await submitSupportForm({
      full_name: form.name,
      email: form.email,
      contact_number: form.phone,
      category: "TikTok Lead",
      description: `Company/Business: ${form.company}\nServices needed: ${chosenServices}\n\nAdditional info:\n${form.message || "None"}`,
      preferred_channel: "tiktok",
    });

    setSubmitting(false);
    setSubmitted(true);
    toast({ title: "Request sent! We'll be in touch shortly." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-[hsl(213,90%,12%)] to-[hsl(213,90%,6%)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-20 h-20 text-accent mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-primary-foreground mb-3">Thank You!</h1>
          <p className="text-primary-foreground/80 text-lg mb-8">
            We've received your request. Our team will contact you shortly.
          </p>
          <Button
            onClick={() => { setSubmitted(false); setSelected([]); setForm({ company: "", name: "", email: "", phone: "", message: "" }); }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[hsl(213,90%,12%)] to-[hsl(213,90%,6%)]">
      {/* Hero */}
      <div className="text-center pt-10 pb-6 px-4">
        <img src="/lovable-uploads/346e18e9-2469-4478-b57e-9492a32e5a91.png" alt="Siyakha Technology" className="h-12 mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight mb-3">
          IT Solutions That <span className="text-accent">Just Work</span>
        </h1>
        <p className="text-primary-foreground/70 text-base md:text-lg max-w-xl mx-auto">
          Select the services you need — we'll get back to you fast.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div>
            <h2 className="text-lg font-semibold text-primary-foreground mb-4">What do you need help with?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.map(({ id, label, icon: Icon }) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                      active
                        ? "border-accent bg-accent/10 text-accent shadow-lg shadow-accent/20"
                        : "border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground/80 hover:border-primary-foreground/40"
                    }`}
                  >
                    {active && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-accent" />}
                    <Icon className="w-7 h-7" />
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-primary-foreground/5 rounded-2xl p-5 border border-primary-foreground/10 space-y-4">
            <h2 className="text-lg font-semibold text-primary-foreground">Your Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-primary-foreground/80 text-xs">Company / Business Name *</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Your company name"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  required
                />
              </div>
              <div>
                <Label className="text-primary-foreground/80 text-xs">Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  required
                />
              </div>
              <div>
                <Label className="text-primary-foreground/80 text-xs">Email Address *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.co.za"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  required
                />
              </div>
              <div>
                <Label className="text-primary-foreground/80 text-xs">Contact Number *</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="081 000 0000"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-primary-foreground/80 text-xs">Additional Info (optional)</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us more about what you need..."
                rows={3}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-lg shadow-accent/30 transition-all"
          >
            {submitting ? "Sending..." : "Get My Free Quote"}
            {!submitting && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>

          <p className="text-center text-primary-foreground/40 text-xs">
            No spam. We'll respond within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
