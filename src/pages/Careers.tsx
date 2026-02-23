import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/careers/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Heart, Rocket, Mail } from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string;
  department: string;
  employment_type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const Careers = () => {

  useEffect(() => {
    const title = "Careers | Join Siyakha Technology";
    const description = "Explore career opportunities at Siyakha Technology. We're hiring engineers, sales professionals, and support specialists. Apply now!";
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
    ensureMeta("property", "og:url", `${window.location.origin}/careers`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/careers`);
  }, []);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
  });

  const benefits = [
    {
      icon: Briefcase,
      title: "Exciting Projects",
      description: "Work on diverse ICT projects across education, retail, and enterprise sectors"
    },
    {
      icon: Users,
      title: "Collaborative Team",
      description: "Join a supportive team of skilled professionals who share knowledge"
    },
    {
      icon: Heart,
      title: "Work-Life Balance",
      description: "Flexible work arrangements and remote options available"
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description: "Clear career paths with training and certification opportunities"
    }
  ];

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    hiringOrganization: {
      "@type": "Organization",
      name: "Siyakha Technology",
      url: "https://siyakhatechnology.co.za"
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "ZA",
        addressRegion: "Gauteng"
      }
    }
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-primary/90">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
                We're Hiring
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Build Your Career With <span className="text-accent">Siyakha</span>
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Join our team of ICT professionals making a difference across South Africa. We're always looking for talented individuals passionate about technology and client success.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#open-positions">
                  <Button className="cta-primary text-lg px-8 py-6">
                    View Open Positions
                  </Button>
                </a>
                <a href="mailto:careers@siyakhatechnology.co.za">
                  <Button variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Your CV
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Why Join Siyakha?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We believe in investing in our people and creating an environment where everyone can thrive.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="glass p-6 rounded-xl text-center group hover:bg-accent/5 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                    <benefit.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions" className="py-16 md:py-24 scroll-mt-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Open Positions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our current opportunities and find the right role for you.
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No Open Positions</h3>
                <p className="text-muted-foreground mb-6">
                  We don't have any open positions right now, but we're always interested in hearing from talented individuals.
                </p>
                <a href="mailto:careers@siyakhatechnology.co.za">
                  <Button className="cta-primary">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Your CV
                  </Button>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* General Applications */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Don't See a Fit? Send Us Your CV Anyway
              </h2>
              <p className="text-muted-foreground mb-6">
                We're always on the lookout for talented engineers and support specialists (L1–L3). If you're passionate about ICT and client success, we'd love to hear from you.
              </p>
              <div className="space-y-3 text-muted-foreground mb-8">
                <p>
                  <strong className="text-foreground">Email:</strong>{" "}
                  <a href="mailto:careers@siyakhatechnology.co.za" className="text-accent hover:underline">
                    careers@siyakhatechnology.co.za
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Roles we commonly hire:</strong> Network Engineers, Security Technicians, Cloud Specialists, Desktop Support (L1/L2/L3), Project Coordinators, and Sales Representatives.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Careers;
