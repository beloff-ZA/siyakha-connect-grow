import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const services = [
  { value: "infrastructure-and-networking", label: "Infrastructure & Networking" },
  { value: "security-and-surveillance", label: "Security & Surveillance" },
  { value: "cloud-and-edge-solutions", label: "Cloud & Edge Solutions" },
  { value: "smart-collaboration-tools", label: "Smart Collaboration Tools" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const LogACall = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("");
  const [priority, setPriority] = useState("normal");
  const [issue, setIssue] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const title = "Log a Call | Siyakha Technology";
    const description = "Log a support call. Our team will respond promptly. Issues sent to support and accounts.";
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

    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/log-a-call`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/log-a-call`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Log a Call",
    description: "Support request form for Siyakha Technology Solutions",
  }), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !country || !service || !issue) {
      alert("Please complete all required fields.");
      return;
    }
    const subject = encodeURIComponent(`[${priority.toUpperCase()}] Support Call: ${service} - ${company || fullName}`);
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nWhatsApp: ${whatsapp || "(not provided)"}\nCompany: ${company}\nCountry: ${country}\nService: ${service}\nPriority: ${priority}\n\nIssue:\n${issue}`
    );

    toast({
      title: "Call logged",
      description: "Your call has been logged and one of our engineers will be in touch with you shortly.",
    });

    window.location.href = `mailto:accounts@siyakhatechnology.co.za?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Log a Call</h1>
            <p className="text-muted-foreground mt-2">Submit your support request and our team will reach out promptly.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number (optional)</Label>
                  <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. +27 81 501 2993" />
                </div>
                <div>
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="issue">Describe the problem</Label>
                  <Textarea id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} rows={6} required />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" className="cta-primary">Submit</Button>
                <a
                  href={`https://wa.me/27815012993?text=${encodeURIComponent(`Hi Siyakha, I just logged a support call for ${service || 'a service'}. My name is ${fullName}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  Or chat via WhatsApp
                </a>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default LogACall;