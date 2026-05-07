import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import CaseStudyCard from "@/components/site/CaseStudyCard";
import { CASE_STUDIES } from "@/content/caseStudies";
import {
  Network,
  Wifi,
  ShieldCheck,
  Headphones,
  Smartphone,
  Monitor,
  BookOpen,
} from "lucide-react";

const Schools = () => (
  <ServicePageTemplate
    seoTitle="School IT Solutions South Africa | Classroom Networking & CCTV | Siyakha"
    seoDescription="Classroom networking, school Wi-Fi, CCTV, access control, IT support and smart-classroom systems for South African schools — delivered by Siyakha Technology."
    path="/schools"
    serviceType="School Technology Solutions"
    overline="Schools · Education · Campuses"
    headlineLead="Technology solutions"
    headlineItalic="for schools"
    body="Reliable classroom networking, secure surveillance and IT support that lets teachers teach — and IT coordinators sleep at night. Built for South African schools."
    primaryCtaKind="Free Network Assessment"
    primaryCtaLabel="Request a School Tech Assessment"
    capabilitiesOverline="Built for schools"
    capabilitiesHeading={
      <>
        Connectivity, security and
        <br />
        <span className="italic font-extralight">smart classrooms</span>.
      </>
    }
    capabilities={[
      { icon: Network, title: "Classroom Networking", body: "Structured Cat6 cabling, data points and managed switching across every classroom." },
      { icon: Wifi, title: "Wi-Fi Infrastructure", body: "Campus-wide UniFi or Ubiquiti Wi-Fi engineered for high-density learner devices." },
      { icon: ShieldCheck, title: "CCTV & Access Control", body: "Cameras at gates, perimeters and high-traffic zones, with access control for staff." },
      { icon: Headphones, title: "IT Support", body: "Remote and on-site support for teachers, admin staff and computer labs." },
      { icon: Smartphone, title: "Device Management", body: "Centralised management of laptops, tablets and smartboards across the school." },
      { icon: Monitor, title: "Smart Classroom Systems", body: "Smartboards, projectors and AV integrations that actually get used." },
      { icon: BookOpen, title: "LMS Integration", body: "Wi-Fi, networking and authentication aligned with your learner management system." },
    ]}
    whatsappMessage="Hi Siyakha, our school would like a free technology assessment."
    finalCtaHeadlineLead="Let's assess your"
    finalCtaHeadlineItalic="school's technology"
    finalCtaBody="A free school technology assessment — we walk your campus, audit what you have and design what you actually need."
    finalCtaKind="Free Network Assessment"
    finalCtaLabel="Request School Assessment"
    extraSection={
      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Schools we've delivered for
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              Real schools.
              <br />
              <span className="italic font-extralight">Real infrastructure</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.filter((c) => c.industry.toLowerCase().includes("school") || c.industry.toLowerCase().includes("education")).map((s) => (
              <CaseStudyCard key={s.slug} study={s} />
            ))}
          </div>
        </div>
      </section>
    }
  />
);

export default Schools;