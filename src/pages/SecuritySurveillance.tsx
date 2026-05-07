import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import {
  Camera,
  KeyRound,
  Eye,
  Brain,
  Radar,
  Building2,
  GraduationCap,
} from "lucide-react";

const SecuritySurveillance = () => (
  <ServicePageTemplate
    seoTitle="AI CCTV & Surveillance Installers South Africa | Siyakha Technology"
    seoDescription="AI-powered CCTV, access control, remote monitoring, perimeter detection and commercial surveillance — designed, installed and supported by Siyakha Technology across South Africa."
    path="/security-surveillance"
    serviceType="Security & Surveillance"
    overline="Security · Surveillance · AI Analytics"
    headlineLead="AI-powered security"
    headlineItalic="infrastructure"
    body="Siyakha designs and installs intelligent surveillance systems that don't just record events — they detect them in real time, classify the threat and dispatch a response."
    primaryCtaKind="Free Security Audit"
    primaryCtaLabel="Book a Free Security Audit"
    capabilitiesOverline="What we install"
    capabilitiesHeading={
      <>
        From a single camera to
        <br />
        <span className="italic font-extralight">multi-site command centres</span>.
      </>
    }
    capabilities={[
      { icon: Camera, title: "CCTV Installations", body: "Hikvision, Dahua and HikCentral installations engineered for clarity, coverage and reliability." },
      { icon: KeyRound, title: "Access Control", body: "Biometric, card and mobile access — integrated with HR systems and visitor workflows." },
      { icon: Eye, title: "Remote Monitoring", body: "Cloud-managed live view, smart alerts and mobile apps for owners, managers and security teams." },
      { icon: Brain, title: "AI Analytics", body: "Person, vehicle, intrusion, loitering and line-cross detection with verified alerts." },
      { icon: Radar, title: "Perimeter Detection", body: "Long-range thermal, radar and PTZ camera fusion for boundary and high-risk areas." },
      { icon: Building2, title: "Commercial Security", body: "Estates, retail, warehouses and corporate sites — designed for compliance and uptime." },
      { icon: GraduationCap, title: "School Surveillance", body: "Camera coverage tuned for schools — gates, perimeters, classrooms and high-traffic zones." },
    ]}
    whatsappMessage="Hi Siyakha, I'd like to book a free security audit."
    finalCtaHeadlineLead="Let's audit your"
    finalCtaHeadlineItalic="security posture"
    finalCtaBody="Free on-site security audit. We'll walk your premises, identify blind spots and design a system that actually protects what matters."
    finalCtaKind="Free Security Audit"
    finalCtaLabel="Book Free Security Audit"
  />
);

export default SecuritySurveillance;