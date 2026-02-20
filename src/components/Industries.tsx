import { Building2, GraduationCap, Factory, Car, Stethoscope, ShoppingBag, Home, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import industriesVideo from "@/assets/industries-video.mp4";

const industries = [
  {
    title: "Small & Medium Enterprises (SMMEs)",
    icon: Building2,
    points: [
      "Affordable, flexible IT support packages for growing businesses.",
      "Unlimited remote assistance and proactive system monitoring.",
    ],
  },
  {
    title: "Schools & Educational Institutions",
    icon: GraduationCap,
    points: [
      "Reliable Wi‑Fi installations and classroom connectivity solutions.",
      "CCTV & access control for student and staff safety.",
    ],
  },
  {
    title: "Manufacturing & Industrial Businesses",
    icon: Factory,
    points: [
      "Robust networking, CCTV, and security solutions for factories and warehouses.",
      "Preventative maintenance to minimise costly downtime.",
    ],
  },
  {
    title: "Panel Beaters & Auto Body Shops",
    icon: Car,
    points: [
      "IT systems for insurance claims management, case tracking, and customer updates.",
      "CCTV for workshop monitoring and security.",
    ],
  },
  {
    title: "Healthcare Practices & Clinics",
    icon: Stethoscope,
    points: [
      "Secure IT infrastructure for sensitive patient data.",
      "Fast response times to keep systems running smoothly.",
    ],
  },
  {
    title: "Retail & Service Businesses",
    icon: ShoppingBag,
    points: [
      "Point‑of‑sale support, network troubleshooting, and CCTV monitoring.",
      "Scalable IT solutions that grow with your business.",
    ],
  },
  {
    title: "Residential Complexes & Property Managers",
    icon: Home,
    points: [
      "Secure Wi‑Fi networks, intercoms, and access control installations.",
      "Ongoing technical support for residents and building managers.",
    ],
  },
  {
    title: "Mining Operations",
    icon: Factory,
    points: [
      "Ruggedised networking, fibre backbones, and reliable Wi‑Fi for remote and harsh environments.",
      "CCTV, access control, and monitoring solutions for safety and compliance.",
    ],
  },
  {
    title: "Fleet & Telematics Companies",
    icon: Truck,
    points: [
      "Installation of telematics units, GPS tracking, dashcams, and IoT sensors across vehicle fleets.",
      "Remote monitoring, reporting, and preventative maintenance workflows to manage performance.",
    ],
  }
];

const Industries = () => {
  return (
    <section id="industries" aria-labelledby="industries-heading" className="relative py-16 sm:py-20 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={industriesVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/92"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <header className="mx-auto max-w-3xl text-center mb-12">
          <h2 id="industries-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Companies & Industries We Support
          </h2>
          <p className="mt-4 text-muted-foreground">
            At Siyakha Technology, we’re proud to deliver award‑winning IT solutions to a diverse range of clients across South Africa. From small start‑ups to established enterprises, our services are designed to meet the unique needs of every organisation we work with.
          </p>
        </header>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map(({ title, icon: Icon, points }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  {points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="mt-12 mx-auto max-w-3xl text-center">
          <h3 className="text-xl font-semibold text-foreground">Why Businesses Choose Us</h3>
          <p className="mt-3 text-muted-foreground">
            Local expertise in Johannesburg, tailored solutions for SMMEs through to enterprises, and a trusted, proactive partnership.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/contact" aria-label="Contact us about IT support">Contact Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="tel:+27815012993" aria-label="Call Siyakha Technology on 081 501 2993">Call 081 501 2993</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="mailto:accounts@siyakhatechnology.co.za" aria-label="Email Siyakha Technology">accounts@siyakhatechnology.co.za</a>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Industries;
