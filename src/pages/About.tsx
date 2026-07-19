import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadMagnetDialog from "@/components/leads/LeadMagnetDialog";
import InstagramGallery from "@/components/gallery/InstagramGallery";
import { Compass, Target, HeartHandshake, Award, ArrowLeft } from "lucide-react";
import engineerFibreImg from "@/assets/team-engineer-fibre.png";
import nikitaSiteImg from "@/assets/team-nikita-site-check.png";

const VALUES = [
  { icon: Compass, title: "Integrity", body: "We do what we say. Quotes are honest, timelines are real and installations are documented." },
  { icon: Target, title: "Excellence", body: "Enterprise-grade workmanship on every site — small school or large estate, no exceptions." },
  { icon: HeartHandshake, title: "Partnership", body: "We treat your business like our own — long-term clients, not one-off jobs." },
  { icon: Award, title: "Faith", body: "We labour with our hands and trust God with the outcome. Every project, every site." },
];

const INDUSTRIES = ["Schools & Education", "Business & Corporate", "Security & Estates", "Hospitality", "Mining & Industrial", "Retail", "Student Accommodation"];

const About = () => (
  <div className="min-h-screen bg-background">
    <SiteSEO
      title="About Siyakha Technology — South Africa's Premium Tech Infrastructure Partner"
      description="Siyakha Technology is a full-service technology infrastructure and managed solutions company delivering smart, scalable and secure environments for schools, businesses and institutions across South Africa."
      path="/about"
    />
    <Header />

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">About Siyakha Technology</p>
          <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground leading-[1.02]">
            We build smarter
            <br />
            <span className="italic font-extralight">technology environments</span>.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">
            Siyakha Technology is a full-service technology infrastructure and managed solutions
            company — delivering smart, scalable and secure technology environments for schools,
            businesses and institutions across South Africa.
          </p>
        </div>
      </div>
    </section>

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">Our Mission</p>
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
            To give South African schools, businesses and institutions the same quality of
            technology infrastructure available anywhere in the world — engineered properly,
            supported continuously and built to last.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">Our Vision</p>
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
            To become the most trusted technology infrastructure partner across the continent —
            known for excellence, accountability and the integrity behind every installation we
            deliver.
          </p>
        </div>
      </div>
    </section>

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-10">Core Values</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/15 border border-foreground/15">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background p-6 md:p-8">
              <Icon className="w-7 h-7 text-foreground mb-5" strokeWidth={1.25} />
              <div className="font-display text-lg text-foreground mb-2 tracking-tight">{title}</div>
              <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">Industries We Serve</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((i) => (
            <span key={i} className="text-[11px] uppercase tracking-[0.22em] text-foreground/75 border border-foreground/20 px-3 py-1.5">
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-10">On The Ground</p>
        <div className="grid md:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
          <figure className="bg-background">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={engineerFibreImg}
                alt="Siyakha engineer terminating fibre on-site at a client comms cabinet"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="px-5 py-4 text-[11px] uppercase tracking-[0.24em] text-foreground/70">
              Our engineer on-site — terminating fibre at a client comms cabinet
            </figcaption>
          </figure>
          <figure className="bg-background">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={nikitaSiteImg}
                alt="Nikita Jacobs, Director at Siyakha Technology, inspecting a labelled patch panel on-site"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="px-5 py-4 text-[11px] uppercase tracking-[0.24em] text-foreground/70">
              Nikita Jacobs — checking the site, every install signed off
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <InstagramGallery eyebrow="From Our Instagram" title="On site, on the ground" intro="A rolling look at recent installs — racks, cabling, cameras, Wi-Fi. Follow @siyakhatech for more." />

    <section className="bg-foreground text-background">
      <div className="container mx-auto px-6 lg:px-10 py-20">
        <div className="max-w-3xl">
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
            Let's build something <span className="italic font-extralight">remarkable</span>.
          </h2>
          <div className="mt-10">
            <LeadMagnetDialog
              kind="Schedule a Consultation"
              context="About page CTA"
              trigger={
                <button className="bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors">
                  Schedule a Consultation
                </button>
              }
            />
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default About;