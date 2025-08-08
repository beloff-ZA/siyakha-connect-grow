import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const About = () => {
  // SEO setup
  useEffect(() => {
    const title = "About Siyakha Technology Solutions | Trusted ICT Partner";
    const description = "Learn about Siyakha Technology Solutions — a South African ICT partner delivering networking, security, cloud, and support for businesses locally and globally.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/about`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/about`);
  }, []);

  const orgJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Siyakha Technology Solutions",
    url: `${window.location.origin}`,
    sameAs: [
      `${window.location.origin}`
    ],
    description:
      "South African ICT company delivering networking, security, cloud, VoIP, and managed IT support for businesses locally and internationally.",
  }), []);

  const pillars = [
    {
      title: "Excellence in Service",
      body: "Consistent, reliable quality in every product, project, and support request.",
      icon: "✅",
    },
    {
      title: "Integrity & Accountability",
      body: "Ethical, transparent operations focused on long-term success.",
      icon: "🤝",
    },
    {
      title: "Efficiency & Innovation",
      body: "We streamline processes while staying at the cutting edge of technology.",
      icon: "💼",
    },
    {
      title: "Client-Centric Culture",
      body: "We listen, adapt, and go the extra mile to build lasting relationships.",
      icon: "💬",
    },
  ];

  const reasons = [
    "Scalable network & infrastructure design",
    "Enterprise-grade VoIP, CCTV & security systems",
    "Cloud collaboration with Microsoft 365 & Google Workspace",
    "Reliable remote support & IT management",
    "Secure and responsive website development",
    "Ongoing consulting & on-site technical support",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Enterprise IT solutions background" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <header className="max-w-4xl">
              <p className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-4">
                About Siyakha Technology Solutions
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
                Empowering businesses with trusted IT solutions — locally and globally.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                We don’t just offer technology — we build partnerships rooted in trust, performance, and long-term value. We deliver tailored, future‑ready solutions that help businesses operate smarter, safer, and faster.
              </p>
            </header>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 items-start">
            <article>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Why Clients Choose Siyakha</h2>
              <p className="text-muted-foreground mb-6">
                Technology should enable — not complicate — your business. That’s why our clients rely on us for:
              </p>
              <ul className="space-y-3">
                {reasons.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mt-1 mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">●</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-6">
                From schools and businesses in Johannesburg to international clients in Bahrain, Angola, Swaziland, California, and beyond — we deliver solutions that work.
              </p>
            </article>

            <aside className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-primary mb-4">Partner With Us</h3>
              <p className="text-muted-foreground mb-6">
                Whether you’re upgrading your infrastructure, rolling out a new network, or need trusted support — Siyakha is here to help.
              </p>
              <Button className="cta-primary w-full sm:w-auto">Contact Us</Button>
            </aside>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-8">Our Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((p) => (
                <div key={p.title} className="bg-card border border-border rounded-xl p-6 h-full">
                  <div className="text-3xl mb-3" aria-hidden>{p.icon}</div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{p.title}</h3>
                  <p className="text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team & Reach */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 items-start">
            <article>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Our Team: Passionate People, Proven Results</h2>
              <p className="text-muted-foreground">
                Behind every Siyakha solution is a team of technologists, strategists, and support professionals who are passionate about client success. We bring decades of combined experience across ICT infrastructure, cloud solutions, cybersecurity, and digital transformation.
              </p>
            </article>
            <article>
              <h3 className="text-xl font-semibold text-primary mb-3">Where We Operate</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground">
                <li>South Africa: Johannesburg, Cape Town, Durban, Pretoria</li>
                <li>Angola</li>
                <li>Swaziland</li>
                <li>Bahrain</li>
                <li>California</li>
                <li>Europe</li>
                <li>Kazakhstan</li>
              </ul>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Let’s build something smarter, together.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Our goal is simple: to become your most reliable and proactive technology partner.
            </p>
            <Button className="cta-primary">Contact Us Today</Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
    </div>
  );
};

export default About;
