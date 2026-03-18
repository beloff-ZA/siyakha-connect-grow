import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wifi, Monitor, Shield, Server, GraduationCap, Wrench } from "lucide-react";

const PAGE_URL = "/services/school-it-support";
const TITLE = "IT Support for Schools | School IT Services South Africa | Siyakha";
const DESCRIPTION = "Specialist IT support for schools in South Africa. Network upgrades, computer lab setup, Wi-Fi, CCTV, exam system stability, and managed IT services for primary and high schools.";

const SchoolItSupport = () => {
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
      { "@type": "ListItem", position: 3, name: "School IT Support", item: `${origin}${PAGE_URL}` },
    ],
  }), [origin]);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "School IT Support",
    serviceType: "IT support for schools and education",
    provider: { "@type": "Organization", name: "Siyakha Technology", telephone: "+27 81 501 2993" },
    areaServed: ["South Africa", "Johannesburg", "Cape Town", "Gauteng"],
    audience: { "@type": "EducationalAudience", name: "Schools and Educational Institutions" },
    url: `${origin}${PAGE_URL}`,
  }), [origin]);

  const faqJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What IT services does Siyakha provide for schools?",
        acceptedAnswer: { "@type": "Answer", text: "We provide complete IT support for schools including network infrastructure, Wi-Fi coverage, computer lab setup and maintenance, CCTV and access control, exam system stability, Microsoft 365 for Education, and ongoing managed IT support." }
      },
      {
        "@type": "Question",
        name: "Can you help stabilise our computer lab before exams?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, we specialise in preparing school computer labs for exam periods. We ensure all workstations, networks, and software are stable and reliable, reducing the risk of downtime during critical assessments." }
      },
      {
        "@type": "Question",
        name: "Do you work with both primary and high schools?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, we support primary schools, high schools, and private colleges across South Africa. Our solutions scale from small schools with a single lab to large campuses with multiple buildings." }
      },
      {
        "@type": "Question",
        name: "Can you install Wi-Fi across an entire school campus?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. We design and deploy enterprise-grade Wi-Fi systems that cover classrooms, halls, sports fields, and admin buildings — ensuring reliable connectivity for staff, students, and visitors." }
      },
      {
        "@type": "Question",
        name: "Is Siyakha BEE-compliant for school procurement?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, Siyakha Technology is a BEE Level 1 certified ICT company, meeting the procurement and compliance requirements of government and independent schools." }
      },
    ]
  }), []);

  const services = [
    { icon: Wifi, title: "Campus-Wide Wi-Fi", desc: "Enterprise-grade Wi-Fi covering classrooms, halls, sports fields, and admin buildings. Separate networks for staff, students, and guests." },
    { icon: Monitor, title: "Computer Lab Setup & Support", desc: "Full lab installations, NComputing thin-client solutions, and ongoing maintenance to ensure exam readiness and daily reliability." },
    { icon: Shield, title: "CCTV & Campus Security", desc: "HD surveillance cameras, access control systems, and remote monitoring to protect learners, staff, and school property." },
    { icon: Server, title: "Network Infrastructure", desc: "Structured cabling (Cat6/Cat6A), server rooms, managed switches, and fibre backbone design for multi-building campuses." },
    { icon: GraduationCap, title: "Microsoft 365 for Education", desc: "Deployment and management of Microsoft Teams, SharePoint, and cloud email for schools — enabling digital classrooms and collaboration." },
    { icon: Wrench, title: "Managed IT Support", desc: "Proactive monitoring, helpdesk, and on-site engineers dedicated to your school. Predictable monthly costs, no surprise IT bills." },
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
              <BreadcrumbItem><span className="text-muted-foreground">School IT Support</span></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">IT Support for Schools — Reliable, Secure & Exam-Ready</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Siyakha Technology provides specialist IT services for schools across South Africa. From computer lab stability during exams to campus-wide Wi-Fi and CCTV, we keep your school's technology running so educators can focus on teaching.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a School IT Assessment</Button></Link>
              <a href="tel:+27815012993" className="inline-flex"><Button variant="outline">Call 081 501 2993</Button></a>
            </div>
          </div>
        </section>

        {/* Case Study callout */}
        <section className="py-8 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl flex flex-col md:flex-row items-center gap-4">
            <GraduationCap className="w-10 h-10 text-primary flex-shrink-0" />
            <div>
              <p className="text-foreground font-medium">Proven Track Record in Education</p>
              <p className="text-muted-foreground text-sm">See how we upgraded the full IT infrastructure at Marist Brothers schools in Johannesburg and Cape Town — from structured cabling and server rooms to campus-wide Wi-Fi and CCTV.</p>
            </div>
            <Link to="/projects/marist-brothers-linmeyer" className="flex-shrink-0">
              <Button variant="outline" size="sm">View Case Study</Button>
            </Link>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-2xl font-semibold text-foreground">IT Services We Provide for Schools</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map(s => (
                <div key={s.title} className="p-6 rounded-lg border border-border bg-card">
                  <s.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exam Readiness */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground">Exam-Ready Computer Labs</h2>
            <p className="text-muted-foreground mt-3">
              Nothing is more stressful than a computer lab failure during exam season. Our <strong>exam readiness programme</strong> ensures your labs are stable, tested, and supported before, during, and after assessment periods.
            </p>
            <ul className="mt-4 space-y-2 text-muted-foreground list-disc pl-5">
              <li>Full hardware and software audit of all lab workstations</li>
              <li>Network stress testing to ensure stable connectivity under load</li>
              <li>UPS and power protection to prevent data loss during load shedding</li>
              <li>On-site engineer standby during critical exam windows</li>
              <li>NComputing thin-client solutions to reduce hardware costs and simplify management</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions — School IT</h2>
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
            <h2 className="text-2xl font-semibold text-foreground">Partner With the IT Company Schools Trust</h2>
            <p className="text-muted-foreground mt-2">Whether you're a small primary school or a large high school campus, Siyakha Technology delivers the IT infrastructure and support your school needs to thrive in a digital learning environment.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Get a School IT Quote</Button></Link>
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

export default SchoolItSupport;
