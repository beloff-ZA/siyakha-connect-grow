import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadMagnet from "@/components/LeadMagnet";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Contact Siyakha Technology Solutions</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">We'd love to learn about your goals. Book a free consultation and our team will get back to you promptly.</p>
            <div className="mt-6">
              <Button className="cta-primary">Request a Quote</Button>
            </div>
          </div>
        </section>
        <LeadMagnet />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
