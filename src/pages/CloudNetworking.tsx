import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import {
  Cable,
  Wifi,
  Network,
  Server,
  Radio,
  Cloud,
  Lock,
  Laptop,
} from "lucide-react";

const CloudNetworking = () => (
  <ServicePageTemplate
    seoTitle="Networking & Cloud Infrastructure South Africa | Siyakha Technology"
    seoDescription="Structured cabling, UniFi & Ubiquiti Wi-Fi, switching, fibre, cloud backups, VPN and hybrid-work infrastructure — designed and installed by Siyakha Technology."
    path="/cloud-networking"
    serviceType="Cloud & Networking"
    overline="Networking · Cloud · Connectivity"
    headlineLead="Reliable networking &"
    headlineItalic="cloud infrastructure"
    body="From the cable in the wall to the cloud in the data centre — we engineer, install and support the connectivity your business runs on."
    primaryCtaKind="Free Wi-Fi Performance Check"
    primaryCtaLabel="Free Wi-Fi & Network Check"
    capabilitiesOverline="What we deliver"
    capabilitiesHeading={
      <>
        Cabling. Wi-Fi. Switching. Cloud.
        <br />
        <span className="italic font-extralight">All under one roof</span>.
      </>
    }
    capabilities={[
      { icon: Cable, title: "Structured Cabling", body: "Cat6/Cat6A and fibre cabling, properly trayed, labelled and Fluke-certified." },
      { icon: Wifi, title: "Wi-Fi Design", body: "Heat-mapped Wi-Fi design that works under load — not just on a quiet Sunday." },
      { icon: Network, title: "UniFi Deployments", body: "End-to-end UniFi networks: gateways, switches, access points and cloud management." },
      { icon: Server, title: "Switching Infrastructure", body: "Managed L2/L3 switching with VLANs, QoS and PoE engineered for your workload." },
      { icon: Radio, title: "Fibre Connectivity", body: "Site-to-site fibre, point-to-point links and ISP last-mile coordination." },
      { icon: Cloud, title: "Cloud Backups", body: "Automated, encrypted backups with tested restores — your data lives somewhere safe." },
      { icon: Lock, title: "VPN Solutions", body: "Secure remote access for staff, branches and contractors." },
      { icon: Laptop, title: "Hybrid Work Solutions", body: "Microsoft 365, Teams, collaboration and remote-access setups for hybrid teams." },
    ]}
    whatsappMessage="Hi Siyakha, I'd like a free Wi-Fi and network performance check."
    finalCtaHeadlineLead="Let's check your"
    finalCtaHeadlineItalic="network performance"
    finalCtaBody="Free Wi-Fi and network performance check. We measure coverage, capacity and bottlenecks — and show you exactly what's slowing you down."
    finalCtaKind="Free Wi-Fi Performance Check"
    finalCtaLabel="Book Free Wi-Fi Check"
  />
);

export default CloudNetworking;