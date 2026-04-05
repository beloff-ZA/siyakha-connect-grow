import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Monitor, Headphones, Shield, Cloud, Clock, Globe, CheckCircle, ArrowRight, Users, Zap, Server, Lock } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const RemoteITSupport = () => {
  useEffect(() => {
    const title = "Remote IT Support South Africa | Outsourced ICT Helpdesk | Siyakha";
    const description = "Professional remote IT support and outsourced ICT helpdesk for businesses across South Africa. 24/7 monitoring, Microsoft 365 management, cybersecurity & server support from R5,000/month.";
    document.title = title;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(key, value); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/services/remote-it-support`);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}/services/remote-it-support`);
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://siyakha-connect-grow.lovable.app';

  const serviceSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Remote IT Support & Outsourced ICT Helpdesk",
    description: "Professional remote IT support, outsourced helpdesk, server monitoring, Microsoft 365 management, and cybersecurity services for businesses across South Africa.",
    provider: {
      "@type": "Organization",
      name: "Siyakha Tech Solutions (Pty) Ltd",
      url: origin
    },
    areaServed: [
      { "@type": "Country", name: "South Africa" },
      { "@type": "Country", name: "Kenya" },
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Country", name: "Bahrain" },
      { "@type": "AdministrativeArea", name: "EMEA" }
    ],
    serviceType: "Remote IT Support",
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: "5000",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "5000",
        priceCurrency: "ZAR",
        unitText: "month"
      }
    }
  }), [origin]);

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is remote IT support?",
        acceptedAnswer: { "@type": "Answer", text: "Remote IT support is a service where certified technicians troubleshoot, monitor, and manage your IT infrastructure remotely — without needing to visit your premises. This includes server management, Microsoft 365 administration, cybersecurity monitoring, backup management, and helpdesk support." }
      },
      {
        "@type": "Question",
        name: "How much does remote IT support cost in South Africa?",
        acceptedAnswer: { "@type": "Answer", text: "Remote IT support packages start from R5,000 per month for up to 15 users. Pricing scales based on the number of users, devices, and complexity of your environment. Enterprise packages with 24/7 monitoring start from R28,000 per month." }
      },
      {
        "@type": "Question",
        name: "Can you support our business remotely from Johannesburg?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Siyakha provides remote IT support to businesses anywhere in South Africa and internationally. We support clients in Cape Town, Durban, Pretoria, and across Africa and the Middle East from our Johannesburg operations centre." }
      },
      {
        "@type": "Question",
        name: "What is included in an outsourced IT helpdesk?",
        acceptedAnswer: { "@type": "Answer", text: "An outsourced IT helpdesk includes ticket-based support, remote troubleshooting, user account management, software installations, email configuration, printer support, VPN setup, and escalation to on-site engineers when needed." }
      },
      {
        "@type": "Question",
        name: "Do you offer after-hours remote IT support?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our Premium and Enterprise packages include after-hours and 24/7 remote support with guaranteed response times. We also offer proactive monitoring that alerts our team to issues before they impact your business." }
      },
      {
        "@type": "Question",
        name: "What is the difference between remote IT support and managed IT services?",
        acceptedAnswer: { "@type": "Answer", text: "Remote IT support is reactive — you call when something breaks. Managed IT services are proactive — we continuously monitor, maintain, and optimise your entire IT environment. Siyakha offers both, and most clients benefit from a managed approach that prevents downtime." }
      }
    ]
  }), []);

  const services = [
    { icon: Monitor, title: "Remote Desktop Support", desc: "Instant screen-sharing troubleshooting for workstations, laptops, and thin clients across any location." },
    { icon: Server, title: "Server Monitoring & Management", desc: "24/7 proactive monitoring of on-premise and cloud servers with automated alerting and patch management." },
    { icon: Cloud, title: "Microsoft 365 & Cloud Admin", desc: "Full administration of Microsoft 365 tenants, SharePoint, Teams, Exchange Online, and Azure AD." },
    { icon: Lock, title: "Cybersecurity & Endpoint Protection", desc: "Managed antivirus, firewall monitoring, email security, and threat detection across all endpoints." },
    { icon: Headphones, title: "Outsourced IT Helpdesk", desc: "Dedicated helpdesk team handling tickets via phone, email, and WhatsApp with SLA-backed response times." },
    { icon: Shield, title: "Backup & Disaster Recovery", desc: "Automated cloud backups, disaster recovery planning, and rapid restoration to minimise data loss." },
  ];

  const benefits = [
    { icon: Clock, title: "24/7 Availability", desc: "Round-the-clock monitoring and after-hours support options." },
    { icon: Zap, title: "Rapid Response", desc: "Average 15-minute response time on critical tickets." },
    { icon: Globe, title: "Nationwide Coverage", desc: "Support businesses anywhere in South Africa and internationally." },
    { icon: Users, title: "Scalable Teams", desc: "Scale support up or down as your business grows — no hiring overhead." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <img src={heroImage} alt="Remote IT support services" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative container mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/15 text-accent font-medium text-sm mb-6">
              <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
              BEE Level 1 Certified ICT Partner
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Remote IT Support <span className="text-accent">South Africa</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Outsourced ICT helpdesk and remote infrastructure management for businesses of every size. 
              From Microsoft 365 administration to 24/7 server monitoring — trusted by 100+ companies across South Africa and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="cta-primary text-base px-8 py-4 h-auto group">
                <Link to="/contact#quote-form">
                  Get a Remote Support Quote
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-base px-8 py-4 h-auto bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary">
                <a href="https://wa.me/27815012993?text=Hi%20Siyakha%2C%20I%27m%20interested%20in%20remote%20IT%20support" target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl mb-12">
              <div className="accent-line mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Remote ICT Services We Deliver
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive remote IT support and managed services — from helpdesk tickets to full infrastructure management. No on-site visit needed.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s.title} className="p-6 rounded-2xl bg-card border border-border hover:-translate-y-1 transition-all duration-300" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  <div className="icon-badge mb-4"><s.icon className="w-6 h-6 text-accent-foreground" /></div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Remote Support */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Why Outsource Your IT Support to Siyakha?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Skip the cost of hiring in-house IT staff. Get enterprise-grade remote support at a fraction of the price.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="stats-card text-center">
                  <b.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold text-primary mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries We Support Remotely */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Industries We Support Remotely
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                "Accounting Firms", "Law Practices", "Schools & Universities",
                "Healthcare & Clinics", "Retail & Franchises", "Property Management",
                "Logistics & Transport", "Construction", "NPOs & NGOs",
                "Financial Services", "Hospitality", "Manufacturing"
              ].map((industry) => (
                <div key={industry} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-sm font-medium text-foreground">{industry}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
              How Remote IT Support Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { step: "1", title: "Log a Ticket", desc: "Call, email, or WhatsApp us. We create a tracked support ticket instantly." },
                { step: "2", title: "Remote Connection", desc: "Our technician connects securely to your device within minutes." },
                { step: "3", title: "Resolve & Document", desc: "Issue is fixed remotely. Full documentation and resolution notes are logged." },
                { step: "4", title: "Proactive Monitoring", desc: "We continue monitoring your systems to prevent future issues." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
                  <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Frequently Asked Questions About Remote IT Support
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <details key={i} className="p-5 rounded-xl bg-card border border-border group">
                  <summary className="font-semibold text-primary cursor-pointer list-none flex justify-between items-center">
                    {faq.name}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Ready to Outsource Your IT Support?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get a free consultation and custom quote for remote IT support tailored to your business. No long-term contracts required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="cta-primary text-base px-8 py-4 h-auto group">
                <Link to="/contact#quote-form">
                  Request a Free Quote <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-base px-8 py-4 h-auto">
                <Link to="/support-deals">View Support Packages</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <p className="text-muted-foreground mb-4">Explore related services</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/services/cloud-and-edge-solutions"><Button variant="secondary" size="sm">Cloud Solutions</Button></Link>
              <Link to="/managed-it-services-johannesburg"><Button variant="secondary" size="sm">Managed IT Johannesburg</Button></Link>
              <Link to="/cybersecurity-services-johannesburg"><Button variant="secondary" size="sm">Cybersecurity</Button></Link>
              <Link to="/services/smart-collaboration-tools"><Button variant="secondary" size="sm">Microsoft 365 & VoIP</Button></Link>
              <Link to="/services/field-support-services"><Button variant="secondary" size="sm">Field Support</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
};

export default RemoteITSupport;
