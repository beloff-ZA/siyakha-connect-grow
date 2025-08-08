import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadMagnet from "@/components/LeadMagnet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const services = [
  { value: "infrastructure-and-networking", label: "Infrastructure & Networking" },
  { value: "security-and-surveillance", label: "Security & Surveillance" },
  { value: "cloud-and-edge-solutions", label: "Cloud & Edge Solutions" },
  { value: "smart-collaboration-tools", label: "Smart Collaboration Tools" },
];

const Contact = () => {
  useEffect(() => {
    const title = "Contact | Siyakha Technology Solutions";
    const description = "Get in touch with Siyakha Technology Solutions for ICT consulting, networking, security, cloud services, and support.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/contact`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/contact`);
  }, []);

  // Quote form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("");
  const [issues, setIssues] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !country || !service || !issues) {
      alert("Please fill in all required fields.");
      return;
    }

    const subject = encodeURIComponent(`New Quote Request: ${service} - ${fullName}`);
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}\nService: ${service}\n\nProblems/Notes:\n${issues}`
    );

    // Opens the user's mail client to email Nikita with all details
    window.location.href = `mailto:nikita@siyakhatechnology.co.za?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Contact Siyakha Technology Solutions</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">We'd love to learn about your goals. Book a free consultation and our team will get back to you promptly.</p>
            <div className="mt-6">
              <a href="#quote-form" className="inline-flex">
                <Button className="cta-primary">Request a Quote</Button>
              </a>
            </div>
          </div>
        </section>

        {/* Quote Request Form */}
        <section id="quote-form" className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Request a Quote</h2>
            <p className="text-muted-foreground mt-2">Complete the form below — your request will be emailed directly to our team.</p>

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
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
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
                <div className="md:col-span-2">
                  <Label htmlFor="issues">Problems you’re having</Label>
                  <Textarea id="issues" value={issues} onChange={(e) => setIssues(e.target.value)} rows={5} required placeholder="Describe the challenges you’re facing..." />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" className="cta-primary">Send Request</Button>
                <a
                  href="https://wa.me/27815012993?text=Hi%20Siyakha%2C%20I%27d%20like%20a%20quote."
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

        <LeadMagnet />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
