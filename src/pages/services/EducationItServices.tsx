import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Laptop, Wifi, Shield, Users, Cloud } from "lucide-react";

const PAGE_URL = "/services/education-it-services";
const TITLE = "Education IT Services South Africa | IT for Schools & Universities | Siyakha";
const DESCRIPTION = "Comprehensive education IT services for schools, colleges and universities in South Africa. Digital classroom solutions, campus networks, e-learning platforms, and managed IT support by Siyakha Technology.";

const EducationItServices = () => {
  useEffect(() => {
    document.title = TITLE;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(key, value); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", DESCRIPTION);
    ensureMeta("property", "og:title", TITLE);
    ensureMeta("property", "og:description", DESCRIPTION);
    ensureMeta("property", "og:type", "article");
    ensureMeta("property", "og:url", `${window.location.origin}${PAGE_URL}`);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}${PAGE_URL}`);
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const breadcrumbJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${origin}/services` },
      { "@type": "ListItem", position: 3, name: "Education IT Services", item: `${origin}${PAGE_URL}` },
    ],
  }), [origin]);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Education IT Services",
    serviceType: "IT services for education sector",
    provider: { "@type": "Organization", name: "Siyakha Technology", telephone: "+27 81 501 2993" },
    areaServed: ["South Africa"],
    audience: { "@type": "EducationalAudience", name: "Schools, Colleges, and Universities" },
    url: `${origin}${PAGE_URL}`,
  }), [origin]);

  const faqJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What makes education IT different from regular business IT?",
        acceptedAnswer: { "@type": "Answer", text: "Education IT requires unique considerations: term-based scheduling, exam system reliability, child-safety compliance, high-density Wi-Fi for BYOD, multi-building campus coverage, and budget-conscious solutions. We understand these needs and tailor our services accordingly." }
      },
      {
        "@type": "Question",
        name: "Do you support e-learning and digital classroom platforms?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, we deploy and support Microsoft Teams for Education, Google Classroom integrations, interactive displays, and classroom playback technology. We help schools transition to hybrid and blended learning models." }
      },
      {
        "@type": "Question",
        name: "Can you provide IT support during school holidays for upgrades?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. We schedule major infrastructure upgrades, server migrations, and network overhauls during school holidays to minimise disruption to teaching and learning." }
      },
      {
        "@type": "Question",
        name: "Do you work with both independent and government schools?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. As a BEE Level 1 certified ICT company, we meet government procurement requirements and work with both independent and public schools across South Africa." }
      },
    ]
  }), []);

  const solutions = [
    { icon: Laptop, title: "Digital Classrooms", desc: "Interactive displays, lesson recording and playback systems, and collaboration tools that transform traditional classrooms into modern learning spaces." },
    { icon: Wifi, title: "Campus Connectivity", desc: "High-density Wi-Fi design supporting hundreds of concurrent devices, structured cabling, and fibre backbone for multi-building campuses." },
    { icon: Cloud, title: "Cloud & E-Learning", desc: "Microsoft 365 for Education, cloud-based learning management systems, and secure data storage for student records and admin systems." },
    { icon: Shield, title: "Safety & Compliance", desc: "Content filtering, student-safe internet access, CCTV surveillance, access control, and POPIA-compliant data management." },
    { icon: Users, title: "NComputing & Thin Clients", desc: "Cost-effective computer lab solutions using NComputing technology — reduce hardware costs by up to 70% while simplifying management." },
    { icon: BookOpen, title: "Exam System Readiness", desc: "Pre-exam audits, stress testing, UPS protection, and on-site standby engineers to ensure zero downtime during assessments." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 lg:px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/services">Services</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><span className="text-muted-foreground">Education IT Services</span></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Education IT Services — Technology That Powers Learning</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              From primary schools to universities, Siyakha Technology delivers the IT infrastructure, support, and digital tools that modern education demands. We help institutions embrace technology while keeping systems secure, reliable, and budget-friendly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Get an Education IT Quote</Button></Link>
              <Link to="/services/school-it-support" className="inline-flex"><Button variant="outline">School-Specific IT →</Button></Link>
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-8 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold text-primary">50+</p><p className="text-sm text-muted-foreground">Schools Supported</p></div>
              <div><p className="text-2xl font-bold text-primary">BEE L1</p><p className="text-sm text-muted-foreground">Certified</p></div>
              <div><p className="text-2xl font-bold text-primary">5+</p><p className="text-sm text-muted-foreground">Years in Education IT</p></div>
              <div><p className="text-2xl font-bold text-primary">4.9★</p><p className="text-sm text-muted-foreground">Client Rating</p></div>
            </div>
          </div>
        </section>

        {/* Solutions grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-2xl font-semibold text-foreground">Our Education Technology Solutions</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map(s => (
                <div key={s.title} className="p-6 rounded-lg border border-border bg-card">
                  <s.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case studies */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground">Education Projects We've Delivered</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-foreground">Marist Brothers Linmeyer</h3>
                <p className="text-muted-foreground text-sm mt-2">Complete network rebuild, server room, structured cabling, CCTV, and campus-wide Wi-Fi for 800+ learners.</p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-foreground">Marist Brothers Cape Town</h3>
                <p className="text-muted-foreground text-sm mt-2">Cat6 cabling, outdoor access points, and network infrastructure upgrade across the Cape Town campus.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions — Education IT</h2>
            <div className="mt-6 space-y-4">
              {faqJson.mainEntity.map((q, i) => (
                <details key={i} className="group border border-border rounded-lg p-4">
                  <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                    {q.name}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground text-sm">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground">Let's Build the Future of Learning Together</h2>
            <p className="text-muted-foreground mt-2">Contact Siyakha Technology for a no-obligation consultation on how we can transform your institution's IT infrastructure.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Consultation</Button></Link>
              <a href="mailto:accounts@siyakhatechnology.co.za" className="inline-flex"><Button variant="secondary">Email Us</Button></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
    </div>
  );
};

export default EducationItServices;
